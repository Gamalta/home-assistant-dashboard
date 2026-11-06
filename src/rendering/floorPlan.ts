import * as THREE from 'three';
import type {HouseConfigType} from '../configs/house';
import {getMaterialKind} from './materialKind';

/** Côté d'une cellule du plan, en mètres. */
export const CELL_SIZE = 0.1;
// Sous l'allège des fenêtres : les portes restent ouvertes, les fenêtres non.
const WALL_CUT_HEIGHT = 0.5;
// Sous le haut des murs, au-dessus des portes : les linteaux ferment chaque
// pièce.
const ROOM_CUT_DEPTH = 0.15;

/**
 * Plan du sol vu de dessus, cellule par cellule, ligne après ligne selon z.
 * `floor` : 1 là où l'on marche, 0 sur un mur ou hors du sol. `room` : la
 * pièce de la cellule à partir de 1, 0 hors d'une pièce, sous une porte
 * comprise.
 */
export type FloorPlan = {
  width: number;
  height: number;
  minX: number;
  minZ: number;
  floor: Uint8Array;
  room: Uint16Array;
};

type Triangle = [THREE.Vector3, THREE.Vector3, THREE.Vector3];

// SceneMaterials garde le matériau du modèle quand il le remplace.
const materialOf = (mesh: THREE.Mesh): THREE.Material | THREE.Material[] =>
  mesh.userData.originalMaterial ?? mesh.material;

/**
 * Plan du sol (`room_*`), sans celui des pièces extérieures, coupé par les
 * murs (`wall_*`) : à mi-hauteur d'allège pour savoir où l'on passe, sous
 * leur sommet pour séparer les pièces.
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
    room: new Uint16Array(width * height),
  };
  ground.forEach(triangle => fillTriangle(plan, triangle));
  const low = new Uint8Array(width * height);
  const high = new Uint8Array(width * height);
  const top = walls.reduce(
    (max, triangle) => Math.max(max, ...triangle.map(v => v.y)),
    -Infinity,
  );
  walls.forEach(triangle => {
    cutWall(plan, triangle, box.min.y + WALL_CUT_HEIGHT, low);
    cutWall(plan, triangle, top - ROOM_CUT_DEPTH, high);
  });
  low.forEach((cut, cell) => {
    if (cut) plan.floor[cell] = 0;
  });
  labelRooms(plan, high);
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

/** Marque dans `cut` le trait que laisse le triangle à la hauteur `y`. */
function cutWall(
  plan: FloorPlan,
  triangle: Triangle,
  y: number,
  cut: Uint8Array,
) {
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
      cut[j * plan.width + i] = 1;
    }
  }
}

/**
 * Numérote les étendues de sol que séparent les murs coupés sous leur sommet.
 * Celles qui n'atteignent nulle part 50 cm de large sont l'intérieur d'un mur
 * épais, entre ses deux faces : elles quittent le sol.
 */
function labelRooms(plan: FloorPlan, walls: Uint8Array) {
  const {width, height, floor, room} = plan;
  let count = 0;
  floor.forEach((open, start) => {
    if (!open || walls[start] || room[start]) return;
    room[start] = ++count;
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
        if (next === false || !floor[next] || walls[next] || room[next]) {
          return;
        }
        room[next] = count;
        stack.push(next);
      });
    }
  });

  const wide = new Uint8Array(count + 1);
  room.forEach((label, cell) => {
    if (!label || wide[label]) return;
    const i = cell % width;
    const j = (cell - i) / width;
    if (i < 2 || j < 2 || i >= width - 2 || j >= height - 2) return;
    let inside = true;
    for (let dj = -2; dj <= 2 && inside; dj++) {
      for (let di = -2; di <= 2 && inside; di++) {
        inside = room[cell + dj * width + di] === label;
      }
    }
    if (inside) wide[label] = 1;
  });
  room.forEach((label, cell) => {
    if (label && !wide[label]) room[cell] = floor[cell] = 0;
  });
}
