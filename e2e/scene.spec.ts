import {Page} from '@playwright/test';
import {expect, test, waitForScene} from './fixtures';

// Nombre de couleurs distinctes du canvas, sans les boutons des pièces.
async function countCanvasColors(page: Page) {
  const png = await page.locator('canvas').screenshot({
    style: 'div:has(> canvas) ~ div {visibility: hidden}',
  });
  return page.evaluate(async base64 => {
    const blob = await (await fetch(`data:image/png;base64,${base64}`)).blob();
    const bitmap = await createImageBitmap(blob);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext('2d')!;
    context.drawImage(bitmap, 0, 0);
    const {data} = context.getImageData(0, 0, bitmap.width, bitmap.height);
    const colors = new Set<number>();
    for (let i = 0; i < data.length; i += 4) {
      colors.add((data[i] << 16) | (data[i + 1] << 8) | data[i + 2]);
    }
    return colors.size;
  }, png.toString('base64'));
}

test('rend la maison en 3D', async ({page}) => {
  await page.goto('/');
  await waitForScene(page);

  // Canvas vide : 1 couleur ; boutons seuls : ~300 ; maison : des dizaines de milliers.
  await expect.poll(() => countCanvasColors(page)).toBeGreaterThan(1000);
});
