import {existsSync, globSync, readFileSync, statSync} from 'node:fs';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/examples/jsm/libs/meshopt_decoder.module.js';
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

/** La scène du modèle, sans ses textures que jsdom ne sait pas décoder. */
async function loadScene(model: string) {
  const glb = readFileSync(path(model));
  const jsonLength = glb.readUInt32LE(12);
  const json = Buffer.from(
    JSON.stringify(
      JSON.parse(glb.subarray(20, 20 + jsonLength).toString()),
      (key, value: unknown) => (key.endsWith('Texture') ? undefined : value),
    ),
  );
  const padding = Buffer.alloc((4 - (json.length % 4)) % 4, ' ');
  const bin = glb.subarray(20 + jsonLength);
  const header = Buffer.alloc(20);
  header.write('glTF', 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(20 + json.length + padding.length + bin.length, 8);
  header.writeUInt32LE(json.length + padding.length, 12);
  header.write('JSON', 16);
  const data = Buffer.concat([header, json, padding, bin]);
  // Un ArrayBuffer du même contexte que GLTFLoader, qui teste son type.
  const bytes = new Uint8Array(data.length);
  bytes.set(data);
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  return (await loader.parseAsync(bytes.buffer, '')).scene;
}

/** Triangles tournés vers le haut, dans le plan horizontal le plus haut. */
function topTriangles(scene: THREE.Object3D) {
  const triangles: THREE.Triangle[] = [];
  scene.updateMatrixWorld();
  scene.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    const {index, attributes} = object.geometry as THREE.BufferGeometry;
    for (let i = 0; i < index!.count; i += 3) {
      const triangle = new THREE.Triangle(
        ...([0, 1, 2].map(k =>
          new THREE.Vector3()
            .fromBufferAttribute(attributes.position, index!.getX(i + k))
            .applyMatrix4(object.matrixWorld),
        ) as [THREE.Vector3, THREE.Vector3, THREE.Vector3]),
      );
      if (triangle.getNormal(new THREE.Vector3()).y > 0.99) {
        triangles.push(triangle);
      }
    }
  });
  const top = Math.max(...triangles.map(({a}) => a.y));
  return triangles.filter(({a}) => a.y > top - 0.001);
}

/** Aire commune à deux triangles horizontaux (découpe de Sutherland-Hodgman). */
function overlapArea(first: THREE.Triangle, second: THREE.Triangle) {
  const flat = ({a, b, c}: THREE.Triangle) => {
    const points = [a, b, c].map(p => new THREE.Vector2(p.x, p.z));
    return THREE.ShapeUtils.isClockWise(points) ? points.reverse() : points;
  };
  let polygon = flat(first);
  const edges = flat(second);
  edges.forEach((start, i) => {
    const end = edges[(i + 1) % 3];
    const side = (p: THREE.Vector2) =>
      (end.x - start.x) * (p.y - start.y) - (end.y - start.y) * (p.x - start.x);
    polygon = polygon.flatMap((p, j) => {
      const q = polygon[(j + 1) % polygon.length];
      const kept = side(p) >= 0 ? [p] : [];
      if (side(p) >= 0 === side(q) >= 0) return kept;
      return [...kept, p.clone().lerp(q, side(p) / (side(p) - side(q)))];
    });
  });
  return THREE.ShapeUtils.area(polygon);
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

it.each(models.filter(model => lightMaps(model).length > 0))(
  '%s n’a plus de dessus de mur l’un sur l’autre, qui s’assombriraient',
  async model => {
    const tops = topTriangles(await loadScene(model));
    const area = tops.reduce((sum, top) => sum + top.getArea(), 0);
    const overlap = tops.reduce(
      (sum, first, i) =>
        tops
          .slice(i + 1)
          .reduce((total, second) => total + overlapArea(first, second), sum),
      0,
    );

    // Restent des liserés le long des arêtes, et les meubles qui montent
    // jusqu'au plafond. Avant l'union : 5 % sur l'appartement, 1 % sur la démo.
    expect(overlap / area).toBeLessThan(0.002);
  },
);
