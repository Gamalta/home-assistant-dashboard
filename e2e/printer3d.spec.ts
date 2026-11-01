import {Page} from '@playwright/test';
import {expect, test, waitForScene} from './fixtures';

// Le mock fait imprimer « Support de téléphone » à l'imprimante `p1s_demo`,
// placée dans la chambre 2 de la config démo.
const printerButton = (page: Page) =>
  page.getByRole('button', {name: 'Imprimante 3D', exact: true});

// Les autres scénarios de docs/specs/imprimante-3d-p1s.md ne dépendent que de
// la modale : ils sont testés en unitaire (RoomPrinter3d.test.tsx).
test('suit l’impression depuis la scène', async ({page}) => {
  await page.goto('/');
  await waitForScene(page);
  await expect(printerButton(page)).toHaveText('42%');
  await printerButton(page).click();
  await expect(
    page.getByRole('heading', {name: 'Imprimante 3D'}),
  ).toBeVisible();

  await expect(page.getByRole('img', {name: 'Imprimante 3D'})).toBeVisible();
  await expect(
    page.getByRole('img', {name: "Aperçu de l'impression"}),
  ).toBeVisible();
  await expect(page.getByText('Support de téléphone')).toBeVisible();
  await expect(page.getByText('En cours', {exact: true})).toBeVisible();
  await expect(
    page.getByRole('progressbar', {name: 'Progression'}),
  ).toHaveAttribute('aria-valuenow', '42');
  await expect(page.getByText('Couche 126 / 300')).toBeVisible();
  await expect(page.getByText('Reste 1 h 15')).toBeVisible();
  await expect(page.getByText(/^Fin (demain )?vers \d\d:\d\d$/)).toBeVisible();
  await expect(page.getByText('Buse 219 / 220 °C')).toBeVisible();
  await expect(page.getByText('Plateau 55 / 55 °C')).toBeVisible();
  await expect(page.getByText('PLA', {exact: true})).toBeVisible();
});
