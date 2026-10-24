import {Page, expect, test as base} from '@playwright/test';

export const test = base.extend<{failOnConsoleError: void}>({
  context: async ({context}, use) => {
    // Pas de données de test envoyées à Sentry ni à Matomo.
    await context.route(/sentry\.io|matomo\.elihome\.fr/, route =>
      route.fulfill({body: ''}),
    );
    await use(context);
  },
  failOnConsoleError: [
    async ({page}, use) => {
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => {
        if (message.type() === 'error')
          errors.push(`${message.text()} ${message.location().url}`);
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
