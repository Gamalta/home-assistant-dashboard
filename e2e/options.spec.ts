import {Page} from '@playwright/test';
import {expect, openSystemModal, test, waitForScene} from './fixtures';

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

// Capture du canvas, sans les boutons des pièces.
const canvasShot = (page: Page) =>
  page
    .locator('canvas')
    .screenshot({style: 'div:has(> canvas) ~ div {visibility: hidden}'});

test('redessine la scène après un changement d’option', async ({page}) => {
  await page.goto('/');
  await waitForScene(page);
  // Attend la fin du fondu d'allumage des lumières.
  let before = await canvasShot(page);
  await expect
    .poll(
      async () => {
        const previous = before;
        before = await canvasShot(page);
        return before.equals(previous);
      },
      {timeout: 30_000},
    )
    .toBe(true);

  await openSystemModal(page);
  await option(page, 'Murs transparents').uncheck();
  await expect(page.getByRole('progressbar')).toHaveCount(0);
  // Le bouton de fermeture n'a pas de nom : c'est le dernier de l'en-tête.
  const title = page.getByRole('heading', {name: 'Système'});
  await title.locator('..').getByRole('button').last().click();
  await expect(title).toBeHidden();

  await expect
    .poll(async () => (await canvasShot(page)).equals(before), {
      timeout: 30_000,
    })
    .toBe(false);
});

// Trop lourds pour la tablette, remplacés par le ciel et le soleil (ADR 0030).
test('ne propose plus les reflets d’environnement', async ({page}) => {
  await page.goto('/');
  await openSystemModal(page);
  await expect(page.getByText('Ombres', {exact: true})).toBeVisible();
  await expect(page.getByText("Reflets d'environnement")).toHaveCount(0);
});
