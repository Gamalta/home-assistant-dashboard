import {existsSync, globSync, readFileSync, statSync} from 'node:fs';
import {expect, it} from 'vitest';

type Gltf = {
  nodes: {mesh?: number}[];
  meshes: {primitives: {attributes: Record<string, number>}[]}[];
};

// Budget de l'ADR 0009. Le modèle de l'appartement (sous-module privé) est
// absent en CI : seuls les modèles présents sont vérifiés.
const MAX_BYTES = 2_000_000;
const MAX_PRIMITIVES = 150;

const models = globSync('*/*.glb', {cwd: import.meta.dirname});
const path = (file: string) => `${import.meta.dirname}/${file}`;
// Cartes écrites à côté du modèle par `pnpm bake-lighting`.
const lightMaps = (model: string) =>
  ['sky', 'sun']
    .map(name => model.replace(/\.glb$/, `-${name}.webp`))
    .filter(map => existsSync(path(map)));

/** Primitives dessinées par la scène, lues dans le chunk JSON du GLB. */
function drawnPrimitives(model: string) {
  const glb = readFileSync(path(model));
  const jsonLength = glb.readUInt32LE(12);
  const gltf: Gltf = JSON.parse(glb.subarray(20, 20 + jsonLength).toString());
  return gltf.nodes.flatMap(({mesh}) =>
    mesh === undefined ? [] : gltf.meshes[mesh].primitives,
  );
}

it.each(models)(
  '%s et ses cartes de lumière pèsent au plus 2 Mo, pour 150 primitives au plus',
  model => {
    const files = [model, ...lightMaps(model)];
    const bytes = files.reduce(
      (sum, file) => sum + statSync(path(file)).size,
      0,
    );

    expect(bytes).toBeLessThanOrEqual(MAX_BYTES);
    expect(drawnPrimitives(model).length).toBeLessThanOrEqual(MAX_PRIMITIVES);
  },
);

it.each(models.filter(model => lightMaps(model).length > 0))(
  '%s déplie chaque primitive pour ses deux cartes de lumière',
  model => {
    expect(lightMaps(model)).toHaveLength(2);
    for (const {attributes} of drawnPrimitives(model)) {
      expect(attributes.TEXCOORD_1).toBeDefined();
    }
  },
);
