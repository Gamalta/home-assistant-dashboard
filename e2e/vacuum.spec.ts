import {Page} from '@playwright/test';
import {expect, test, waitForScene} from './fixtures';

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
