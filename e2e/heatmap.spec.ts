import {DataUtils} from 'three';
import {expect, test, waitForScene} from './fixtures';

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
