import {Page} from '@playwright/test';
import {expect, test, waitForScene} from './fixtures';

// Le mock fait imprimer « Support de téléphone » à l'imprimante `p1s_demo`,
// placée dans la chambre 2 de la config démo.
const printerButton = (page: Page) =>
  page.getByRole('button', {name: 'Imprimante 3D', exact: true});

// La carte média du carrousel a aussi un bouton « Pause » : on cherche dans
// la modale, dont l'en-tête et le contenu partagent le parent.
async function openPrinterModal(page: Page) {
  await printerButton(page).click();
  const title = page.getByRole('heading', {name: 'Imprimante 3D'});
  await expect(title).toBeVisible();
  return title.locator('../..');
}

test.beforeEach(async ({page}) => {
  await page.goto('/');
  await waitForScene(page);
});

// Un test par scénario de docs/specs/imprimante-3d-p1s.md. Chaque test
// recharge la scène, d'où des scénarios qui regroupent plusieurs vérifications.
test('suit l’impression depuis la scène', async ({page}) => {
  await expect(printerButton(page)).toHaveText('42%');
  await openPrinterModal(page);

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

test('pilote la lumière de la chambre et la vitesse', async ({page}) => {
  await openPrinterModal(page);
  const light = page.getByRole('button', {name: 'Lumière de la chambre'});
  const sport = page.getByRole('button', {name: 'Sport'});

  await expect(light).toHaveAttribute('aria-pressed', 'true');
  await light.click();
  await expect(light).toHaveAttribute('aria-pressed', 'false');

  await expect(sport).toHaveAttribute('aria-pressed', 'false');
  await sport.click();
  await expect(sport).toHaveAttribute('aria-pressed', 'true');
});

test('met l’impression en pause puis la reprend', async ({page}) => {
  const modal = await openPrinterModal(page);

  await modal.getByRole('button', {name: 'Pause', exact: true}).click();
  await expect(page.getByText('En pause', {exact: true})).toBeVisible();

  await page.getByRole('button', {name: 'Reprendre'}).click();
  await expect(page.getByText('En cours', {exact: true})).toBeVisible();
});

test('arrête l’impression après confirmation', async ({page}) => {
  await openPrinterModal(page);
  const stop = page.getByRole('button', {name: 'Arrêter', exact: true});

  await stop.click();
  await expect(page.getByText("Arrêter l'impression ?")).toBeVisible();
  await page.getByRole('button', {name: 'Annuler'}).click();
  await expect(page.getByText('En cours', {exact: true})).toBeVisible();

  await stop.click();
  await page.getByRole('button', {name: 'Oui, arrêter'}).click();
  await expect(page.getByText('Interrompue')).toBeVisible();
  await expect(printerButton(page)).not.toContainText('%');
});
