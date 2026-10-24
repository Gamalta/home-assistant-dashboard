import {readFileSync} from 'node:fs';
import {format} from 'prettier';
import * as THREE from 'three';
import {HDRLoader} from 'three/examples/jsm/loaders/HDRLoader.js';
import {expect, it} from 'vitest';
import {sphericalHarmonicsFromEquirect} from './sphericalHarmonicsFromEquirect';

const HDR = '../../components/3d/assets/dikhololo_night_1k.hdr';

// L'instantané est le fichier lu par EnvironmentLighting : le test échoue si
// le HDR change sans que les coefficients soient regénérés.
it('garde la sonde de lumière versionnée identique au calcul depuis le HDR', async () => {
  const {buffer} = new Uint8Array(readFileSync(new URL(HDR, import.meta.url)));
  const {data, width, height, type} = new HDRLoader().parse(buffer);
  const texture = new THREE.DataTexture(data, width, height, undefined, type);
  // 12 chiffres : les derniers varient d'une machine à l'autre (Mac, CI),
  // alors que le GPU n'en lit que 7 (float32).
  const sh = sphericalHarmonicsFromEquirect(texture)
    .toArray()
    .map(coefficient => Number(coefficient.toPrecision(12)));

  // Formaté comme le ferait prettier sur le fichier.
  const json = await format(JSON.stringify(sh), {parser: 'json'});
  await expect(json).toMatchFileSnapshot(
    './nightLightProbe.json',
    'HDR modifié ? Regénérer les coefficients avec `pnpm run test -u`',
  );
});
