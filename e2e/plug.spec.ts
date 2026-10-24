import {Page} from '@playwright/test';
import {expect, test, waitForScene} from './fixtures';

// Le mock allume deux prises : « Prise bureau » (85,4 W) dans la chambre 3,
// et « Prise TV » (0,8 W, donc en veille) dans le séjour.
const plugButton = (page: Page, name: string) =>
  page.getByRole('button', {name, exact: true});

// useLongPress ouvre la modale quand le bouton reste enfoncé plus de 300 ms.
async function openPlugModal(page: Page, name: string) {
  await plugButton(page, name).click({delay: 600});
  await expect(page.getByRole('heading', {name})).toBeVisible();
}

test.beforeEach(async ({page}) => {
  await page.goto('/');
  await waitForScene(page);
});

// Un test par scénario de docs/specs/prises-connectees.md.
test('bascule la prise d’un appui court', async ({page}) => {
  const plug = plugButton(page, 'Prise bureau');
  await expect(plug).toHaveAttribute('aria-pressed', 'true');
  await expect(plug).toHaveText('85 W');

  await plug.click();
  await expect(plug).toHaveAttribute('aria-pressed', 'false');
  await expect(plug).toHaveText('');

  await plug.click();
  await expect(plug).toHaveAttribute('aria-pressed', 'true');
  await expect(plug).toHaveText('85 W');
});

test('ouvre le détail de la prise d’un appui long', async ({page}) => {
  await openPlugModal(page, 'Prise bureau');

  await expect(page.getByRole('heading', {name: '85 W'})).toBeVisible();
  await expect(page.getByText('Allumée', {exact: true})).toBeVisible();
  await expect(
    page.getByRole('img', {name: 'Puissance des dernières 24 h'}),
  ).toBeVisible();

  await page.getByRole('switch', {name: 'Marche'}).click();
  await expect(page.getByText('Éteinte', {exact: true})).toBeVisible();
  await expect(page.getByRole('heading', {name: '85 W'})).toBeHidden();
});

test('signale une prise en veille', async ({page}) => {
  await expect(plugButton(page, 'Prise TV')).toHaveText('0,8 W');
  await openPlugModal(page, 'Prise TV');

  await expect(page.getByRole('heading', {name: '0,8 W'})).toBeVisible();
  await expect(page.getByText('En veille', {exact: true})).toBeVisible();
});
