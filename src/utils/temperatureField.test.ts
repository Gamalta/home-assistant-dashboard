import {describe, expect, it} from 'vitest';
import type {FloorPlan} from '../rendering/floorPlan';
import {distancesFrom, temperatureField, withOutdoor} from './temperatureField';

// '.' : sol, '#' : mur. Une ligne par rangée de 10 cm, coin en (0, 0).
const planOf = (rows: string[]): FloorPlan => ({
  width: rows[0].length,
  height: rows.length,
  minX: 0,
  minZ: 0,
  floor: Uint8Array.from(rows.join(''), cell => (cell === '.' ? 1 : 0)),
});
const cellAt = (plan: FloorPlan, x: number, z: number) =>
  Math.floor(z / 0.1) * plan.width + Math.floor(x / 0.1);

const fieldOf = (plan: FloorPlan, sensors: [number, number, number][]) =>
  temperatureField(
    sensors.map(([x, z]) => distancesFrom(plan, x, z)),
    sensors.map(([, , temperature]) => temperature),
  );

describe('temperatureField', () => {
  it('un mur arrête la chaleur', () => {
    // Deux pièces de 1 m, reliées par une porte en bas du mur.
    const plan = planOf([
      ...Array(10).fill('..........#..........'),
      ...Array(3).fill('.....................'),
    ]);
    const field = fieldOf(plan, [
      [0.25, 0.25, 19],
      [1.85, 0.25, 21],
    ]);

    expect(field[cellAt(plan, 0.95, 0.25)]).toBeCloseTo(19, 0);
    expect(field[cellAt(plan, 1.15, 0.25)]).toBeCloseTo(21, 0);
    expect(field[cellAt(plan, 1.05, 1.15)]).toBeCloseTo(20, 0);
  });

  it('une pièce sans capteur se rapproche de la voisine la plus proche par les portes', () => {
    // Trois pièces : celle du milieu, sans capteur, ouvre en haut sur la
    // gauche et en bas sur la droite.
    const row = (left: string, right: string) =>
      '.'.repeat(10) + left + '.'.repeat(11) + right + '.'.repeat(10);
    const plan = planOf([
      ...Array(3).fill(row('.', '#')),
      ...Array(10).fill(row('#', '#')),
      ...Array(3).fill(row('#', '.')),
    ]);
    const field = fieldOf(plan, [
      [0.5, 0.75, 19],
      [2.8, 0.75, 21],
    ]);

    expect(field[cellAt(plan, 1.65, 0.15)]).toBeLessThan(19.75);
    expect(field[cellAt(plan, 1.65, 1.45)]).toBeGreaterThan(20.25);
  });
});

describe('withOutdoor', () => {
  it('la météo ne passe pas la porte-fenêtre d’une pièce sans capteur', () => {
    // Terrasse | pièce sans capteur | pièce mesurée, reliées par des portes.
    const row = (door: string) =>
      '.'.repeat(10) + door + '.'.repeat(10) + door + '.'.repeat(10);
    const plan = planOf([
      ...Array(7).fill(row('#')),
      ...Array(3).fill(row('.')),
    ]);
    const rooms = [0.5, 1.55, 2.6].map(x => distancesFrom(plan, x, 0.5));
    const indoor = fieldOf(plan, [[2.6, 0.5, 21]]);
    const field = withOutdoor(indoor, rooms, [true, false, false], 5);

    expect(field[cellAt(plan, 0.25, 0.25)]).toBeCloseTo(5, 0);
    expect(field[cellAt(plan, 1.55, 0.5)]).toBeCloseTo(21, 0);
  });
});

describe('distancesFrom', () => {
  const plan = planOf(['...#...', '...#...', '.......']);

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
