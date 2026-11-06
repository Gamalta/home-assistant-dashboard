import * as THREE from 'three';
import {describe, expect, it} from 'vitest';
import {createFloorPlan, type FloorPlan} from './floorPlan';

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

/** Un sol de 2 m × 1 m, coupé en x = 1 m par un mur percé d'une porte. */
function house() {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 1),
    material('room_1.003'),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(1, 0, 0.5);
  const scene = new THREE.Group();
  scene.add(
    floor,
    box('wall_1', [0.1, 2.5, 0.7], [1, 1.25, 0.35]),
    // Linteau au-dessus de la porte, de z = 0,7 à 1 m.
    box('white', [0.1, 0.5, 0.3], [1, 2.25, 0.85]),
    box('flgrey', [0.4, 0.8, 0.4], [0.5, 0.4, 0.5]),
  );
  return {scene, floor};
}

const isFloor = (plan: FloorPlan, x: number, z: number) =>
  plan.floor[Math.floor(z / 0.1) * plan.width + Math.floor(x / 0.1)] === 1;

describe('createFloorPlan', () => {
  it('couvre le sol des pièces par cellules de 10 cm', () => {
    const plan = createFloorPlan(house().scene)!;

    expect(plan).toMatchObject({width: 20, height: 10, minX: 0, minZ: 0});
    expect(isFloor(plan, 1.5, 0.3)).toBe(true);
  });

  it('coupe le sol le long des murs', () => {
    const plan = createFloorPlan(house().scene)!;

    expect(isFloor(plan, 0.95, 0.3)).toBe(false);
    expect(isFloor(plan, 1.05, 0.3)).toBe(false);
  });

  it('garde le passage d’une porte sous son linteau', () => {
    const plan = createFloorPlan(house().scene)!;

    expect(isFloor(plan, 0.95, 0.85)).toBe(true);
  });

  it('laisse le sol sous les meubles', () => {
    const plan = createFloorPlan(house().scene)!;

    expect(isFloor(plan, 0.5, 0.5)).toBe(true);
  });

  it('lit le matériau du modèle sous celui de la carte', () => {
    const {scene, floor} = house();
    floor.userData.originalMaterial = floor.material;
    floor.material = material('heatmapGround');

    expect(createFloorPlan(scene)).toBeDefined();
  });

  it('ne renvoie rien sans sol', () => {
    const scene = new THREE.Group().add(
      box('wall_1', [1, 2.5, 0.1], [0, 1, 0]),
    );

    expect(createFloorPlan(scene)).toBeUndefined();
  });
});
