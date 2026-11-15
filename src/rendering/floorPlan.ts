import * as THREE from 'three';
import type {HouseConfigType} from '../configs/house';
import {getMaterialKind} from './materialKind';

/** Côté d'une cellule du plan, en mètres. */
export const CELL_SIZE = 0.1;
// Sous l'allège des fenêtres : les portes restent ouvertes, les fenêtres non.
const WALL_CUT_HEIGHT = 0.5;

/**
 * Plan du sol vu de dessus, cellule par cellule, ligne après ligne selon z :
 * 1 là où l'on marche, 0 sur un mur ou hors du sol.
 */
export type FloorPlan = {
  width: number;
  height: number;
  minX: number;
  minZ: number;
  floor: Uint8Array;
};

type Triangle = [THREE.Vector3, THREE.Vector3, THREE.Vector3];

// SceneMaterials garde le matériau du modèle quand il le remplace.
const materialOf = (mesh: THREE.Mesh): THREE.Material | THREE.Material[] =>
  mesh.userData.originalMaterial ?? mesh.material;

/**
 * Plan du sol (`room_*`), sans celui des pièces extérieures, coupé par les
 * murs (`wall_*`) à mi-hauteur d'allège.
 */
export function createFloorPlan(
  scene: THREE.Object3D,
  outdoorFloors: Set<THREE.Material>,
): FloorPlan | undefined {
  const ground: Triangle[] = [];
  const walls: Triangle[] = [];
  scene.updateMatrixWorld(true);
  scene.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    const material = materialOf(object);
    if (Array.isArray(material)) return;
    if (
      getMaterialKind(material) === 'ground' &&
      !outdoorFloors.has(material)
    ) {
      addTriangles(object, ground);
    }
    // Les portes ouvertes, les sanitaires et des meubles sont en `white` : seuls
    // les `wall_*` arrêtent la chaleur.
    if (material.name.toLowerCase().startsWith('wall_')) {
      addTriangles(object, walls);
    }
  });
  if (!ground.length) return undefined;

  const box = new THREE.Box3().setFromPoints(ground.flat());
  const width = Math.ceil((box.max.x - box.min.x) / CELL_SIZE);
  const height = Math.ceil((box.max.z - box.min.z) / CELL_SIZE);
  const plan: FloorPlan = {
    width,
    height,
    minX: box.min.x,
    minZ: box.min.z,
    floor: new Uint8Array(width * height),
  };
  ground.forEach(triangle => fillTriangle(plan, triangle));
  const cutY = box.min.y + WALL_CUT_HEIGHT;
  walls.forEach(triangle => cutWall(plan, triangle, cutY));
  removeThinFloor(plan);
  return plan;
}

/** Matériaux du sol sous les pièces extérieures (terrasses, balcons). */
export function getOutdoorFloors(
  scene: THREE.Object3D,
  rooms: HouseConfigType['rooms'],
) {
  const floors = new Set<THREE.Material>();
  const outdoor = rooms.filter(room => room.outdoor);
  if (!outdoor.length) return floors;
  const ground: THREE.Mesh[] = [];
  scene.updateMatrixWorld(true);
  scene.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    const material = materialOf(object);
    if (!Array.isArray(material) && getMaterialKind(material) === 'ground') {
      ground.push(object);
    }
  });
  const raycaster = new THREE.Raycaster();
  const down = new THREE.Vector3(0, -1, 0);
  outdoor.forEach(({position}) => {
    raycaster.set(new THREE.Vector3(position.x, 100, position.z), down);
    const [hit] = raycaster.intersectObjects(ground, false);
    if (hit) floors.add(materialOf(hit.object as THREE.Mesh) as THREE.Material);
  });
  return floors;
}

function addTriangles(mesh: THREE.Mesh, triangles: Triangle[]) {
  const {position} = mesh.geometry.attributes;
  const index = mesh.geometry.index;
  const count = index ? index.count : position.count;
  const vertex = (i: number) =>
    new THREE.Vector3()
      .fromBufferAttribute(position, index ? index.getX(i) : i)
      .applyMatrix4(mesh.matrixWorld);
  for (let i = 0; i < count; i += 3) {
    triangles.push([vertex(i), vertex(i + 1), vertex(i + 2)]);
  }
}

const column = (plan: FloorPlan, x: number) =>
  Math.floor((x - plan.minX) / CELL_SIZE);
const row = (plan: FloorPlan, z: number) =>
  Math.floor((z - plan.minZ) / CELL_SIZE);

/** Marque les cellules dont le centre tombe dans le triangle, vu de dessus. */
function fillTriangle(plan: FloorPlan, [a, b, c]: Triangle) {
  const side = (p: THREE.Vector3, q: THREE.Vector3, x: number, z: number) =>
    (q.x - p.x) * (z - p.z) - (q.z - p.z) * (x - p.x);
  const i0 = Math.max(column(plan, Math.min(a.x, b.x, c.x)), 0);
  const i1 = Math.min(column(plan, Math.max(a.x, b.x, c.x)), plan.width - 1);
  const j0 = Math.max(row(plan, Math.min(a.z, b.z, c.z)), 0);
  const j1 = Math.min(row(plan, Math.max(a.z, b.z, c.z)), plan.height - 1);
  for (let j = j0; j <= j1; j++) {
    for (let i = i0; i <= i1; i++) {
      const x = plan.minX + (i + 0.5) * CELL_SIZE;
      const z = plan.minZ + (j + 0.5) * CELL_SIZE;
      const s = [side(a, b, x, z), side(b, c, x, z), side(c, a, x, z)];
      if (s.every(v => v >= 0) || s.every(v => v <= 0)) {
        plan.floor[j * plan.width + i] = 1;
      }
    }
  }
}

/** Efface du sol le trait que laisse le triangle à la hauteur `y`. */
function cutWall(plan: FloorPlan, triangle: Triangle, y: number) {
  const crossings = triangle.flatMap((p, k) => {
    const q = triangle[(k + 1) % 3];
    if (p.y === q.y || (p.y - y) * (q.y - y) > 0) return [];
    return [p.clone().lerp(q, (y - p.y) / (q.y - p.y))];
  });
  if (crossings.length < 2) return;
  const [p, q] = crossings;
  const steps = Math.max(Math.ceil((p.distanceTo(q) / CELL_SIZE) * 4), 1);
  for (let s = 0; s <= steps; s++) {
    const point = p.clone().lerp(q, s / steps);
    const i = column(plan, point.x);
    const j = row(plan, point.z);
    if (i >= 0 && j >= 0 && i < plan.width && j < plan.height) {
      plan.floor[j * plan.width + i] = 0;
    }
  }
}

/**
 * Retire les étendues de sol qui n'atteignent nulle part 50 cm de large :
 * l'intérieur d'un mur épais, entre ses deux faces.
 */
function removeThinFloor(plan: FloorPlan) {
  const {width, height, floor} = plan;
  const region = new Int32Array(floor.length);
  const wide: boolean[] = [false];
  floor.forEach((open, start) => {
    if (!open || region[start]) return;
    region[start] = wide.push(false) - 1;
    const stack = [start];
    while (stack.length) {
      const cell = stack.pop()!;
      const i = cell % width;
      const j = (cell - i) / width;
      const neighbours = [
        i > 0 && cell - 1,
        i < width - 1 && cell + 1,
        j > 0 && cell - width,
        j < height - 1 && cell + width,
      ];
      neighbours.forEach(next => {
        if (next === false || !floor[next] || region[next]) return;
        region[next] = region[start];
        stack.push(next);
      });
    }
  });

  region.forEach((label, cell) => {
    if (!label || wide[label]) return;
    const i = cell % width;
    const j = (cell - i) / width;
    if (i < 2 || j < 2 || i >= width - 2 || j >= height - 2) return;
    let inside = true;
    for (let dj = -2; dj <= 2 && inside; dj++) {
      for (let di = -2; di <= 2 && inside; di++) {
        inside = region[cell + dj * width + di] === label;
      }
    }
    wide[label] = inside;
  });
  region.forEach((label, cell) => {
    if (label && !wide[label]) floor[cell] = 0;
  });
}
