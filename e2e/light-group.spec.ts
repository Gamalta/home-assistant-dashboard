import {expect, test, waitForScene} from './fixtures';

declare global {
  interface Window {
    __spotLights: number;
  }
}

test('un groupe allume la lumière 3D de chacun de ses membres', async ({
  page,
}) => {
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
  const spotLights = () => page.evaluate(() => window.__spotLights);
  const before = await spotLights();

  // Le groupe du couloir réunit ses deux spots.
  await page.evaluate(() =>
    window.__mockSetState?.('light.corridor_spots', 'on'),
  );
  await expect.poll(spotLights).toBe(before + 2);
});
