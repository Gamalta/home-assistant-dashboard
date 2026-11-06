import {renderHook} from '@testing-library/react';
import * as THREE from 'three';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {HouseConfigType} from '../configs/house';
import {useTemperatureMap} from './useTemperatureMap';

const {entities} = vi.hoisted(() => ({entities: {current: [] as object[]}}));

vi.mock('@hakit/core', () => ({
  useEntities: (ids: string[]) =>
    ids.map(
      id =>
        entities.current.find(
          entity => (entity as {entity_id: string}).entity_id === id,
        ) ?? null,
    ),
}));

// Un séjour de 2 m et une terrasse de 2 m, séparés en x = 2 m par un mur
// percé d'une porte-fenêtre.
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(4, 2),
  new THREE.MeshStandardMaterial({name: 'room_1'}),
);
floor.rotation.x = -Math.PI / 2;
floor.position.set(2, 0, 1);
const wall = new THREE.Mesh(
  new THREE.BoxGeometry(0.1, 2.5, 1.4),
  new THREE.MeshStandardMaterial({name: 'wall_1'}),
);
wall.position.set(2, 1.25, 0.7);
const scene = new THREE.Group().add(floor, wall);

const rooms: HouseConfigType['rooms'] = [
  {
    id: 'Living_room',
    name: 'Séjour',
    position: {x: 1, y: 2.5, z: 1},
    items: [
      {
        type: 'temperature',
        roomDisplay: true,
        temperatureEntityId: 'sensor.living_room_temperature',
      },
    ],
  },
  {
    id: 'Terrace',
    name: 'Terrasse',
    position: {x: 3, y: 2.5, z: 1},
    outdoor: true,
  },
];

// FloorMap type sa texture en Texture : celle de la carte est une DataTexture.
const temperatureAt = (texture: THREE.Texture, x: number, z: number) =>
  THREE.DataUtils.fromHalfFloat(
    (texture as THREE.DataTexture).image.data![
      Math.floor(z / 0.1) * 40 + Math.floor(x / 0.1)
    ],
  );
const render = () =>
  renderHook(() => useTemperatureMap(scene, rooms, 'weather.home', true)).result
    .current!;

describe('useTemperatureMap', () => {
  beforeEach(() => {
    entities.current = [
      {entity_id: 'sensor.living_room_temperature', state: '21'},
    ];
  });

  it('une terrasse prend la température extérieure', () => {
    entities.current.push({
      entity_id: 'weather.home',
      state: 'sunny',
      attributes: {temperature: 5},
    });
    const map = render();

    expect(temperatureAt(map.texture, 3.5, 0.5)).toBeCloseTo(5, 0);
    expect(temperatureAt(map.texture, 1, 1)).toBeCloseTo(21, 0);
    // L'échelle reste celle de l'intérieur.
    expect(map).toMatchObject({minTemp: 20.5, maxTemp: 21.5});
  });

  it('météo indisponible', () => {
    entities.current.push({
      entity_id: 'weather.home',
      state: 'unavailable',
      attributes: {},
    });
    const map = render();

    expect(temperatureAt(map.texture, 3.5, 0.5)).toBeCloseTo(21);
  });

  it('ne calcule rien sans la carte', () => {
    const {result} = renderHook(() =>
      useTemperatureMap(scene, rooms, 'weather.home', false),
    );

    expect(result.current).toBeUndefined();
  });
});
