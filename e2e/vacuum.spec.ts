import {Page} from '@playwright/test';
import {expect, test, waitForScene} from './fixtures';

declare global {
  interface Window {
    __uploadedImages: string[];
  }
}

// Le mock fait laver le séjour, après la cuisine, à l'aspirateur
// `dreame_demo`, placé dans le séjour de la config démo.
const vacuumButton = (page: Page) =>
  page.getByRole('button', {name: 'Aspirateur', exact: true});

// Les autres scénarios de docs/specs/aspirateur-robot.md ne dépendent que de
// la modale : ils sont testés en unitaire (RoomVacuum.test.tsx).
test('suit le nettoyage depuis la scène', async ({page}) => {
  await page.goto('/');
  await waitForScene(page);
  await expect(vacuumButton(page)).toHaveText('45%');
  await vacuumButton(page).click();
  await expect(page.getByRole('heading', {name: 'Aspirateur'})).toBeVisible();

  // Les pièces se posent sur le plan, au centre que donne la calibration.
  const map = page.getByRole('img', {name: 'Plan de nettoyage'});
  await expect(map).toBeVisible();
  const living = map.locator('..').getByText('Séjour', {exact: true});
  const mapBox = (await map.boundingBox())!;
  const livingBox = (await living.boundingBox())!;
  expect(livingBox.x + livingBox.width / 2).toBeCloseTo(
    mapBox.x + (258 / 640) * mapBox.width,
    0,
  );
  expect(livingBox.y + livingBox.height / 2).toBeCloseTo(
    mapBox.y + (404 / 548) * mapBox.height,
    0,
  );

  await expect(page.getByText('Aspiration et lavage')).toBeVisible();
  await expect(
    page.getByRole('progressbar', {name: 'Progression'}),
  ).toHaveAttribute('aria-valuenow', '45');
  await expect(page.getByText('12 m²')).toBeVisible();
  await expect(page.getByText('18 min')).toBeVisible();
  await expect(
    page.getByRole('progressbar', {name: 'Serpillières'}),
  ).toHaveAttribute('aria-valuenow', '12');
});

test('pose le plan de nettoyage sur le sol de la vue 3D', async ({page}) => {
  // Images envoyées au GPU : celle du plan n'y part que si le sol la lit.
  await page.addInitScript(() => {
    window.__uploadedImages = [];
    const prototype = WebGL2RenderingContext.prototype as unknown as Record<
      string,
      (...args: unknown[]) => void
    >;
    for (const name of ['texImage2D', 'texSubImage2D']) {
      const upload = prototype[name];
      prototype[name] = function (this: unknown, ...args: unknown[]) {
        const source = args[args.length - 1];
        if (source instanceof HTMLImageElement) {
          window.__uploadedImages.push(source.src);
        }
        upload.apply(this, args);
      };
    }
  });
  await page.goto('/');
  await waitForScene(page);
  const printer = page.getByRole('button', {name: 'Imprimante 3D'});
  await expect(printer).toBeVisible();

  await page.getByRole('button', {name: 'Menu rapide'}).click();
  await page.getByRole('menuitemcheckbox', {name: 'Aspirateur'}).click();

  await expect
    .poll(() => page.evaluate(() => window.__uploadedImages))
    .toContainEqual(expect.stringContaining('vacuum/demo_map.svg'));
  await expect(printer).toHaveCount(0);
  await expect(vacuumButton(page)).toBeVisible();
});
