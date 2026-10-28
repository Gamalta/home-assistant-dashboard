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

// Elle ne s'affiche plus que depuis le menu rapide (ADR 0041).
test('ne propose plus la carte des températures', async ({page}) => {
  await page.goto('/');
  await openSystemModal(page);
  await expect(page.getByText('Ombres', {exact: true})).toBeVisible();
  await expect(page.getByText('Carte des températures')).toHaveCount(0);
});

// Le panneau d'essai se pose sur la vue 3D, à la place de la modale.
async function openLightingTrial(page: Page) {
  await openSystemModal(page);
  await page
    .getByRole('button', {name: "Essayer l'éclairage selon l'heure"})
    .click();
  const trial = page.getByRole('region', {name: "Essai de l'éclairage"});
  await expect(trial).toBeVisible();
  await expect(page.getByRole('heading', {name: 'Système'})).toBeHidden();
  return trial;
}

test('simule une heure pour essayer le jour et la nuit', async ({page}) => {
  // L'heure opposée à la période réelle, pour voir le thème basculer.
  const hour = new Date().getHours();
  const day = hour >= 6 && hour < 16;
  const [simulated, label, theme] = day
    ? [22, 'Heure 22:00', /dark/]
    : [12, 'Heure 12:00', /light/];
  await page.goto('/');
  const trial = await openLightingTrial(page);
  await expect(trial.getByText('Heure réelle')).toBeVisible();

  // Début de la journée, puis 10 h par PageUp et 15 min par flèche.
  await trial.getByRole('slider', {name: /^Heure/}).focus();
  await page.keyboard.press('Home');
  for (let i = 0; i < Math.floor(simulated / 10); i++) {
    await page.keyboard.press('PageUp');
  }
  for (let i = 0; i < (simulated % 10) * 4; i++) {
    await page.keyboard.press('ArrowRight');
  }
  await expect(trial.getByText(label)).toBeVisible();
  await expect(page.locator('html')).toHaveClass(theme);

  // Fermer l'essai revient à l'heure réelle.
  await trial.getByRole('button', {name: "Fermer l'essai"}).click();
  await expect(trial).toBeHidden();
  await expect(page.locator('html')).not.toHaveClass(theme);
});
