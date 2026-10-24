import {Page} from '@playwright/test';
import {expect, test, waitForScene} from './fixtures';

// Le dock apparaît quand la souris passe en bas de la barre latérale.
async function openSystemModal(page: Page) {
  await waitForScene(page);
  await page.mouse.move(150, 700);
  const button = page.getByRole('button', {name: 'Système'});
  // Un clic pendant l'animation d'entrée du dock peut tomber à côté.
  await expect(button.locator('..')).toHaveCSS('opacity', '1');
  await button.click();
  await expect(page.getByRole('heading', {name: 'Système'})).toBeVisible();
}

// Les interrupteurs n'ont pas de libellé associé : on passe par leur ligne.
const option = (page: Page, label: string) =>
  page.getByText(label, {exact: true}).locator('..').getByRole('switch');

// « Murs transparents » est activé par défaut. Le couper allège le rendu,
// au contraire de « Debug », trop lent avec SwiftShader en CI.
test('garde une option graphique après rechargement', async ({page}) => {
  await page.goto('/');
  await openSystemModal(page);
  await expect(option(page, 'Murs transparents')).toBeChecked();
  await option(page, 'Murs transparents').uncheck();

  await page.reload();
  await openSystemModal(page);
  await expect(option(page, 'Murs transparents')).not.toBeChecked();
});

test('ne télécharge pas le HDR avec les options par défaut', async ({page}) => {
  const hdrRequests: string[] = [];
  page.on('request', request => {
    if (request.url().includes('.hdr')) hdrRequests.push(request.url());
  });
  await page.goto('/');
  await waitForScene(page);
  expect(hdrRequests).toEqual([]);
});

test('télécharge le HDR dès que les reflets sont activés', async ({page}) => {
  await page.goto('/');
  await openSystemModal(page);
  const hdrRequest = page.waitForRequest(/\.hdr$/);
  await option(page, "Reflets d'environnement").check();
  await hdrRequest;
});
