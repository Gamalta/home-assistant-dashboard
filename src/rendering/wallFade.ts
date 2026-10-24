import * as THREE from 'three';
import {FADE_RADIUS} from './shaders/HideWallsMaterial/common';

type Wall = {mesh: THREE.Mesh; color: THREE.Color};

/**
 * Calque de fondu de tous les murs : leurs triangles réunis en un seul mesh,
 * en coordonnées monde, avec la couleur de chaque mur dans ses sommets.
 *
 * `sort` redessine les objets proches de la caméra, les seuls qui s'effacent,
 * du plus loin au plus proche comme three.js trie les meshes transparents,
 * puis les triangles de chaque objet.
 * Un mur translucide du fond ne passe ainsi pas devant un mur du premier
 * plan, même s'ils n'ont pas le même matériau (ADR 0011). Un objet est un
 * ensemble de triangles reliés, sommets de même position compris : on
 * retrouve les objets du modèle d'origine.
 */
export function createWallFade(walls: Wall[]) {
  const positions: number[] = [];
  const normals: number[] = [];
  const colors: number[] = [];
  const vertex = new THREE.Vector3();
  const normalMatrix = new THREE.Matrix3();
  for (const {mesh, color} of walls) {
    const {index, attributes} = mesh.geometry;
    mesh.updateWorldMatrix(true, false);
    normalMatrix.getNormalMatrix(mesh.matrixWorld);
    for (let i = 0; i < (index ?? attributes.position).count; i++) {
      const v = index ? index.getX(i) : i;
      vertex
        .fromBufferAttribute(attributes.position, v)
        .applyMatrix4(mesh.matrixWorld)
        .toArray(positions, positions.length);
      vertex
        .fromBufferAttribute(attributes.normal, v)
        .applyMatrix3(normalMatrix)
        .normalize()
        .toArray(normals, normals.length);
      color.toArray(colors, colors.length);
    }
  }
  const vertexCount = positions.length / 3;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const index = new THREE.Uint32BufferAttribute(
    new Uint32Array(vertexCount),
    1,
  );
  geometry.setIndex(index);

  const parent = Array.from({length: vertexCount}, (_, v) => v);
  const find = (v: number) => {
    while (parent[v] !== v) v = parent[v] = parent[parent[v]];
    return v;
  };
  const firstAtPosition = new Map<string, number>();
  for (let v = 0; v < vertexCount; v++) {
    if (v % 3) parent[find(v)] = find(v - (v % 3));
    const key = positions.slice(3 * v, 3 * v + 3).join(' ');
    const first = firstAtPosition.get(key);
    if (first === undefined) firstAtPosition.set(key, v);
    else parent[find(v)] = find(first);
  }

  // Comme three.js : un objet est placé au centre de sa boîte englobante.
  const groups = new Map<number, {triangles: number[]; box: THREE.Box3}>();
  const triangleCenters: THREE.Vector3[] = [];
  for (let t = 0; t < vertexCount / 3; t++) {
    const root = find(3 * t);
    const group = groups.get(root) ?? {triangles: [], box: new THREE.Box3()};
    groups.set(root, group);
    group.triangles.push(t);
    const center = new THREE.Vector3();
    for (let k = 0; k < 3; k++) {
      vertex.fromArray(positions, 9 * t + 3 * k);
      group.box.expandByPoint(vertex);
      center.add(vertex);
    }
    triangleCenters.push(center.divideScalar(3));
  }
  const objects = [...groups.values()].map(({triangles, box}) => ({
    triangles,
    box,
    center: box.getCenter(new THREE.Vector3()),
    depth: 0,
  }));

  const triangleDepths = new Float32Array(triangleCenters.length);
  const direction = new THREE.Vector3();
  const sort = (camera: THREE.Camera) => {
    // La profondeur d'un point, à une constante près, suffit pour trier.
    camera.getWorldDirection(direction);
    const near = objects.filter(
      ({box}) => box.distanceToPoint(camera.position) < FADE_RADIUS,
    );
    for (const object of near) object.depth = object.center.dot(direction);
    near.sort((a, b) => b.depth - a.depth);
    let i = 0;
    for (const {triangles} of near) {
      for (const t of triangles) {
        triangleDepths[t] = triangleCenters[t].dot(direction);
      }
      triangles.sort((a, b) => triangleDepths[b] - triangleDepths[a]);
      for (const t of triangles) {
        for (let k = 0; k < 3; k++) index.array[i++] = 3 * t + k;
      }
    }
    // Les objets plus loin n'ont aucun pixel à fondre : ils ne sont pas dessinés.
    geometry.setDrawRange(0, i);
    index.addUpdateRange(0, i);
    index.needsUpdate = true;
  };
  return {geometry, sort};
}
