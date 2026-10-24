import {Page} from '@playwright/test';
import {expect, test, waitForScene} from './fixtures';

// Comme pour une lumière, un appui long ouvre la modale (un appui court bascule).
async function openModal(page: Page, button: string, title: string) {
  await waitForScene(page);
  await page.getByRole('button', {name: button, exact: true}).hover();
  await page.mouse.down();
  await expect(
    page.getByRole('heading', {name: title, exact: true}),
  ).toBeVisible();
  await page.mouse.up();
}

test.beforeEach(async ({page}) => {
  await page.goto('/');
});

async function openStripEffects(page: Page) {
  await openModal(page, 'Bandeau LED', 'Lumière');
  await page.getByRole('button', {name: 'Effets'}).click();
}

test('choisit un effet', async ({page}) => {
  await openStripEffects(page);

  const solid = page.getByRole('button', {name: 'Solid'});
  const rainbow = page.getByRole('button', {name: 'Rainbow', exact: true});
  await expect(solid).toHaveAttribute('aria-pressed', 'true');
  await rainbow.click();
  await expect(rainbow).toHaveAttribute('aria-pressed', 'true');
  await expect(solid).toHaveAttribute('aria-pressed', 'false');
});

test('règle un bandeau LED', async ({page}) => {
  await openStripEffects(page);

  const preset = page.getByRole('combobox', {name: 'Préréglage'});
  await preset.click();
  await page.getByRole('option', {name: 'Cinéma'}).click();
  await expect(preset).toHaveText('Cinéma');

  const speed = page.getByRole('slider', {name: 'Vitesse'});
  await speed.focus();
  await speed.press('End');
  await expect(page.getByRole('slider', {name: 'Vitesse'})).toHaveAttribute(
    'aria-valuenow',
    '255',
  );
});

test('allume l’ambilight et change sa source', async ({page}) => {
  await openModal(page, 'Ambilight', 'Ambilight');

  const power = page.getByRole('switch', {name: 'Allumé'});
  await expect(power).not.toBeChecked();
  await power.check();
  await expect(power).toBeChecked();

  const video = page.getByRole('button', {name: 'Vidéo'});
  const effect = page.getByRole('button', {name: 'Effet', exact: true});
  const candle = page.getByRole('button', {name: 'Candle'});
  await expect(video).toHaveAttribute('aria-pressed', 'true');

  await effect.click();
  await candle.click();
  await expect(candle).toHaveAttribute('aria-pressed', 'true');

  await video.click();
  await expect(video).toHaveAttribute('aria-pressed', 'true');
  await effect.click();
  await expect(candle).toHaveAttribute('aria-pressed', 'false');
});

test('rafraîchit l’aperçu des LED seulement modale ouverte', async ({page}) => {
  const requests: string[] = [];
  page.on('request', request => {
    if (request.url().includes('/ambilight/')) requests.push(request.url());
  });

  await openModal(page, 'Ambilight', 'Ambilight');
  await expect(page.getByRole('img', {name: 'Aperçu des LED'})).toBeVisible();
  await expect.poll(() => requests.length).toBeGreaterThanOrEqual(2);

  // Le bouton de fermeture n'a pas de nom : c'est le dernier de l'en-tête.
  const title = page.getByRole('heading', {name: 'Ambilight', exact: true});
  await title.locator('..').getByRole('button').last().click();
  await expect(title).toBeHidden();
  const count = requests.length;
  // Plus d'une période de rafraîchissement (2 s) sans aucune image demandée.
  await page.waitForTimeout(3000);
  expect(requests).toHaveLength(count);
});
