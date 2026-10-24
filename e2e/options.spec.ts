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

test('garde une option graphique après rechargement', async ({page}) => {
  await page.goto('/');
  await openSystemModal(page);
  await expect(option(page, 'Debug')).not.toBeChecked();
  await option(page, 'Debug').check();
  await expect(page.getByText('Triangles')).toBeVisible();

  await page.reload();
  await openSystemModal(page);
  await expect(option(page, 'Debug')).toBeChecked();
  await expect(page.getByText('Triangles')).toBeVisible();
});
