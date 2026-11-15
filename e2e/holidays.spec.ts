import {Page} from '@playwright/test';
import {expect, test, waitForScene} from './fixtures';

declare global {
  interface Window {
    __draws: number;
  }
}

// Un test par scénario de docs/specs/mode-fetes.md.

const at = (page: Page, date: string) =>
  page.clock.setFixedTime(new Date(`${date}T12:00:00`));

// Installe un compteur de draw calls ; renvoie ceux d'une durée donnée.
async function countDraws(page: Page) {
  await page.addInitScript(() => {
    window.__draws = 0;
    const proto = WebGL2RenderingContext.prototype as unknown as Record<
      string,
      (...args: unknown[]) => unknown
    >;
    for (const name of [
      'drawArrays',
      'drawElements',
      'drawArraysInstanced',
      'drawElementsInstanced',
    ]) {
      const original = proto[name];
      proto[name] = function (this: unknown, ...args: unknown[]) {
        window.__draws++;
        return original.apply(this, args);
      };
    }
  });
  return async (ms: number) => {
    const before = await page.evaluate(() => window.__draws);
    await page.waitForTimeout(ms);
    return (await page.evaluate(() => window.__draws)) - before;
  };
}

const sceneShot = (page: Page) =>
  page
    .locator('canvas')
    .screenshot({style: '[data-testid=snowfall] {display: none}'});

const unplugTree = (page: Page) =>
  page.evaluate(() => window.__mockSetState?.('switch.christmas_tree', 'off'));

test('neige derrière la maison pendant les fêtes, sans redessiner la scène', async ({
  page,
}) => {
  await at(page, '2026-12-15');
  const drawsDuring = await countDraws(page);
  await page.goto('/');
  await waitForScene(page);
  // Guirlandes éteintes : seule la neige bouge.
  await unplugTree(page);
  await drawsDuring(1000);

  const snowfall = page.getByTestId('snowfall');
  await expect(snowfall).toBeVisible();
  expect(await drawsDuring(3000)).toBe(0);
  // Avant le canvas, transparent, dans le même empilement : la maison
  // passe devant les flocons.
  expect(
    await snowfall.evaluate(
      snow =>
        snow.compareDocumentPosition(document.querySelector('canvas')!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ),
  ).toBeTruthy();
});

test('les lumières du sapin changent de couleur, et s’arrêtent avec leur prise', async ({
  page,
}) => {
  test.slow();
  await at(page, '2026-12-15');
  await page.goto('/');
  await waitForScene(page);

  const first = await sceneShot(page);
  await expect
    .poll(async () => (await sceneShot(page)).equals(first))
    .toBe(false);

  await unplugTree(page);
  await page.waitForTimeout(500);
  const unplugged = await sceneShot(page);
  await page.waitForTimeout(2500);
  expect((await sceneShot(page)).equals(unplugged)).toBe(true);
});

test('ne neige pas et ne pose pas de sapin en dehors des fêtes', async ({
  page,
}) => {
  await at(page, '2027-01-07');
  const drawsDuring = await countDraws(page);
  await page.goto('/');
  await waitForScene(page);
  await drawsDuring(1000);

  await expect(page.getByTestId('snowfall')).toHaveCount(0);
  // Sans sapin, rien ne redessine la scène au repos.
  expect(await drawsDuring(3000)).toBe(0);
});

test('suit le réglage forcé de la modale Configuration', async ({page}) => {
  await at(page, '2026-12-24');
  await page.addInitScript(() =>
    localStorage.setItem(
      'graphics-options',
      JSON.stringify({holidayMode: 'off'}),
    ),
  );
  await page.goto('/');
  await waitForScene(page);
  await expect(page.getByTestId('snowfall')).toHaveCount(0);
});

test('ne neige pas avec « réduire les animations »', async ({page}) => {
  await at(page, '2026-12-15');
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/');
  await waitForScene(page);
  await expect(page.getByTestId('snowfall')).toBeHidden();
});

test('neige sur l’écran de veille, et met la scène en pause dessous', async ({
  page,
}) => {
  await at(page, '2026-12-31');
  const drawsDuring = await countDraws(page);
  await page.addInitScript(() =>
    localStorage.setItem(
      'graphics-options',
      JSON.stringify({screensaverMinutes: 0.05}),
    ),
  );
  await page.goto('/');
  // Sous charge, la compilation des shaders retarde la veille.
  await waitForScene(page);

  const screensaver = page.getByRole('button', {name: "Réveiller l'écran"});
  await expect(screensaver.getByTestId('snowfall')).toBeVisible();
  // Le sapin, allumé, redessinerait la scène toutes les 2 s.
  expect(await drawsDuring(4500)).toBe(0);
});

test.describe('sur téléphone', () => {
  test.use({
    viewport: {width: 390, height: 844},
    hasTouch: true,
    isMobile: true,
  });

  test('met la neige en pause sur la vue Pièces', async ({page}) => {
    await at(page, '2026-12-15');
    await page.goto('/');
    await waitForScene(page);
    const snowfall = page.getByTestId('snowfall');
    const animations = () =>
      snowfall.evaluate(snow => snow.getAnimations({subtree: true}).length);
    await expect.poll(animations).toBe(40);

    await page.getByRole('button', {name: 'Pièces', exact: true}).tap();
    await expect.poll(animations).toBe(0);
  });
});
