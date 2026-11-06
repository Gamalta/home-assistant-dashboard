import {CELL_SIZE, type FloorPlan} from '../rendering/floorPlan';

// Traverser 10 cm de mur coûte autant que 2 m de sol : la chaleur passe par
// les portes, et une cellule enfermée reçoit quand même une température.
const WALL_COST = 20;
// Un capteur fixe la température de l'air autour de lui, sur ce rayon (m).
const SENSOR_REACH = 0.5;
// Pertes : chaque cellule tend aussi un peu vers la moyenne des capteurs
// pondérée par l'inverse du carré de leur distance. Loin de ses portes, une
// pièce sans capteur en prend la valeur plutôt que celle de sa voisine.
const LOSS = 0.003;
// Distance plancher : évite une division par zéro sur le capteur lui-même.
const MIN_DISTANCE = 0.1;
// Surrelaxation de la diffusion : converge en une centaine de passes.
const OMEGA = 1.9;
const MAX_PASSES = 400;
const TOLERANCE = 0.001;

/**
 * Distance (m) de chaque cellule au sol le plus proche de (x, z), en
 * contournant les murs.
 */
export function distancesFrom(plan: FloorPlan, x: number, z: number) {
  const start = nearestFloorCell(plan, x, z);
  return geodesic(plan, start === undefined ? [] : [start]);
}

/**
 * Température de chaque cellule : la chaleur se diffuse depuis les capteurs,
 * par les portes, sans traverser les murs, avec un peu de pertes.
 * `previous`, la carte d'avant, accélère la diffusion.
 */
export function temperatureField(
  plan: FloorPlan,
  distances: Float32Array[],
  temperatures: number[],
  previous?: Float32Array,
) {
  const fixed = new Uint8Array(plan.floor.length);
  const field = Float32Array.from(plan.floor, (open, cell) => {
    let nearest = 0;
    distances.forEach((source, k) => {
      if (source[cell] < distances[nearest][cell]) nearest = k;
    });
    fixed[cell] = distances[nearest][cell] < SENSOR_REACH ? 1 : 0;
    // Départ de la diffusion, déjà proche de l'arrivée : la carte d'avant sur
    // le sol libre ; le capteur le plus proche autour de lui et sous les murs.
    return previous?.length === plan.floor.length && open && !fixed[cell]
      ? previous[cell]
      : temperatures[nearest];
  });
  const blend = Float32Array.from(plan.floor, (_, cell) =>
    weightedMean(distances, temperatures, cell),
  );
  diffuse(plan, field, fixed, blend);
  return underWalls(plan, field);
}

function weightedMean(
  distances: Float32Array[],
  temperatures: number[],
  cell: number,
) {
  let sum = 0;
  let weights = 0;
  distances.forEach((source, k) => {
    const weight = Math.max(source[cell], MIN_DISTANCE) ** -2;
    sum += temperatures[k] * weight;
    weights += weight;
  });
  return weights ? sum / weights : 0;
}

/**
 * Régime permanent de l'équation de la chaleur autour des capteurs, les murs
 * isolant : chaque cellule de sol prend la moyenne de ses voisines, et un peu
 * de `blend`.
 */
function diffuse(
  plan: FloorPlan,
  field: Float32Array,
  fixed: Uint8Array,
  blend: Float32Array,
) {
  const {width, height, floor} = plan;
  for (let pass = 0; pass < MAX_PASSES; pass++) {
    let change = 0;
    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        const cell = j * width + i;
        if (!floor[cell] || fixed[cell]) continue;
        const left = i > 0 ? floor[cell - 1] : 0;
        const right = i < width - 1 ? floor[cell + 1] : 0;
        const up = j > 0 ? floor[cell - width] : 0;
        const down = j < height - 1 ? floor[cell + width] : 0;
        const count = left + right + up + down;
        const sum =
          (left && field[cell - 1]) +
          (right && field[cell + 1]) +
          (up && field[cell - width]) +
          (down && field[cell + width]);
        const target = (sum + LOSS * blend[cell]) / (count + LOSS);
        const delta = OMEGA * (target - field[cell]);
        field[cell] += delta;
        change = Math.max(change, Math.abs(delta));
      }
    }
    if (change < TOLERANCE) return;
  }
}

/**
 * Sous les murs, la moyenne du sol voisin : le filtrage de la texture ne borde
 * pas les pièces d'une autre couleur.
 */
function underWalls(plan: FloorPlan, field: Float32Array) {
  const {width, height, floor} = plan;
  return field.map((value, cell) => {
    if (floor[cell]) return value;
    const i = cell % width;
    const j = (cell - i) / width;
    let sum = 0;
    let count = 0;
    for (let nj = Math.max(j - 1, 0); nj <= Math.min(j + 1, height - 1); nj++) {
      for (
        let ni = Math.max(i - 1, 0);
        ni <= Math.min(i + 1, width - 1);
        ni++
      ) {
        if (!floor[nj * width + ni]) continue;
        sum += field[nj * width + ni];
        count++;
      }
    }
    return count ? sum / count : value;
  });
}

/**
 * Distance (m) de chaque cellule à la plus proche des cellules `starts` :
 * Dijkstra sur les huit voisins.
 */
function geodesic(plan: FloorPlan, starts: number[]) {
  const {width, height, floor} = plan;
  const distances = new Float64Array(width * height).fill(Infinity);
  const cost = (cell: number) => (floor[cell] ? 1 : WALL_COST);
  const done = new Uint8Array(width * height);
  const queue = new MinQueue();
  starts.forEach(start => {
    distances[start] = 0;
    queue.push(0, start);
  });
  while (queue.size) {
    const cell = queue.pop();
    if (done[cell]) continue;
    done[cell] = 1;
    const i = cell % width;
    const j = (cell - i) / width;
    for (let dj = -1; dj <= 1; dj++) {
      for (let di = -1; di <= 1; di++) {
        const ni = i + di;
        const nj = j + dj;
        if ((!di && !dj) || ni < 0 || nj < 0 || ni >= width || nj >= height) {
          continue;
        }
        const next = nj * width + ni;
        // En diagonale, on ne passe pas entre deux murs qui se touchent par
        // un coin.
        const step =
          di && dj
            ? Math.SQRT2 *
              Math.max(cost(next), cost(j * width + ni), cost(nj * width + i))
            : cost(next);
        const distance = distances[cell] + step;
        if (distance < distances[next]) {
          distances[next] = distance;
          queue.push(distance, next);
        }
      }
    }
  }
  return Float32Array.from(distances, d => d * CELL_SIZE);
}

/** Cellule de sol la plus proche : un capteur fixé au mur tombe dans le mur. */
function nearestFloorCell(plan: FloorPlan, x: number, z: number) {
  let nearest: number | undefined;
  let best = Infinity;
  plan.floor.forEach((open, cell) => {
    if (!open) return;
    const i = cell % plan.width;
    const j = (cell - i) / plan.width;
    const dx = plan.minX + (i + 0.5) * CELL_SIZE - x;
    const dz = plan.minZ + (j + 0.5) * CELL_SIZE - z;
    if (dx * dx + dz * dz < best) {
      best = dx * dx + dz * dz;
      nearest = cell;
    }
  });
  return nearest;
}

/** File de priorité (tas binaire) des cellules par distance croissante. */
class MinQueue {
  private keys: number[] = [];
  private cells: number[] = [];

  get size() {
    return this.keys.length;
  }

  push(key: number, cell: number) {
    let i = this.keys.length;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.keys[parent] <= key) break;
      this.keys[i] = this.keys[parent];
      this.cells[i] = this.cells[parent];
      i = parent;
    }
    this.keys[i] = key;
    this.cells[i] = cell;
  }

  pop() {
    const top = this.cells[0];
    const key = this.keys.pop()!;
    const cell = this.cells.pop()!;
    const size = this.keys.length;
    if (!size) return top;
    let i = 0;
    for (;;) {
      let child = 2 * i + 1;
      if (child >= size) break;
      if (child + 1 < size && this.keys[child + 1] < this.keys[child]) child++;
      if (this.keys[child] >= key) break;
      this.keys[i] = this.keys[child];
      this.cells[i] = this.cells[child];
      i = child;
    }
    this.keys[i] = key;
    this.cells[i] = cell;
    return top;
  }
}
