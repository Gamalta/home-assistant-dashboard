import {Page} from '@playwright/test';
import {expect, test, waitForScene} from './fixtures';

// Taille de la tablette, au doigt.
test.use({viewport: {width: 1280, height: 800}, hasTouch: true});

// Étiquettes drei : les div posées à côté de celle du canvas.
const labels = (page: Page) => page.locator('div:has(> canvas) ~ div');
const temperatures = (page: Page) =>
  labels(page).getByRole('button', {name: /°$/});
const filter = (page: Page, name: string) =>
  page.getByRole('button', {name, exact: true});
// Le dressing de la démo n'affiche qu'une lumière dans son étiquette.
const dressing = (page: Page) =>
  page.getByRole('button', {name: 'Dressing', exact: true});

// Luminosité moyenne du canvas, sans les étiquettes : elle chute si des lumières s'éteignent.
async function canvasBrightness(page: Page) {
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
      sum += data[i] + data[i + 1] + data[i + 2];
    }
    return sum / (data.length / 4) / 3;
  }, png.toString('base64'));
}

test.beforeEach(async ({page}) => {
  await page.goto('/');
  await waitForScene(page);
});

// Les comptes viennent de la scène chargée, pas de la démo, qui s'enrichit
// à chaque nouveau type d'élément.
test('masque puis réaffiche les étiquettes d’une catégorie', async ({page}) => {
  const buttons = labels(page).getByRole('button');
  const all = await buttons.count();
  const climate = await temperatures(page).count();
  expect(climate).toBeGreaterThan(0);

  await filter(page, 'Volets').tap();
  await expect(filter(page, 'Volets')).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(() => buttons.count()).toBeLessThan(all);
  await expect(temperatures(page)).toHaveCount(climate);

  await filter(page, 'Climat').tap();
  await expect(temperatures(page)).toHaveCount(0);
  await expect(dressing(page)).toBeVisible();

  await filter(page, 'Volets').tap();
  await filter(page, 'Climat').tap();
  await expect(buttons).toHaveCount(all);
  await expect(temperatures(page)).toHaveCount(climate);
});

test('retire l’étiquette d’une pièce dont tous les éléments sont masqués', async ({
  page,
}) => {
  const climate = await temperatures(page).count();
  await expect(dressing(page)).toBeVisible();

  await filter(page, 'Lumières').tap();
  await expect(dressing(page)).toHaveCount(0);
  await expect(
    labels(page).filter({hasNot: page.getByRole('button')}),
  ).toHaveCount(0);
  await expect(temperatures(page)).toHaveCount(climate);
});

test('garde les lumières 3D allumées quand leurs étiquettes sont masquées', async ({
  page,
}) => {
  // Les lumières s'allument en fondu au chargement : on attend une image stable.
  let before = await canvasBrightness(page);
  await expect
    .poll(
      async () => {
        const previous = before;
        before = await canvasBrightness(page);
        return before - previous;
      },
      {timeout: 30_000},
    )
    .toBe(0);

  await filter(page, 'Lumières').tap();
  await expect(dressing(page)).toHaveCount(0);
  expect(await canvasBrightness(page)).toBeCloseTo(before, 0);
});

test('mémorise le filtre après rechargement', async ({page}) => {
  await filter(page, 'Volets').tap();
  await expect(filter(page, 'Volets')).toHaveAttribute('aria-pressed', 'false');

  await page.reload();
  await waitForScene(page);
  await expect(filter(page, 'Volets')).toHaveAttribute('aria-pressed', 'false');
  await expect(filter(page, 'Lumières')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  // Les volets étaient bien masqués : les réafficher ajoute des étiquettes.
  const buttons = labels(page).getByRole('button');
  const withoutShutters = await buttons.count();
  await filter(page, 'Volets').tap();
  await expect.poll(() => buttons.count()).toBeGreaterThan(withoutShutters);
});

test('reste utilisable au doigt à 1280 × 800 sans cacher la maison', async ({
  page,
}) => {
  const canvas = (await page.locator('canvas').boundingBox())!;
  const bar = (await filter(page, 'Lumières').locator('..').boundingBox())!;
  // Une rangée courte, en haut de la vue 3D.
  expect(bar.x).toBeGreaterThan(canvas.x);
  expect(bar.x + bar.width).toBeLessThan(canvas.x + canvas.width);
  expect(bar.y + bar.height).toBeLessThan(80);
  // Une puce de 44 px par catégorie, huit au plus : la rangée tient dans la
  // moitié de la vue, au-dessus de la maison.
  expect(bar.width).toBeLessThan(canvas.width / 2);

  for (const name of ['Lumières', 'Climat', 'Volets']) {
    const button = (await filter(page, name).boundingBox())!;
    expect(button.width).toBeGreaterThanOrEqual(40);
    expect(button.height).toBeGreaterThanOrEqual(40);
  }

  // Aucune étiquette ne passe sous la rangée.
  for (const label of await labels(page).all()) {
    const box = (await label.boundingBox())!;
    expect(box.y).toBeGreaterThan(bar.y + bar.height);
  }
});
