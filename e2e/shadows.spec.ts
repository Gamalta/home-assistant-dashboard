import {Page} from '@playwright/test';
import {expect, test, waitForScene} from './fixtures';

declare global {
  interface Window {
    __linkedPrograms: number;
    __quietFrames: number;
    __receiveShadow: number[];
    __canvasWidths: number[];
  }
}

// Avec les ombres, SwiftShader met plus de 100 ms par image : petite fenêtre.
test.use({viewport: {width: 640, height: 360}});

test.beforeEach(async ({page}) => {
  // Une centaine d'images d'inertie par geste, lentes en rendu logiciel.
  test.slow();
  await page.addInitScript(() => {
    window.__linkedPrograms = 0;
    window.__quietFrames = 0;
    window.__receiveShadow = [];
    window.__canvasWidths = [];
    const tick = () => {
      const width = document.querySelector('canvas')?.width;
      const widths = window.__canvasWidths;
      if (width && width !== widths[widths.length - 1]) widths.push(width);
      window.__quietFrames++;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    const proto = WebGL2RenderingContext.prototype;
    const {linkProgram, getProgramParameter, drawElements} = proto;
    const {getUniformLocation, uniform1i} = proto;
    proto.linkProgram = function (program) {
      window.__linkedPrograms++;
      linkProgram.call(this, program);
    };
    // three interroge ainsi les programmes compilés en arrière-plan.
    proto.getProgramParameter = function (program, name) {
      window.__quietFrames = 0;
      return getProgramParameter.call(this, program, name);
    };
    proto.drawElements = function (...args) {
      window.__quietFrames = 0;
      drawElements.apply(this, args);
    };
    // Valeurs successives de l'uniform receiveShadow des shaders de three.
    const receiveShadow = new WeakSet<WebGLUniformLocation>();
    proto.getUniformLocation = function (program, name) {
      const location = getUniformLocation.call(this, program, name);
      if (location && name === 'receiveShadow') receiveShadow.add(location);
      return location;
    };
    proto.uniform1i = function (location, value) {
      const values = window.__receiveShadow;
      const last = values[values.length - 1];
      if (location && receiveShadow.has(location) && last !== +value) {
        values.push(+value);
      }
      uniform1i.call(this, location, value);
    };
  });
});

// Au repos (frameloop="demand"), plus rien n'est dessiné ni compilé.
// Compter les images, et non le temps, ignore les blocages du GPU logiciel.
async function waitForRest(page: Page) {
  await expect
    .poll(() => page.evaluate(() => window.__quietFrames), {timeout: 90_000})
    .toBeGreaterThan(60);
}

async function openAtRest(page: Page, shadows: boolean) {
  await page.addInitScript(
    value => localStorage.setItem('graphics-options', JSON.stringify(value)),
    {shadows},
  );
  await page.goto('/');
  await waitForScene(page);
  await waitForRest(page);
  await page.evaluate(() => {
    window.__receiveShadow = [];
    window.__canvasWidths = [document.querySelector('canvas')!.width];
  });
}

// Luminance moyenne du canvas, sans les boutons des pièces : insensible au
// pixel près laissé par l'inertie d'OrbitControls, pas à une ombre manquante
// (environ 5 points d'écart sur la démo).
async function canvasLuminance(page: Page) {
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
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    }
    return sum / (data.length / 4);
  }, png.toString('base64'));
}

// Aller-retour, bouton maintenu : la caméra revient à sa position de départ.
async function rotate(page: Page) {
  const box = (await page.locator('canvas').boundingBox())!;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  for (const dx of [10, 20, 30, 40, 30, 20, 10, 0]) {
    await page.mouse.move(x + dx, y);
  }
}

test('ne compile aucun shader pendant une rotation, ombres activées', async ({
  page,
}) => {
  await openAtRest(page, true);
  const programs = await page.evaluate(() => window.__linkedPrograms);
  const before = await canvasLuminance(page);

  await rotate(page);
  await page.mouse.up();
  await waitForRest(page);

  expect(await page.evaluate(() => window.__linkedPrograms)).toBe(programs);
  // Ombres coupées pendant le mouvement, rétablies une seule fois au repos.
  expect(await page.evaluate(() => window.__receiveShadow)).toEqual([0, 1]);
  const after = await canvasLuminance(page);
  expect(Math.abs(after - before)).toBeLessThan(1);

  // Geste maintenu : sans ses ombres, la maison est nettement plus claire.
  await rotate(page);
  await waitForRest(page);
  expect((await canvasLuminance(page)) - after).toBeGreaterThan(2);
});

test.describe('écran haute densité', () => {
  test.use({deviceScaleFactor: 2});

  test('rétablit la définition une seule fois au relâcher', async ({page}) => {
    await openAtRest(page, false);
    const [width] = await page.evaluate(() => window.__canvasWidths);

    await rotate(page);
    await page.mouse.up();
    await waitForRest(page);

    // Définition réduite pendant le mouvement, sans aller-retour ensuite.
    expect(await page.evaluate(() => window.__canvasWidths)).toEqual([
      width,
      expect.any(Number),
      width,
    ]);
  });
});
