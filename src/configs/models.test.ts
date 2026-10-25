import {globSync, readFileSync} from 'node:fs';
import {expect, it} from 'vitest';

type Gltf = {
  nodes: {mesh?: number}[];
  meshes: {primitives: unknown[]}[];
};

// Budget de l'ADR 0009. Le modèle de l'appartement (sous-module privé) est
// absent en CI : seuls les modèles présents sont vérifiés.
const MAX_BYTES = 2_000_000;
const MAX_PRIMITIVES = 150;

const models = globSync('*/*.glb', {cwd: import.meta.dirname});

/** Primitives dessinées par la scène, lues dans le chunk JSON du GLB. */
function countPrimitives(glb: Buffer) {
  const jsonLength = glb.readUInt32LE(12);
  const gltf: Gltf = JSON.parse(glb.subarray(20, 20 + jsonLength).toString());
  let count = 0;
  for (const {mesh} of gltf.nodes) {
    if (mesh !== undefined) count += gltf.meshes[mesh].primitives.length;
  }
  return count;
}

it.each(models)(
  '%s pèse au plus 2 Mo et compte au plus 150 primitives',
  model => {
    const glb = readFileSync(`${import.meta.dirname}/${model}`);

    expect(glb.length).toBeLessThanOrEqual(MAX_BYTES);
    expect(countPrimitives(glb)).toBeLessThanOrEqual(MAX_PRIMITIVES);
  },
);
