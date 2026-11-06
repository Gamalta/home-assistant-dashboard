import {CELL_SIZE, type FloorPlan} from '../rendering/floorPlan';

// Traverser 10 cm de mur coûte autant que 2 m de sol : la chaleur passe par
// les portes, et une cellule enfermée reçoit quand même une température.
const WALL_COST = 20;
// Distance plancher : évite une division par zéro sur le capteur lui-même.
const MIN_DISTANCE = 0.1;

/**
 * Distance (m) de chaque cellule au sol le plus proche de (x, z), en
 * contournant les murs : Dijkstra sur les huit voisins.
 */
export function distancesFrom(plan: FloorPlan, x: number, z: number) {
  const {width, height, floor} = plan;
  const distances = new Float64Array(width * height).fill(Infinity);
  const start = nearestFloorCell(plan, x, z);
  if (start === undefined) return Float32Array.from(distances);
  const cost = (cell: number) => (floor[cell] ? 1 : WALL_COST);
  const done = new Uint8Array(width * height);
  const queue = new MinQueue();
  distances[start] = 0;
  queue.push(0, start);
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

/**
 * Température de chaque cellule : moyenne des capteurs pondérée par
 * l'inverse du carré de leur distance en contournant les murs.
 */
export const temperatureField = (
  distances: Float32Array[],
  temperatures: number[],
) => weightedMean(distances, temperatures, 2);

/**
 * Mêle la température extérieure au champ selon la part de chaque cellule qui
 * revient aux pièces extérieures, à partir des distances au centre de toutes
 * les pièces : une terrasse prend la météo sans qu'elle entre par la
 * porte-fenêtre dans les pièces sans capteur.
 */
export function withOutdoor(
  field: Float32Array,
  rooms: Float32Array[],
  outdoor: boolean[],
  temperature: number,
) {
  // Puissance 4 : chaque cellule revient presque entière à la pièce la plus
  // proche, avec un fondu autour de la limite.
  const share = weightedMean(rooms, outdoor.map(Number), 4);
  return field.map(
    (value, cell) => value + share[cell] * (temperature - value),
  );
}

function weightedMean(
  distances: Float32Array[],
  values: number[],
  power: number,
) {
  const field = new Float32Array(distances[0]?.length ?? 0);
  for (let cell = 0; cell < field.length; cell++) {
    let sum = 0;
    let weights = 0;
    distances.forEach((source, k) => {
      const weight = Math.max(source[cell], MIN_DISTANCE) ** -power;
      sum += values[k] * weight;
      weights += weight;
    });
    field[cell] = weights ? sum / weights : 0;
  }
  return field;
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
