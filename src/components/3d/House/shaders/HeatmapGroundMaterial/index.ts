import * as THREE from 'three';
import {
  createHeatmapGroundMaterialWebGl,
  updateHeatmapGroundMaterialWebGl,
} from './WebGL';
import {createHeatmapGroundMaterialWebGPU} from './WebGPU';

export type HeatmapPoint = {
  x: number;
  z: number;
  temperature: number;
};

export const createHeatmapGroundMaterial = (
  webGPU: boolean,
  points: HeatmapPoint[],
) =>
  webGPU
    ? createHeatmapGroundMaterialWebGPU(points)
    : createHeatmapGroundMaterialWebGl(points);

export const updateHeatmapGroundMaterial = (
  webGPU: boolean,
  material: THREE.Material,
  points: HeatmapPoint[],
): boolean => {
  if (webGPU) return false;
  updateHeatmapGroundMaterialWebGl(material as THREE.ShaderMaterial, points);
  return true;
};
