import {Page, expect, test as base} from '@playwright/test';

export const test = base.extend<{
  /** Erreurs console tolérées par un test, à justifier là où on les déclare. */
  consoleErrorsAllowed: RegExp[];
  failOnConsoleError: void;
}>({
  consoleErrorsAllowed: [[], {option: true}],
  context: async ({context}, use) => {
    // Pas de données de test envoyées à Sentry ni à Matomo.
    await context.route(/sentry\.io|matomo\.elihome\.fr/, route =>
      route.fulfill({body: ''}),
    );
    await use(context);
  },
  failOnConsoleError: [
    async ({page, consoleErrorsAllowed}, use) => {
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => {
        const text = `${message.text()} ${message.location().url}`;
        if (
          message.type() === 'error' &&
          !consoleErrorsAllowed.some(allowed => allowed.test(text))
        )
          errors.push(text);
      });
      await use();
      expect(errors, 'erreurs console inattendues').toEqual([]);
    },
    {auto: true},
  ],
});

export {expect};

// Scène montée et shaders compilés : la page ne bloque plus.
export async function waitForScene(page: Page) {
  await page.waitForFunction(() => !!window.__dashboardBenchmark);
}

// Le dock apparaît quand la souris passe en bas de la barre latérale.
export async function openSystemModal(page: Page) {
  await waitForScene(page);
  await page.mouse.move(150, 700);
  const button = page.getByRole('button', {name: 'Système'});
  // Un clic pendant l'animation d'entrée du dock peut tomber à côté.
  await expect(button.locator('..')).toHaveCSS('opacity', '1');
  await button.click();
  await expect(page.getByRole('heading', {name: 'Système'})).toBeVisible();
}

// Glissement du doigt vers la gauche, un peu de biais comme à la main.
// Chromium headless ne simule pas le doigt de la même façon partout : sous
// Linux (CI), synthesizeScrollGesture n'émet aucun touchmove, et sous macOS,
// dispatchTouchEvent se bloque dès que le défilement commence.
export async function swipeLeft(page: Page, x: number, y: number) {
  const client = await page.context().newCDPSession(page);
  if (process.platform === 'darwin') {
    await client.send('Input.synthesizeScrollGesture', {
      x,
      y,
      xDistance: -240,
      yDistance: -24,
      gestureSourceType: 'touch',
    });
    return;
  }
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{x, y}],
  });
  for (let dx = 40; dx <= 240; dx += 40) {
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{x: x - dx, y: y - dx / 10}],
    });
  }
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
}
