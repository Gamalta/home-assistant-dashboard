import {describe, expect, it} from 'vitest';
import type {FloorPlan} from '../rendering/floorPlan';
import {
  distancesFrom,
  doorDistances,
  temperatureField,
} from './temperatureField';

// Un chiffre : la pièce, '#' : un mur, ':' : le passage d'une porte. Une ligne
// par rangée de 10 cm, coin en (0, 0).
const planOf = (rows: string[]): FloorPlan => ({
  width: rows[0].length,
  height: rows.length,
  minX: 0,
  minZ: 0,
  floor: Uint8Array.from(rows.join(''), cell => (cell === '#' ? 0 : 1)),
  room: Uint16Array.from(rows.join(''), cell => Number(cell) || 0),
});
const cellAt = (plan: FloorPlan, x: number, z: number) =>
  Math.floor(z / 0.1) * plan.width + Math.floor(x / 0.1);

const fieldOf = (plan: FloorPlan, sensors: [number, number, number][]) =>
  temperatureField(
    plan,
    doorDistances(plan),
    sensors.map(([x, z]) => distancesFrom(plan, x, z)),
    sensors.map(([, , temperature]) => temperature),
  );

describe('temperatureField', () => {
  // Deux pièces de 1 m, reliées par une porte en bas du mur.
  const twoRooms = planOf([
    ...Array(10).fill('1111111111#2222222222'),
    ...Array(3).fill('1111111111:2222222222'),
  ]);

  it('une pièce mesurée garde la température de son capteur jusqu’à ses murs', () => {
    const field = fieldOf(twoRooms, [
      [0.25, 0.25, 19],
      [1.85, 0.25, 21],
    ]);

    expect(field[cellAt(twoRooms, 0.95, 0.25)]).toBeCloseTo(19);
    expect(field[cellAt(twoRooms, 1.15, 0.25)]).toBeCloseTo(21);
  });

  it('passe d’une pièce à l’autre en fondu par la porte', () => {
    const field = fieldOf(twoRooms, [
      [0.25, 0.25, 19],
      [1.85, 0.25, 21],
    ]);

    expect(field[cellAt(twoRooms, 1.05, 1.15)]).toBeCloseTo(20, 0);
    expect(field[cellAt(twoRooms, 0.75, 1.15)]).toBeGreaterThan(19.2);
    expect(field[cellAt(twoRooms, 0.75, 1.15)]).toBeLessThan(20);
  });

  it('les capteurs d’une même pièce se partagent sa surface', () => {
    // Une pièce de 2 m mesurée aux deux bouts, et une pièce voisine à 25 °C.
    const plan = planOf([
      ...Array(10).fill('11111111111111111111#2222222222'),
      ...Array(3).fill('11111111111111111111:2222222222'),
    ]);
    const field = fieldOf(plan, [
      [0.05, 0.05, 19],
      [1.85, 0.05, 21],
      [2.5, 0.5, 25],
    ]);

    expect(field[cellAt(plan, 0.95, 0.05)]).toBeCloseTo(20, 1);
  });

  it('une pièce sans capteur se rapproche de la voisine la plus proche par les portes', () => {
    // Trois pièces : celle du milieu, sans capteur, ouvre en haut sur la
    // gauche et en bas sur la droite.
    const row = (left: string, right: string) =>
      '1'.repeat(10) + left + '2'.repeat(11) + right + '3'.repeat(10);
    const plan = planOf([
      ...Array(3).fill(row(':', '#')),
      ...Array(10).fill(row('#', '#')),
      ...Array(3).fill(row('#', ':')),
    ]);
    const field = fieldOf(plan, [
      [0.5, 0.75, 19],
      [2.8, 0.75, 21],
    ]);

    expect(field[cellAt(plan, 1.65, 0.15)]).toBeLessThan(19.75);
    expect(field[cellAt(plan, 1.65, 1.45)]).toBeGreaterThan(20.25);
  });
});

describe('doorDistances', () => {
  it('mesure la distance au passage d’une porte', () => {
    const plan = planOf(['11:22']);
    const doors = doorDistances(plan);

    expect(doors[2]).toBe(0);
    expect(doors[0]).toBeCloseTo(0.2);
  });
});

describe('distancesFrom', () => {
  const plan = planOf(['111#111', '111#111', '1111111']);

  it('part du sol le plus proche d’un capteur placé dans un mur', () => {
    const distances = distancesFrom(plan, 0.35, 0.05);

    expect(distances[cellAt(plan, 0.25, 0.05)]).toBe(0);
  });

  it('part du sol le plus proche d’un capteur placé hors du sol', () => {
    const distances = distancesFrom(plan, -2, 0.05);

    expect(distances[cellAt(plan, 0.05, 0.05)]).toBe(0);
  });

  it('contourne les murs', () => {
    const distances = distancesFrom(plan, 0.25, 0.05);

    // Six pas sous le mur plutôt que deux à travers : on ne coupe pas son
    // coin en diagonale.
    expect(distances[cellAt(plan, 0.45, 0.05)]).toBeCloseTo(0.6);
  });
});
