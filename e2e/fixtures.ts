import {Page, expect, test as base} from '@playwright/test';

// Erreurs déjà connues, corrigées ailleurs : à retirer une fois réglées.
const KNOWN_ERRORS = [
  /<path> attribute d: Expected number/, // Icons/WindowIcon.tsx
  /\/_vercel\/(speed-)?insights\//, // 404 hors de Vercel
];

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
        const text = `${message.text()} ${message.location().url}`;
        if (message.type() === 'error' && !KNOWN_ERRORS.some(e => e.test(text)))
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
