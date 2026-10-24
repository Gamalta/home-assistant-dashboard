import {readFileSync} from 'node:fs';
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
  const sh = sphericalHarmonicsFromEquirect(texture).toArray();

  await expect(`${JSON.stringify(sh, null, 2)}\n`).toMatchFileSnapshot(
    './nightLightProbe.json',
    'HDR modifié ? Regénérer les coefficients avec `pnpm run test -u`',
  );
});
