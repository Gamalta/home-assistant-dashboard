import type * as THREE from 'three';
import type {HeatmapPoint} from '../shaders/HeatmapGroundMaterial/common';

export type RenderBackend = {
  kind: 'webgl' | 'webgpu';
  createRenderer: (
    defaults: THREE.WebGLRendererParameters,
  ) => Promise<THREE.WebGLRenderer>;
  createHideWallsMaterials: (source: THREE.Material) => {
    opaque: THREE.Material;
    fade: THREE.Material;
  };
  createHeatmapMaterial: (points: HeatmapPoint[]) => THREE.Material;
  updateHeatmapMaterial: (
    material: THREE.Material,
    points: HeatmapPoint[],
  ) => void;
  getMaxTextures: (renderer: unknown) => number | null;
  describeGpu: (renderer: unknown) => string;
  waitForGpu: (renderer: unknown) => Promise<void>;
};
