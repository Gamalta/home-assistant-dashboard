import type {Page} from '@playwright/test';
import {DataUtils} from 'three';
import {expect, openConfigurationModal, test, waitForScene} from './fixtures';

declare global {
  interface Window {
    __halfFloatTextures: {width: number; data: number[]}[];
  }
}

// Plan de la démo : cellules de 10 cm à partir de (-7,43 ; -7,30).
const cellOf = (x: number, z: number) => ({
  i: Math.floor((x + 7.435) / 0.1),
  j: Math.floor((z + 7.304) / 0.1),
});

// Les autres scénarios de docs/specs/carte-des-temperatures-murs-et-exterieur.md
// sont testés en unitaire (temperatureField.test.ts, floorPlan.test.ts,
// useTemperatureMap.test.ts).
test('un mur arrête la chaleur', async ({page}) => {
  // Textures en demi-flottants envoyées au GPU : la carte du sol.
  await page.addInitScript(() => {
    window.__halfFloatTextures = [];
    const prototype = WebGL2RenderingContext.prototype as unknown as Record<
      string,
      (...args: unknown[]) => void
    >;
    for (const [name, widthArg] of [
      ['texImage2D', 3],
      ['texSubImage2D', 4],
    ] as const) {
      const upload = prototype[name];
      prototype[name] = function (this: unknown, ...args: unknown[]) {
        const source = args[args.length - 1];
        if (source instanceof Uint16Array && source.length > 1) {
          window.__halfFloatTextures.push({
            width: args[widthArg] as number,
            data: Array.from(source),
          });
        }
        upload.apply(this, args);
      };
    }
  });
  await page.goto('/');
  await waitForScene(page);
  await page.getByRole('button', {name: 'Menu rapide'}).click();
  await page.getByRole('menuitemcheckbox', {name: 'Température'}).click();

  await expect
    .poll(() => page.evaluate(() => window.__halfFloatTextures.length))
    .toBeGreaterThan(0);
  const {width, data} = await page.evaluate(
    () => window.__halfFloatTextures[0],
  );
  const temperatureAt = (x: number, z: number) => {
    const {i, j} = cellOf(x, z);
    return DataUtils.fromHalfFloat(data[j * width + i]);
  };

  // La texture garde l'écart au milieu de l'échelle. Chambre 2 à 21 °C, au pied
  // du mur de la salle de bain à 19 °C : la salle de bain, à 1,5 m à vol
  // d'oiseau, la ramènerait à 20 °C.
  expect(temperatureAt(6.6, -2.55) - temperatureAt(6, -1.2)).toBeGreaterThan(
    1.5,
  );
});

async function showHeatmap(page: Page) {
  await page.goto('/');
  await waitForScene(page);
  await page.getByRole('button', {name: 'Menu rapide'}).click();
  await page.getByRole('menuitemcheckbox', {name: 'Température'}).click();
  return page.getByRole('region', {name: 'Légende des températures'});
}

// Scénarios de docs/specs/legende-des-temperatures.md. Les capteurs de la
// démo vont de 19 à 21 °C : l'échelle « Équilibrée » couvre 18 à 22 °C.
test('survoler la légende donne la température d’une couleur', async ({
  page,
}) => {
  const legend = await showHeatmap(page);
  await expect(legend).toContainText('18 °C');
  await expect(legend).toContainText('22 °C');

  const gradient = legend.getByTestId('heatmap-gradient');
  const box = (await gradient.boundingBox())!;
  await gradient.hover({position: {x: box.width / 4, y: box.height / 2}});
  await expect(legend.getByRole('status')).toHaveText('19 °C');

  await page.mouse.move(0, 0);
  await expect(legend.getByRole('status')).toBeHidden();

  await page.getByRole('button', {name: 'Menu rapide'}).click();
  await page.getByRole('menuitemcheckbox', {name: 'Température'}).click();
  await expect(legend).toBeHidden();
});

test.describe('téléphone', () => {
  test.use({
    viewport: {width: 390, height: 844},
    hasTouch: true,
    isMobile: true,
  });

  test('la légende se pose au-dessus du carrousel et répond au doigt', async ({
    page,
  }) => {
    const legend = await showHeatmap(page);
    const chips = page.getByRole('group', {name: 'Choix de la pièce'});
    expect((await legend.boundingBox())!.y).toBeLessThan(
      (await chips.boundingBox())!.y,
    );

    const gradient = legend.getByTestId('heatmap-gradient');
    const box = (await gradient.boundingBox())!;
    await gradient.tap({position: {x: (box.width * 3) / 4, y: box.height / 2}});
    // L'appui levé, la température reste affichée.
    await expect(legend.getByRole('status')).toHaveText('21 °C');
  });
});

test('règle l’échelle des températures dans la modale Configuration', async ({
  page,
}) => {
  await page.goto('/');
  await openConfigurationModal(page);
  const scale = page.getByRole('combobox', {name: 'Échelle des températures'});
  await expect(scale).toHaveText('Équilibrée (4 °C)');
  await scale.click();
  await page.getByRole('option', {name: 'Douce (8 °C)'}).click();

  await page.reload();
  await openConfigurationModal(page);
  await expect(
    page.getByRole('combobox', {name: 'Échelle des températures'}),
  ).toHaveText('Douce (8 °C)');
});
