import * as THREE from 'three';
import {expect, it} from 'vitest';
import {createWallFade} from './wallFade';

function createWall(positions: number[]) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute(
    'normal',
    new THREE.Float32BufferAttribute(
      positions.map((_, i) => (i % 3 === 2 ? 1 : 0)),
      3,
    ),
  );
  return new THREE.Mesh(geometry);
}

const red = new THREE.Color('red');
const blue = new THREE.Color('blue');

it('réunit les murs en coordonnées monde, avec la couleur de chacun', () => {
  const near = createWall([0, 0, 0, 1, 0, 0, 0, 1, 0]);
  near.position.z = 2;

  const {geometry} = createWallFade([
    {mesh: createWall([0, 0, 0, 1, 0, 0, 0, 1, 0]), color: red},
    {mesh: near, color: blue},
  ]);

  expect(geometry.attributes.position.getZ(3)).toBe(2);
  expect(geometry.attributes.color.getX(0)).toBe(1);
  expect(geometry.attributes.color.getZ(3)).toBe(1);
});

it('dessine les objets du plus loin au plus proche, chacun d’un bloc', () => {
  // Deux triangles reliés par un sommet (un objet, centré à z = 2), et un
  // triangle seul à z = 2,5, d'un autre matériau.
  const {geometry, sort} = createWallFade([
    {
      mesh: createWall([0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 4, 0, 2, 4]),
      color: red,
    },
    {mesh: createWall([2, 0, 2.5, 3, 0, 2.5, 2, 1, 2.5]), color: blue},
  ]);
  const camera = new THREE.PerspectiveCamera();
  camera.position.set(0, 0, -5);
  camera.lookAt(0, 0, 0);

  sort(camera);

  expect(Array.from(geometry.index!.array)).toEqual([
    6, 7, 8, 3, 4, 5, 0, 1, 2,
  ]);
});

it('ne dessine pas les murs trop loin pour s’effacer', () => {
  const {geometry, sort} = createWallFade([
    {mesh: createWall([0, 0, 0, 1, 0, 0, 0, 1, 0]), color: red},
    {mesh: createWall([0, 0, 20, 1, 0, 20, 0, 1, 20]), color: blue},
  ]);
  const camera = new THREE.PerspectiveCamera();
  camera.position.set(0, 0, -5);
  camera.lookAt(0, 0, 0);

  sort(camera);

  expect(geometry.drawRange.count).toBe(3);
  expect(Array.from(geometry.index!.array).slice(0, 3)).toEqual([0, 1, 2]);
});
