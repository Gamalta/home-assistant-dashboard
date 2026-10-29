import {statSync} from 'node:fs';
import {benchmarkAtRest, openHouse, rotate} from '../scripts/bench/measure.ts';
import {mostFrequent} from '../scripts/bench/report.ts';
import {expect, test} from './fixtures';

// Budget de l'ADR 0009 sur la démo. Seuls des comptes sont vérifiés : ils ne
// dépendent pas de la vitesse de la machine, contrairement aux durées.
// En rendu logiciel, chaque image est lente et l'inertie de la caméra se compte
// en images : les rotations sont des gestes courts, avec un délai triplé.

test('reste sous 150 draw calls par image au repos', async ({page}) => {
  await openHouse(page, 'demo');
  const {drawsPerFrame} = await benchmarkAtRest(page, 10);
  expect(mostFrequent(drawsPerFrame)).toBeLessThanOrEqual(150);
});

test('ne compile aucun programme pendant une rotation', async ({page}) => {
  test.slow();
  await openHouse(page, 'demo');
  expect((await rotate(page, 10)).programs).toBe(0);
});

test('ne compile aucun programme pendant une rotation, avec les ombres', async ({
  page,
}) => {
  test.slow();
  await openHouse(page, 'demo', {shadows: true});
  expect((await rotate(page, 10)).programs).toBe(0);
});

test('garde le modèle de la démo sous 2 Mo', () => {
  expect(statSync('src/configs/demo/Demo.glb').size).toBeLessThanOrEqual(2e6);
});
