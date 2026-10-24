import {Page} from '@playwright/test';
import {expect, openSystemModal, test} from './fixtures';

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
