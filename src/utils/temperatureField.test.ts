import {describe, expect, it} from 'vitest';
import type {FloorPlan} from '../rendering/floorPlan';
import {distancesFrom, temperatureField} from './temperatureField';

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

const fieldOf = (
  plan: FloorPlan,
  sensors: [number, number, number][],
  previous?: Float32Array,
) =>
  temperatureField(
    plan,
    sensors.map(([x, z]) => distancesFrom(plan, x, z)),
    sensors.map(([, , temperature]) => temperature),
    previous,
  );

describe('temperatureField', () => {
  // Deux pièces de 1 m, reliées par une porte en bas du mur.
  const twoRooms = planOf([
    ...Array(10).fill('..........#..........'),
    ...Array(3).fill('.....................'),
  ]);
  const sensors: [number, number, number][] = [
    [0.25, 0.25, 19],
    [1.85, 0.25, 21],
  ];

  it('un mur arrête la chaleur', () => {
    const field = fieldOf(twoRooms, sensors);

    expect(field[cellAt(twoRooms, 0.95, 0.25)]).toBeLessThan(19.5);
    expect(field[cellAt(twoRooms, 1.15, 0.25)]).toBeGreaterThan(20.5);
  });

  it('la chaleur se diffuse par la porte', () => {
    const field = fieldOf(twoRooms, sensors);

    expect(field[cellAt(twoRooms, 1.05, 1.15)]).toBeCloseTo(20, 0);
    expect(field[cellAt(twoRooms, 0.75, 1.15)]).toBeGreaterThan(19.2);
    expect(field[cellAt(twoRooms, 0.75, 1.15)]).toBeLessThan(20);
  });

  it('un capteur garde sa mesure autour de lui', () => {
    const field = fieldOf(twoRooms, sensors);

    expect(field[cellAt(twoRooms, 0.55, 0.25)]).toBe(19);
  });

  it('les capteurs d’une même pièce se partagent sa surface', () => {
    const plan = planOf(Array(5).fill('.'.repeat(30)));
    const field = fieldOf(plan, [
      [0.05, 0.25, 19],
      [2.95, 0.25, 21],
    ]);

    expect(field[cellAt(plan, 1.45, 0.25)]).toBeCloseTo(20, 1);
  });

  it('une pièce sans capteur prend la température de ses voisines, par les portes', () => {
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

    expect(field[cellAt(plan, 1.65, 0.15)]).toBeLessThan(19.9);
    expect(field[cellAt(plan, 1.65, 1.45)]).toBeGreaterThan(20.1);
  });

  it('une pièce sans capteur ne copie pas sa voisine', () => {
    // Une pièce à 21 °C, ouverte en bas sur une pièce sans capteur, fermée
    // sur une pièce à 17 °C.
    const row = (door: string) =>
      '.'.repeat(10) + door + '.'.repeat(10) + '#' + '.'.repeat(10);
    const plan = planOf([
      ...Array(10).fill(row('#')),
      ...Array(3).fill(row('.')),
    ]);
    const field = fieldOf(plan, [
      [0.25, 0.25, 21],
      [2.85, 0.25, 17],
    ]);

    expect(field[cellAt(plan, 2.05, 0.15)]).toBeLessThan(20.5);
    expect(field[cellAt(plan, 2.05, 0.15)]).toBeGreaterThan(19);
  });

  it('repart de la carte précédente vers le même résultat', () => {
    const before = fieldOf(twoRooms, [
      [0.25, 0.25, 18],
      [1.85, 0.25, 22],
    ]);
    const warm = fieldOf(twoRooms, sensors, before);
    const cold = fieldOf(twoRooms, sensors);

    warm.forEach((value, cell) => expect(value).toBeCloseTo(cold[cell], 1));
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
