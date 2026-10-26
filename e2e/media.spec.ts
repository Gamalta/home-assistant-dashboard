import {Page} from '@playwright/test';
import {expect, test, waitForScene} from './fixtures';

// Le mock fait jouer « My Way » à la TV du séjour, pilotée par
// `remote.living_room_tv`.
const tvButton = (page: Page) =>
  page.getByRole('button', {name: 'TV du séjour', exact: true});

// Le carrousel « Raccourcis » montre aussi cette TV, avec les mêmes boutons
// et textes : on cherche dans la modale, dont l'en-tête et le contenu
// partagent le parent.
async function openMediaModal(page: Page) {
  await tvButton(page).click();
  const title = page.getByRole('heading', {name: 'TV du séjour'});
  await expect(title).toBeVisible();
  return title.locator('../..');
}

test.beforeEach(async ({page}) => {
  await page.goto('/');
  await waitForScene(page);
});

// Un test par scénario de docs/specs/telecommande-tv.md.
test('affiche le média en cours', async ({page}) => {
  await expect(tvButton(page)).toHaveText('My Way');
  const modal = await openMediaModal(page);

  await expect(modal.getByRole('img', {name: 'Visuel du média'})).toBeVisible();
  await expect(modal.getByRole('heading', {name: 'My Way'})).toBeVisible();
  await expect(modal.getByText('Calvin Harris')).toBeVisible();
});

test('met en pause puis relance la lecture', async ({page}) => {
  const modal = await openMediaModal(page);

  await modal.getByRole('button', {name: 'Pause', exact: true}).click();
  await modal.getByRole('button', {name: 'Lecture', exact: true}).click();
  await expect(
    modal.getByRole('button', {name: 'Pause', exact: true}),
  ).toBeVisible();

  await modal.getByRole('button', {name: 'Suivant'}).click();
  await expect(modal.getByRole('heading', {name: 'Human'})).toBeVisible();
  await modal.getByRole('button', {name: 'Précédent'}).click();
  await expect(modal.getByRole('heading', {name: 'My Way'})).toBeVisible();
});

test('règle le volume et coupe le son', async ({page}) => {
  await openMediaModal(page);
  const volume = page.getByRole('slider', {name: 'Volume'});

  await expect(volume).toHaveValue('30');
  await volume.focus();
  await page.keyboard.press('ArrowRight');
  await expect(volume).toHaveValue('31');

  await page.getByRole('button', {name: 'Couper le son'}).click();
  await page.getByRole('button', {name: 'Rétablir le son'}).click();
  await expect(page.getByRole('button', {name: 'Couper le son'})).toBeVisible();
});

test('change de source', async ({page}) => {
  await openMediaModal(page);
  const source = page.getByRole('combobox', {name: 'Source'});

  await expect(source).toHaveText('Apple TV');
  await source.click();
  await page.getByRole('option', {name: 'Freebox'}).click();
  await expect(source).toHaveText('Freebox');
});

test('pilote le lecteur avec le pavé directionnel', async ({page}) => {
  // Le mock trace chaque appel de service dans la console.
  const calls: unknown[] = [];
  page.on('console', async message => {
    if (message.text().startsWith('callService'))
      calls.push(await message.args()[1].jsonValue());
  });
  await openMediaModal(page);

  await page.getByRole('button', {name: 'Haut'}).click();
  await page.getByRole('button', {name: 'OK'}).click();
  await page.getByRole('button', {name: 'Retour'}).click();
  await expect
    .poll(() => calls)
    .toEqual(
      ['up', 'select', 'menu'].map(command => ({
        domain: 'remote',
        service: 'sendCommand',
        serviceData: {command: [command]},
        target: 'remote.living_room_tv',
      })),
    );
});

test('éteint puis rallume le lecteur', async ({page}) => {
  const modal = await openMediaModal(page);

  await modal.getByRole('button', {name: 'Éteindre', exact: true}).click();
  await expect(modal.getByText('Éteint', {exact: true})).toBeVisible();
  await expect(tvButton(page)).toHaveText('');

  await modal.getByRole('button', {name: 'Allumer', exact: true}).click();
  await expect(
    modal.getByRole('button', {name: 'Pause', exact: true}),
  ).toBeVisible();
  await expect(tvButton(page)).toHaveText('My Way');
});
