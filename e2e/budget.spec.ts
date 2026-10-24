import {statSync} from 'node:fs';
import {benchmarkAtRest, openHouse, rotate} from '../scripts/bench/measure.ts';
import {mostFrequent} from '../scripts/bench/report.ts';
import {expect, test} from './fixtures';

// Budget de l'ADR 0009 sur la démo. Seuls des comptes sont vérifiés : ils ne
// dépendent pas de la vitesse de la machine, contrairement aux durées.

test('reste sous 150 draw calls par image au repos', async ({page}) => {
  await openHouse(page, 'demo');
  const {drawsPerFrame} = await benchmarkAtRest(page, 10);
  expect(mostFrequent(drawsPerFrame)).toBeLessThanOrEqual(150);
});

test('ne compile aucun programme pendant une rotation', async ({page}) => {
  // L'inertie de la caméra se compte en images, lentes en rendu logiciel.
  test.slow();
  await openHouse(page, 'demo');
  expect((await rotate(page)).programs).toBe(0);
});

test('ne compile aucun programme pendant une rotation, avec les ombres', async ({
  page,
}) => {
  // Basculer castShadow au début et à la fin du geste recompile 5 programmes
  // à chaque fois. #39 corrige ce défaut : Playwright signalera alors ce test,
  // qui passera, et il faudra retirer test.fail().
  test.fail();
  test.slow();
  await openHouse(page, 'demo', {shadows: true});
  expect((await rotate(page)).programs).toBe(0);
});

test('garde le modèle de la démo sous 2 Mo', () => {
  expect(statSync('src/configs/demo/Demo.glb').size).toBeLessThanOrEqual(2e6);
});
