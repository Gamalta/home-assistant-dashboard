import * as THREE from 'three';
import {describe, expect, it} from 'vitest';
import type {FloorPlan} from '../../floorPlan';
import {
  HeatmapPoint,
  createTemperatureMap,
  getTemperatureRange,
} from './common';

const point = (temperature: number, x = 0): HeatmapPoint => ({
  x,
  z: 0,
  temperature,
});

describe('getTemperatureRange', () => {
  it('prend la température minimale et maximale', () => {
    expect(getTemperatureRange([point(20), point(26.5), point(18)])).toEqual({
      minTemp: 18,
      maxTemp: 26.5,
    });
  });

  it("élargit l'échelle à 6 °C autour du milieu si les températures sont proches", () => {
    expect(getTemperatureRange([point(18), point(20)])).toEqual({
      minTemp: 16,
      maxTemp: 22,
    });
  });

  it('renvoie une échelle non nulle sans capteur', () => {
    expect(getTemperatureRange([])).toEqual({minTemp: 0, maxTemp: 6});
  });
});

describe('createTemperatureMap', () => {
  // 3 × 2 cellules de 10 cm, coin en (-1, 2).
  const plan: FloorPlan = {
    width: 3,
    height: 2,
    minX: -1,
    minZ: 2,
    floor: new Uint8Array(6).fill(1),
  };
  const field = new Float32Array(6).fill(20);

  it('étend la texture sur le plan, vu de dessus', () => {
    const {texture, uv} = createTemperatureMap(plan, field, [point(20)]);
    const at = (x: number, z: number) => [
      new THREE.Vector3(...uv[0]).dot(new THREE.Vector3(x, z, 1)),
      new THREE.Vector3(...uv[1]).dot(new THREE.Vector3(x, z, 1)),
    ];

    expect(texture.image).toMatchObject({width: 3, height: 2});
    expect(at(-1, 2)).toEqual([0, 0]);
    expect(at(-0.7, 2.2)[0]).toBeCloseTo(1);
    expect(at(-0.7, 2.2)[1]).toBeCloseTo(1);
  });

  it('garde l’écart au milieu de l’échelle, au millième de degré', () => {
    const {texture, minTemp, maxTemp} = createTemperatureMap(
      plan,
      Float32Array.of(21.501, 20, 20, 20, 20, 20),
      [point(20)],
    );
    const data = (texture as THREE.DataTexture).image.data as Uint16Array;

    expect(
      (minTemp + maxTemp) / 2 + THREE.DataUtils.fromHalfFloat(data[0]),
    ).toBeCloseTo(21.501, 3);
  });
});
