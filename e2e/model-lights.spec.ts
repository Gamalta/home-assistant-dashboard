import type {Page} from '@playwright/test';
import {expect, test, waitForScene} from './fixtures';

declare global {
  interface Window {
    __spotLights: number;
  }
}

const spotLights = (page: Page) => page.evaluate(() => window.__spotLights);

test.beforeEach(async ({page}) => {
  // Nombre de spots visibles, lu dans le dernier shader compilé par three.
  await page.addInitScript(() => {
    const {shaderSource} = WebGL2RenderingContext.prototype;
    WebGL2RenderingContext.prototype.shaderSource = function (shader, source) {
      const count = source.match(/spotLights\[ (\d+) \]/)?.[1];
      if (count) window.__spotLights = Number(count);
      shaderSource.call(this, shader, source);
    };
  });
  await page.goto('/');
  await waitForScene(page);
});

test('un groupe allume la lumière 3D de chacun de ses membres', async ({
  page,
}) => {
  const before = await spotLights(page);

  // Le groupe du couloir réunit ses deux spots.
  await page.evaluate(() =>
    window.__mockSetState?.('light.corridor_spots', 'on'),
  );
  await expect.poll(() => spotLights(page)).toBe(before + 2);
});

test('un ruban LED allume ses quatre spots', async ({page}) => {
  const before = await spotLights(page);

  await page.evaluate(() =>
    window.__mockSetState?.('light.living_room_led_strip', 'on'),
  );
  await expect.poll(() => spotLights(page)).toBe(before + 4);
});
