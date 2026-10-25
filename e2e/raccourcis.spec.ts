import {Page} from '@playwright/test';
import {expect, test, waitForScene} from './fixtures';

// Taille de la tablette murale en pixels CSS, écran tactile.
test.use({viewport: {width: 1280, height: 800}, hasTouch: true});

test.beforeEach(async ({page}) => {
  await page.goto('/');
  await waitForScene(page);
});

// Glissement du doigt vers la gauche, un peu de biais comme à la main.
// Chromium headless ne simule pas le doigt de la même façon partout : sous
// Linux (CI), synthesizeScrollGesture n'émet aucun touchmove, et sous macOS,
// dispatchTouchEvent se bloque dès que le défilement commence.
async function swipeLeft(page: Page, x: number, y: number) {
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

test('lance un scénario depuis le menu en haut de la vue 3D', async ({
  page,
}) => {
  const dial = page.getByRole('button', {name: 'Scénarios'});
  const box = await dial.boundingBox();
  const separator = await page.getByRole('separator').boundingBox();
  const header = await page.getByRole('banner').boundingBox();
  expect(box!.x).toBeGreaterThan(separator!.x + separator!.width);
  expect(box!.y).toBeCloseTo(header!.y, 0);

  await dial.tap();
  await expect(dial).toHaveAttribute('aria-expanded', 'true');
  for (const name of ['Départ', 'Température', 'Énergie'])
    await expect(page.getByRole('menuitem', {name})).toBeVisible();

  await page.getByRole('menuitem', {name: 'Départ'}).tap();
  await expect(dial).toHaveAttribute('aria-expanded', 'false');
  const check = dial.getByTestId('coche');
  await expect(check).toBeVisible();
  await expect(check).toBeHidden();
});

test('fait défiler les cartes au doigt et suit la pagination', async ({
  page,
}) => {
  const carousel = page.getByRole('region', {name: 'Raccourcis'});
  const tv = carousel.getByRole('button', {name: /^TV du séjour/});
  const speaker = carousel.getByRole('button', {
    name: /^Enceinte de la chambre/,
  });
  await expect(tv).toBeInViewport({ratio: 0.9});
  await expect(speaker).not.toBeInViewport({ratio: 0.5});
  await expect(page.getByRole('button', {name: 'Carte 1'})).toHaveAttribute(
    'aria-current',
    'true',
  );

  const box = await carousel.boundingBox();
  await swipeLeft(page, box!.x + box!.width - 40, box!.y + box!.height / 2);
  await expect(speaker).toBeInViewport({ratio: 0.9});
  // Le dock s'ouvre d'un glissement vers le haut, pas d'un glissement de biais.
  await expect(page.getByRole('button', {name: 'Système'})).toBeHidden();
  await expect(page.getByRole('button', {name: 'Carte 2'})).toHaveAttribute(
    'aria-current',
    'true',
  );

  await page.getByRole('button', {name: 'Carte 1'}).tap();
  await expect(tv).toBeInViewport({ratio: 0.9});
  await expect(page.getByRole('button', {name: 'Carte 1'})).toHaveAttribute(
    'aria-current',
    'true',
  );
});

test('pilote le média depuis sa carte et ouvre sa modale', async ({page}) => {
  const carousel = page.getByRole('region', {name: 'Raccourcis'});
  await expect(carousel).toContainText('My Way');

  await carousel.getByRole('button', {name: 'Pause'}).first().tap();
  await expect(
    carousel.getByRole('button', {name: 'Lecture'}).first(),
  ).toBeVisible();

  await carousel.getByRole('button', {name: /^TV du séjour/}).tap();
  await expect(page.getByRole('heading', {name: 'TV du séjour'})).toBeVisible();
  await expect(page.getByAltText('Visuel du média')).toBeVisible();
});

test('garde la page à la hauteur de l’écran, carrousel compris', async ({
  page,
}) => {
  const height = await page.evaluate(
    () => document.documentElement.scrollHeight,
  );
  expect(height).toBeLessThanOrEqual(800);
  const box = await page
    .getByRole('region', {name: 'Raccourcis'})
    .boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(800);
});
