import {renderHook} from '@testing-library/react';
import * as THREE from 'three';
import {afterEach, describe, expect, it, vi} from 'vitest';
import type {HouseConfigType} from '../configs/house';
import {AppProvider} from '../contexts/AppContext';
import {getOutdoorFloors} from '../rendering/floorPlan';
import {useTemperatureMap} from './useTemperatureMap';

const entities = [
  {entity_id: 'sensor.living_room_temperature', state: '21'},
  {entity_id: 'sensor.terrace_temperature', state: '5'},
];

vi.mock('@hakit/core', () => ({
  useEntities: (ids: string[]) =>
    ids.map(id => entities.find(entity => entity.entity_id === id) ?? null),
}));

const plane = (name: string, x: number) => {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.MeshStandardMaterial({name}),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, 0, 1);
  return mesh;
};

// Un séjour de 2 m et une terrasse de 2 m, de plain-pied.
const scene = new THREE.Group().add(plane('room_1', 1), plane('room_2', 3));

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
    outdoor: true,
    position: {x: 3, y: 2.5, z: 1},
    items: [
      {
        type: 'temperature',
        roomDisplay: true,
        temperatureEntityId: 'sensor.terrace_temperature',
      },
    ],
  },
];
const outdoorFloors = getOutdoorFloors(scene, rooms);

describe('useTemperatureMap', () => {
  afterEach(() => localStorage.clear());

  it('laisse la terrasse et sa sonde hors de la carte', () => {
    const {result} = renderHook(() =>
      useTemperatureMap(scene, rooms, outdoorFloors, true),
    );
    const map = result.current!;
    // FloorMap type sa texture en Texture : celle de la carte est une DataTexture.
    const {width, data} = (map.texture as THREE.DataTexture).image;

    expect(width).toBe(20);
    const middle = (map.minTemp + map.maxTemp) / 2;
    expect(middle + THREE.DataUtils.fromHalfFloat(data![15])).toBeCloseTo(21);
    expect(map).toMatchObject({minTemp: 19, maxTemp: 23});
  });

  it('suit l’échelle choisie dans la modale Configuration', () => {
    localStorage.setItem(
      'graphics-options',
      JSON.stringify({heatmapScale: 'soft'}),
    );
    const {result} = renderHook(
      () => useTemperatureMap(scene, rooms, outdoorFloors, true),
      {wrapper: AppProvider},
    );

    expect(result.current).toMatchObject({minTemp: 17, maxTemp: 25});
  });

  it('ne calcule rien sans la carte', () => {
    const {result} = renderHook(() =>
      useTemperatureMap(scene, rooms, outdoorFloors, false),
    );

    expect(result.current).toBeUndefined();
  });
});
