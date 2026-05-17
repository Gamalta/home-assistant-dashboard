import {createHeatmapGroundMaterialWebGl} from './WebGL';
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
