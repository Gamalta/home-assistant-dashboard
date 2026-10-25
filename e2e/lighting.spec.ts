import {Page} from '@playwright/test';
import {expect, test, waitForScene} from './fixtures';

declare global {
  interface Window {
    __linkedPrograms: number;
  }
}

// Luminance moyenne (0 à 255) du centre de la vue 3D, occupé par la maison.
async function houseLuminance(page: Page) {
  const box = (await page.locator('canvas').boundingBox())!;
  const png = await page.screenshot({
    clip: {
      x: box.x + box.width * 0.3,
      y: box.y + box.height * 0.3,
      width: box.width * 0.4,
      height: box.height * 0.4,
    },
  });
  return page.evaluate(async base64 => {
    const image = new Image();
    image.src = `data:image/png;base64,${base64}`;
    await image.decode();
    const canvas = new OffscreenCanvas(image.width, image.height);
    const context = canvas.getContext('2d')!;
    context.drawImage(image, 0, 0);
    const {data} = context.getImageData(0, 0, image.width, image.height);
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    return sum / (data.length / 4);
  }, png.toString('base64'));
}

test('la nuit tombe sur la maison sans recompiler de shader', async ({
  page,
}) => {
  test.slow();
  await page.clock.install({time: new Date(2026, 5, 21, 14)});
  await page.addInitScript(() => {
    window.__linkedPrograms = 0;
    const {linkProgram} = WebGL2RenderingContext.prototype;
    WebGL2RenderingContext.prototype.linkProgram = function (program) {
      window.__linkedPrograms++;
      linkProgram.call(this, program);
    };
  });
  await page.goto('/');
  await waitForScene(page);
  // Les lampes s'allument une à une au démarrage, chacune avec ses shaders.
  const programs = () => page.evaluate(() => window.__linkedPrograms);
  await expect
    .poll(async () => {
      const before = await programs();
      await page.waitForTimeout(1000);
      return (await programs()) - before;
    })
    .toBe(0);
  const day = await houseLuminance(page);
  const compiled = await programs();

  // La position du soleil est recalculée chaque minute.
  await page.clock.fastForward('08:00:00');
  await expect.poll(() => houseLuminance(page)).toBeLessThan(day - 10);
  expect(await programs()).toBe(compiled);
});

test('ne télécharge plus de carte d’environnement HDR', async ({page}) => {
  const hdr: string[] = [];
  page.on('request', request => {
    if (request.url().endsWith('.hdr')) hdr.push(request.url());
  });
  await page.goto('/');
  await waitForScene(page);
  expect(hdr).toEqual([]);
});
