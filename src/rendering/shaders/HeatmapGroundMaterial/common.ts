import * as THREE from 'three';
import {CELL_SIZE, type FloorPlan} from '../../floorPlan';
import type {FloorMap} from '../VacuumMapGroundMaterial/common';

export type HeatmapPoint = {
  x: number;
  z: number;
  temperature: number;
};

/**
 * Températures du sol (°C, écart au milieu de l'échelle), posées sur le sol
 * comme le plan de l'aspirateur.
 */
export type TemperatureMap = FloorMap & {minTemp: number; maxTemp: number};

/**
 * Écart minimal (en °C) entre les bornes de l'échelle de couleurs : deux
 * degrés d'écart n'en occupent qu'un tiers, au lieu d'aller du bleu au rouge.
 */
const MIN_TEMPERATURE_SPREAD = 6;

/**
 * Bornes de l'échelle de couleurs, des capteurs le plus froid au plus chaud,
 * élargies autour de leur milieu quand ils sont proches.
 */
export function getTemperatureRange(points: HeatmapPoint[]) {
  if (!points.length) return {minTemp: 0, maxTemp: MIN_TEMPERATURE_SPREAD};
  const temperatures = points.map(point => point.temperature);
  const minTemp = Math.min(...temperatures);
  const maxTemp = Math.max(...temperatures);
  if (maxTemp - minTemp >= MIN_TEMPERATURE_SPREAD) return {minTemp, maxTemp};
  const middle = (minTemp + maxTemp) / 2;
  return {
    minTemp: middle - MIN_TEMPERATURE_SPREAD / 2,
    maxTemp: middle + MIN_TEMPERATURE_SPREAD / 2,
  };
}

/**
 * `field` : température de chaque cellule du plan ; échelle des `points`. La
 * texture garde l'écart au milieu de l'échelle.
 */
export function createTemperatureMap(
  plan: FloorPlan,
  field: Float32Array,
  points: HeatmapPoint[],
): TemperatureMap {
  const range = getTemperatureRange(points);
  // Demi-flottants : filtrés linéairement partout, ce que les flottants ne
  // garantissent pas sur mobile. Vers 21 °C, ils ne gardent que le 64e de
  // degré, et les isothermes s'élargissent en escalier ; à 3 °C du milieu de
  // l'échelle, le millième.
  const middle = (range.minTemp + range.maxTemp) / 2;
  const texture = new THREE.DataTexture(
    Uint16Array.from(field, value =>
      THREE.DataUtils.toHalfFloat(value - middle),
    ),
    plan.width,
    plan.height,
    THREE.RedFormat,
    THREE.HalfFloatType,
  );
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  const sizeX = plan.width * CELL_SIZE;
  const sizeZ = plan.height * CELL_SIZE;
  return {
    texture,
    uv: [
      [1 / sizeX, 0, -plan.minX / sizeX],
      [0, 1 / sizeZ, -plan.minZ / sizeZ],
    ],
    ...range,
  };
}
