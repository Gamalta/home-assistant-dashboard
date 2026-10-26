import {Locator, Page} from '@playwright/test';
import {expect, test, waitForScene} from './fixtures';

// Le mock allume deux prises : « Prise bureau » (85,4 W) dans la chambre 3,
// et « Prise TV » (0,8 W) dans le séjour.
const outletButton = (page: Page, name: string) =>
  page.getByRole('button', {name, exact: true});

// Couleurs du voyant de l'illustration (OutletView).
const LED = {
  on: 'rgb(57, 159, 255)',
  off: 'rgb(157, 162, 169)',
};

// useLongPress ouvre la modale quand le bouton reste enfoncé plus de 300 ms.
// On ne relâche qu'une fois la modale ouverte : sous charge, un relâchement
// traité avant le minuteur compterait comme un appui court.
async function openOutletModal(page: Page, name: string) {
  await outletButton(page, name).hover();
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
  await expect(illustration.getByTestId('led')).toHaveCSS('fill', LED[status]);
  await expect(illustration.getByTestId('plug')).toHaveCSS(
    'opacity',
    status === 'on' ? '1' : '0',
  );
}

test.beforeEach(async ({page}) => {
  await page.goto('/');
  await waitForScene(page);
});

// Un test par scénario de docs/specs/prises-connectees.md.
test('bascule la prise d’un appui court', async ({page}) => {
  const outlet = outletButton(page, 'Prise bureau');
  await expect(outlet).toHaveAttribute('aria-pressed', 'true');

  await outlet.click();
  await expect(outlet).toHaveAttribute('aria-pressed', 'false');

  await outlet.click();
  await expect(outlet).toHaveAttribute('aria-pressed', 'true');
});

test('ouvre le détail de la prise d’un appui long', async ({page}) => {
  const illustration = await openOutletModal(page, 'Prise bureau');
  await expectIllustration(illustration, 'on');
  // La puissance est dans l'en-tête de la modale.
  const watts = page.getByText('85 W', {exact: true});
  await expect(watts).toBeVisible();

  const power = page.getByRole('button', {name: 'Marche'});
  await expect(power).toHaveAttribute('aria-pressed', 'true');

  await power.click();
  await expect(power).toHaveAttribute('aria-pressed', 'false');
  await expect(watts).toBeHidden();
  await expectIllustration(illustration, 'off');

  await power.click();
  await expect(power).toHaveAttribute('aria-pressed', 'true');
  await expect(watts).toBeVisible();
  await expectIllustration(illustration, 'on');
});

test('bascule la prise en touchant l’illustration', async ({page}) => {
  const illustration = await openOutletModal(page, 'Prise bureau');

  await illustration.click();
  await expect(illustration).toHaveAttribute('aria-pressed', 'false');
  await expectIllustration(illustration, 'off');

  await illustration.click();
  await expect(illustration).toHaveAttribute('aria-pressed', 'true');
  await expectIllustration(illustration, 'on');
});

test('affiche la consommation dans un second onglet', async ({page}) => {
  await openOutletModal(page, 'Prise bureau');
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
  await expect(page.getByRole('button', {name: 'Marche'})).toBeVisible();
});
