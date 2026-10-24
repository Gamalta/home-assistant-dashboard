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

// Trop lourds pour la tablette, remplacés par le ciel et le soleil (ADR 0030).
test('ne propose plus les reflets d’environnement', async ({page}) => {
  await page.goto('/');
  await openSystemModal(page);
  await expect(page.getByText('Ombres', {exact: true})).toBeVisible();
  await expect(page.getByText("Reflets d'environnement")).toHaveCount(0);
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
