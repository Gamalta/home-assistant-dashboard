import {CELL_SIZE, type FloorPlan} from '../rendering/floorPlan';

// Traverser 10 cm de mur coûte autant que 2 m de sol : la chaleur passe par
// les portes, et une cellule enfermée reçoit quand même une température.
const WALL_COST = 20;
// Distance plancher : évite une division par zéro sur le capteur lui-même.
const MIN_DISTANCE = 0.1;

// Distance à une porte sur laquelle une pièce passe de la température du
// passage à celle de ses capteurs.
const DOOR_BLEND = 0.75;

/**
 * Distance (m) de chaque cellule à la pièce la plus proche de (x, z), en
 * contournant les murs.
 */
export function distancesFrom(plan: FloorPlan, x: number, z: number) {
  const start = nearestRoomCell(plan, x, z);
  return geodesic(plan, start === undefined ? [] : [start]);
}

/** Distance (m) de chaque cellule au passage d'une porte. */
export function doorDistances(plan: FloorPlan) {
  const doorways: number[] = [];
  plan.floor.forEach((open, cell) => {
    if (open && !plan.room[cell]) doorways.push(cell);
  });
  return geodesic(plan, doorways);
}

/**
 * Température de chaque cellule. Une pièce mesurée prend la température de ses
 * capteurs jusqu'à ses murs, avec un fondu vers celle du passage près des
 * portes. Ailleurs, chaque capteur pèse l'inverse du carré de sa distance en
 * contournant les murs.
 */
export function temperatureField(
  plan: FloorPlan,
  doors: Float32Array,
  distances: Float32Array[],
  temperatures: number[],
) {
  // La cellule de départ d'un capteur est à distance nulle.
  const rooms = distances.map(source => plan.room[source.indexOf(0)]);
  return Float32Array.from(plan.room, (room, cell) => {
    const all = weightedMean(distances, temperatures, cell, () => true);
    if (!room || !rooms.includes(room)) return all;
    const own = weightedMean(
      distances,
      temperatures,
      cell,
      k => rooms[k] === room,
    );
    return all + Math.min(doors[cell] / DOOR_BLEND, 1) * (own - all);
  });
}

function weightedMean(
  distances: Float32Array[],
  temperatures: number[],
  cell: number,
  keep: (sensor: number) => boolean,
) {
  let sum = 0;
  let weights = 0;
  distances.forEach((source, k) => {
    if (!keep(k)) return;
    const weight = Math.max(source[cell], MIN_DISTANCE) ** -2;
    sum += temperatures[k] * weight;
    weights += weight;
  });
  return weights ? sum / weights : 0;
}

/** Dijkstra sur les huit voisins, depuis les cellules `starts`. */
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

/** Cellule de pièce la plus proche : un capteur fixé au mur tombe dans le mur. */
function nearestRoomCell(plan: FloorPlan, x: number, z: number) {
  let nearest: number | undefined;
  let best = Infinity;
  plan.room.forEach((room, cell) => {
    if (!room) return;
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
