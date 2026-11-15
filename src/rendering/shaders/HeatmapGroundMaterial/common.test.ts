import * as THREE from 'three';
import {describe, expect, it} from 'vitest';
import type {FloorPlan} from '../../floorPlan';
import {
  HeatmapPoint,
  createTemperatureMap,
  getTemperatureRange,
  heatmapColor,
  heatmapGradient,
} from './common';

const point = (temperature: number, x = 0): HeatmapPoint => ({
  x,
  z: 0,
  temperature,
});

describe('getTemperatureRange', () => {
  it('prend la température minimale et maximale', () => {
    expect(getTemperatureRange([point(20), point(26.5), point(18)], 8)).toEqual(
      {minTemp: 18, maxTemp: 26.5},
    );
  });

  it("élargit l'échelle autour du milieu si les températures sont proches", () => {
    expect(getTemperatureRange([point(18), point(20)], 8)).toEqual({
      minTemp: 15,
      maxTemp: 23,
    });
  });

  it('renvoie une échelle non nulle sans capteur', () => {
    expect(getTemperatureRange([], 8)).toEqual({minTemp: 0, maxTemp: 8});
  });
});

describe('heatmapColor', () => {
  it('reprend les couleurs du sol, du plus froid au plus chaud', () => {
    expect(heatmapColor(0)).toBe('rgb(26 51 204)');
    expect(heatmapColor(0.5)).toBe('rgb(153 230 51)');
    expect(heatmapColor(1)).toBe('rgb(255 0 0)');
  });

  it('s’arrête aux bornes de l’échelle', () => {
    expect(heatmapColor(-1)).toBe(heatmapColor(0));
    expect(heatmapColor(2)).toBe(heatmapColor(1));
  });
});

describe('heatmapGradient', () => {
  it('reprend toute l’échelle, une couleur tous les cinquièmes', () => {
    expect(heatmapGradient(0, 1)).toBe(
      'linear-gradient(to right, rgb(26 51 204) 0.0%, rgb(0 128 255) 20.0%, ' +
        'rgb(51 204 77) 40.0%, rgb(255 255 26) 60.0%, rgb(255 128 0) 80.0%, ' +
        'rgb(255 0 0) 100.0%)',
    );
  });

  it('ne garde que les couleurs entre ses bornes', () => {
    expect(heatmapGradient(0.25, 0.75)).toBe(
      `linear-gradient(to right, ${heatmapColor(0.25)} 0.0%, ` +
        'rgb(51 204 77) 30.0%, rgb(255 255 26) 70.0%, ' +
        `${heatmapColor(0.75)} 100.0%)`,
    );
  });

  it('se réduit à une couleur pour une seule température', () => {
    expect(heatmapGradient(0.5, 0.5)).toBe(
      `linear-gradient(to right, ${heatmapColor(0.5)} 0.0%, ${heatmapColor(0.5)} 0.0%)`,
    );
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
    const {texture, uv} = createTemperatureMap(plan, field, [point(20)], 8);
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
      8,
    );
    const data = (texture as THREE.DataTexture).image.data as Uint16Array;

    expect(
      (minTemp + maxTemp) / 2 + THREE.DataUtils.fromHalfFloat(data[0]),
    ).toBeCloseTo(21.501, 3);
  });
});
