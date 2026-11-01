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
  await openModal(page, 'TV', 'TV');

  const power = page.getByRole('switch', {name: 'Ambilight'});
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

// Rouge moins bleu d'un pixel du halo, lu avant le flou CSS.
function glowWarmth(page: Page, x: number, y: number) {
  return page.getByTestId('led-glow').evaluate(
    (canvas: HTMLCanvasElement, [x, y]) => {
      const pixel = canvas.getContext('2d')?.getImageData(x, y, 1, 1).data;
      return pixel ? pixel[0] - pixel[2] : 0;
    },
    [x, y],
  );
}

test('affiche l’image de la TV et le halo des LED en direct', async ({
  page,
}) => {
  await openModal(page, 'TV', 'TV');

  await expect(page.getByRole('img', {name: 'Image de la TV'})).toBeVisible();
  const glow = page.getByTestId('led-glow');
  await expect(glow).toHaveCount(0);

  const power = page.getByRole('switch', {name: 'Ambilight'});
  await power.check();
  // Le dégradé de la démo va de l'orange en haut à gauche au bleu en bas à droite.
  await expect.poll(() => glowWarmth(page, 3, 3)).toBeGreaterThan(150);
  await expect.poll(() => glowWarmth(page, 156, 86)).toBeLessThan(-150);

  await power.uncheck();
  await expect(glow).toHaveCount(0);
});
