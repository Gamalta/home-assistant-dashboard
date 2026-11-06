import * as THREE from 'three';
import {describe, expect, it} from 'vitest';
import type {HouseConfigType} from '../configs/house';
import {createFloorPlan, getOutdoorFloors, type FloorPlan} from './floorPlan';

const material = (name: string) => new THREE.MeshStandardMaterial({name});

const box = (
  name: string,
  size: [number, number, number],
  position: [number, number, number],
) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material(name));
  mesh.position.set(...position);
  return mesh;
};

const plane = (name: string, width: number, x: number) => {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, 1),
    material(name),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, 0, 0.5);
  return mesh;
};

/**
 * Un sol de 2 m × 1 m, coupé en x = 1 m par un mur percé d'une porte, et une
 * terrasse de 1 m à droite.
 */
function house() {
  const floor = plane('room_1.003', 2, 1);
  const terrace = plane('room_2', 1, 2.5);
  const scene = new THREE.Group();
  scene.add(
    floor,
    terrace,
    box('wall_1', [0.1, 2.5, 0.7], [1, 1.25, 0.35]),
    // Linteau au-dessus de la porte, de z = 0,7 à 1 m.
    box('wall_1', [0.1, 0.5, 0.3], [1, 2.25, 0.85]),
    box('flgrey', [0.4, 0.8, 0.4], [0.5, 0.4, 0.5]),
    // Porte ouverte, contre le mur.
    box('white', [0.8, 2, 0.04], [1.5, 1, 0.15]),
  );
  return {scene, floor, terrace};
}

const noOutdoor = new Set<THREE.Material>();
const cellOf = (plan: FloorPlan, x: number, z: number) =>
  Math.floor(z / 0.1) * plan.width + Math.floor(x / 0.1);
const isFloor = (plan: FloorPlan, x: number, z: number) =>
  plan.floor[cellOf(plan, x, z)] === 1;
const roomAt = (plan: FloorPlan, x: number, z: number) =>
  plan.room[cellOf(plan, x, z)];

describe('createFloorPlan', () => {
  it('couvre le sol des pièces par cellules de 10 cm', () => {
    const plan = createFloorPlan(house().scene, noOutdoor)!;

    expect(plan).toMatchObject({width: 30, height: 10, minX: 0, minZ: 0});
    expect(isFloor(plan, 1.5, 0.3)).toBe(true);
  });

  it('coupe le sol le long des murs', () => {
    const plan = createFloorPlan(house().scene, noOutdoor)!;

    expect(isFloor(plan, 0.95, 0.3)).toBe(false);
    expect(isFloor(plan, 1.05, 0.3)).toBe(false);
  });

  it('garde le passage d’une porte sous son linteau', () => {
    const plan = createFloorPlan(house().scene, noOutdoor)!;

    expect(isFloor(plan, 0.95, 0.85)).toBe(true);
  });

  it('sépare les pièces par les murs, portes comprises', () => {
    const plan = createFloorPlan(house().scene, noOutdoor)!;

    expect(roomAt(plan, 0.5, 0.5)).toBeGreaterThan(0);
    expect(roomAt(plan, 1.5, 0.5)).toBeGreaterThan(0);
    expect(roomAt(plan, 1.5, 0.5)).not.toBe(roomAt(plan, 0.5, 0.5));
    expect(roomAt(plan, 0.95, 0.85)).toBe(0);
  });

  it('laisse le sol sous les meubles et les portes ouvertes', () => {
    const plan = createFloorPlan(house().scene, noOutdoor)!;

    expect(isFloor(plan, 0.5, 0.5)).toBe(true);
    expect(isFloor(plan, 1.5, 0.15)).toBe(true);
  });

  it('retire du sol l’intérieur d’un mur épais', () => {
    const scene = new THREE.Group().add(
      plane('room_1', 2, 1),
      box('wall_1', [0.3, 2.5, 1], [1, 1.25, 0.5]),
    );
    const plan = createFloorPlan(scene, noOutdoor)!;

    expect(isFloor(plan, 1, 0.5)).toBe(false);
    expect(roomAt(plan, 0.5, 0.5)).toBeGreaterThan(0);
  });

  it('laisse de côté le sol des pièces extérieures', () => {
    const {scene, terrace} = house();
    const plan = createFloorPlan(scene, new Set([terrace.material]))!;

    expect(plan.width).toBe(20);
  });

  it('lit le matériau du modèle sous celui de la carte', () => {
    const {scene, floor} = house();
    floor.userData.originalMaterial = floor.material;
    floor.material = material('heatmapGround');

    expect(createFloorPlan(scene, noOutdoor)?.width).toBe(30);
  });

  it('ne renvoie rien sans sol', () => {
    const scene = new THREE.Group().add(
      box('wall_1', [1, 2.5, 0.1], [0, 1, 0]),
    );

    expect(createFloorPlan(scene, noOutdoor)).toBeUndefined();
  });
});

describe('getOutdoorFloors', () => {
  const rooms = [
    {id: 'Living_room', name: 'Séjour', position: {x: 0.5, y: 2.5, z: 0.5}},
    {
      id: 'Terrace',
      name: 'Terrasse',
      outdoor: true,
      position: {x: 2.5, y: 2.5, z: 0.5},
    },
  ] satisfies HouseConfigType['rooms'];

  it('trouve le sol sous une pièce extérieure', () => {
    const {scene, terrace} = house();

    expect(getOutdoorFloors(scene, rooms)).toEqual(new Set([terrace.material]));
  });

  it('lit le matériau du modèle sous celui de la carte', () => {
    const {scene, terrace} = house();
    const original = terrace.material;
    terrace.userData.originalMaterial = original;
    terrace.material = material('heatmapGround');

    expect(getOutdoorFloors(scene, rooms)).toEqual(new Set([original]));
  });
});
