import {Page} from '@playwright/test';
import {expect, openConfigurationModal, test, waitForScene} from './fixtures';

// Taille de la tablette, au doigt.
test.use({viewport: {width: 1280, height: 800}, hasTouch: true});

// Étiquettes drei : les div posées à côté de celle du canvas.
const labels = (page: Page) => page.locator('div:has(> canvas) ~ div');
const temperatures = (page: Page) =>
  labels(page).getByRole('button', {name: /°$/});
const category = (page: Page, name: string) =>
  page.getByRole('switch', {name, exact: true});
const batteriesOnly = (page: Page) =>
  page
    .getByText('Batteries uniquement', {exact: true})
    .locator('..')
    .getByRole('switch');

// Le bouton de fermeture n'a pas de nom : c'est le dernier de l'en-tête.
async function closeModal(page: Page) {
  const title = page.getByRole('heading', {name: 'Configuration'});
  await title.locator('..').getByRole('button').last().click();
  await expect(title).toBeHidden();
}

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

// Démo : 14 pièces, 17 lumières, 7 climatisations, 6 volets, 2 prises, 1 imprimante,
// 1 TV, 1 aspirateur, 3 appareils sur pile (masqués par défaut) et 1 détecteur de fumée.
test('masque puis réaffiche les étiquettes d’une catégorie', async ({page}) => {
  await openConfigurationModal(page);
  await expect(labels(page).getByRole('button')).toHaveCount(36);
  await expect(temperatures(page)).toHaveCount(7);

  await category(page, 'Volets').uncheck();
  await expect(labels(page).getByRole('button')).toHaveCount(30);
  await expect(temperatures(page)).toHaveCount(7);

  await category(page, 'Climat').uncheck();
  await expect(temperatures(page)).toHaveCount(0);
  await expect(labels(page).getByRole('button')).toHaveCount(23);

  await category(page, 'Volets').check();
  await category(page, 'Climat').check();
  await expect(labels(page).getByRole('button')).toHaveCount(36);
  await expect(temperatures(page)).toHaveCount(7);
});

test('masque par défaut les appareils sur pile', async ({page}) => {
  const switches = labels(page).getByRole('button', {
    name: /^Interrupteur (du séjour|de la cuisine|de la chambre)$/,
  });
  await expect(labels(page).getByRole('button')).toHaveCount(36);
  await expect(switches).toHaveCount(0);

  await openConfigurationModal(page);
  await expect(category(page, 'Appareils sur pile')).not.toBeChecked();
  await category(page, 'Appareils sur pile').check();
  await expect(switches).toHaveCount(3);
});

test('retire l’étiquette d’une pièce dont tous les éléments sont masqués', async ({
  page,
}) => {
  await expect(labels(page)).toHaveCount(29);
  // 7 pièces n'ont qu'une lumière, et 3 lumières du séjour ont leur propre étiquette.
  await openConfigurationModal(page);
  await category(page, 'Lumières').uncheck();
  await expect(labels(page)).toHaveCount(19);
  await expect(temperatures(page)).toHaveCount(7);
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

  await openConfigurationModal(page);
  await category(page, 'Lumières').uncheck();
  await expect(labels(page)).toHaveCount(19);
  await closeModal(page);
  expect(await canvasBrightness(page)).toBeCloseTo(before, 0);
});

test('mémorise le filtre après rechargement', async ({page}) => {
  await openConfigurationModal(page);
  await category(page, 'Volets').uncheck();
  await expect(labels(page)).toHaveCount(23);

  await page.reload();
  await openConfigurationModal(page);
  await expect(category(page, 'Volets')).not.toBeChecked();
  await expect(category(page, 'Lumières')).toBeChecked();
  await expect(labels(page)).toHaveCount(23);
});

test('n’affiche que les piles de tous les éléments', async ({page}) => {
  await openConfigurationModal(page);
  await batteriesOnly(page).check();
  await expect(category(page, 'Lumières')).toBeDisabled();

  // Les 3 interrupteurs, masqués par défaut, et le détecteur de fumée.
  await expect(labels(page).getByRole('button')).toHaveCount(4);
  for (const level of ['54%', '12%', '85%', '90%']) {
    await expect(labels(page).getByText(level, {exact: true})).toHaveCount(1);
  }
  await expect(temperatures(page)).toHaveCount(0);

  await batteriesOnly(page).uncheck();
  await expect(labels(page).getByRole('button')).toHaveCount(36);
});
