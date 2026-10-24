import {Locator, Page} from '@playwright/test';
import {expect, test, waitForScene} from './fixtures';

// Le mock allume deux prises : « Prise bureau » (85,4 W) dans la chambre 3,
// et « Prise TV » (0,8 W, donc en veille) dans le séjour.
const plugButton = (page: Page, name: string) =>
  page.getByRole('button', {name, exact: true});

// Couleurs du voyant de l'illustration (PlugView).
const LED = {
  on: 'rgb(57, 159, 255)',
  standby: 'rgb(255, 159, 10)',
  off: 'rgb(157, 162, 169)',
};

// useLongPress ouvre la modale quand le bouton reste enfoncé plus de 300 ms.
// On ne relâche qu'une fois la modale ouverte : sous charge, un relâchement
// traité avant le minuteur compterait comme un appui court.
async function openPlugModal(page: Page, name: string) {
  await plugButton(page, name).hover();
  await page.mouse.down();
  await expect(page.getByRole('heading', {name})).toBeVisible();
  await page.mouse.up();
  // L'illustration est un bouton, qui bascule la prise.
  return page.getByRole('button', {name: 'Prise', exact: true});
}

// Le voyant et la fiche n'ont pas de rôle : ils portent un data-testid.
async function expectIllustration(
  illustration: Locator,
  status: keyof typeof LED,
) {
  await expect(illustration.getByTestId('voyant')).toHaveCSS(
    'fill',
    LED[status],
  );
  await expect(illustration.getByTestId('fiche')).toHaveCSS(
    'opacity',
    status === 'off' ? '0' : '1',
  );
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
  const illustration = await openPlugModal(page, 'Prise bureau');

  await expect(page.getByRole('heading', {name: 'Allumée'})).toBeVisible();
  await expect(page.getByRole('heading', {name: '85 W'})).toBeVisible();
  await expectIllustration(illustration, 'on');

  await page.getByRole('switch', {name: 'Marche'}).click();
  await expect(page.getByRole('heading', {name: 'Éteinte'})).toBeVisible();
  await expect(page.getByRole('heading', {name: '85 W'})).toBeHidden();
  await expectIllustration(illustration, 'off');
});

test('bascule la prise en touchant l’illustration', async ({page}) => {
  const illustration = await openPlugModal(page, 'Prise bureau');
  const toggle = page.getByRole('switch', {name: 'Marche'});

  await illustration.click();
  await expect(illustration).toHaveAttribute('aria-pressed', 'false');
  await expect(toggle).not.toBeChecked();
  await expectIllustration(illustration, 'off');

  await illustration.click();
  await expect(toggle).toBeChecked();
  await expectIllustration(illustration, 'on');
});

test('signale une prise en veille', async ({page}) => {
  await expect(plugButton(page, 'Prise TV')).toHaveText('0,8 W');
  const illustration = await openPlugModal(page, 'Prise TV');

  await expect(page.getByRole('heading', {name: 'En veille'})).toBeVisible();
  await expect(page.getByRole('heading', {name: '0,8 W'})).toBeVisible();
  await expectIllustration(illustration, 'standby');
});

test('affiche la consommation dans un second onglet', async ({page}) => {
  await openPlugModal(page, 'Prise bureau');
  const history = page.getByRole('button', {name: 'Historique'});
  // Un clic pendant l'animation d'ouverture de la modale peut tomber à côté.
  await expect(history).toBeVisible();
  await history.click();

  const chart = page.getByRole('img', {name: 'Puissance', exact: true});
  await expect(chart).toBeVisible();
  await expect(chart.locator('.MuiLineChart-line')).toHaveCount(1);
  await expect(page.getByRole('heading', {name: '85 W'})).toBeVisible();

  await page.getByRole('button', {name: 'Réglage'}).click();
  await expect(chart).toBeHidden();
  await expect(page.getByRole('switch', {name: 'Marche'})).toBeVisible();
});
