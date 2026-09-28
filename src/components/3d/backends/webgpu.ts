import type * as THREE from 'three';
import {WebGPURenderer} from 'three/webgpu';
import type {WebGPURendererParameters} from 'three/src/renderers/webgpu/WebGPURenderer.js';
import type {RenderBackend} from './types';
import {createHideWallsMaterialWebGPU} from '../House/shaders/HideWallsMaterial/WebGPU';
import {
  createHeatmapGroundMaterialWebGPU,
  updateHeatmapGroundMaterialWebGPU,
} from '../House/shaders/HeatmapGroundMaterial/WebGPU';

export const webGPUBackend: RenderBackend = {
  kind: 'webgpu',
  createRenderer: async defaults => {
    const renderer = new WebGPURenderer({
      ...(defaults as WebGPURendererParameters),
      powerPreference: 'high-performance',
      antialias: false,
    });
    await renderer.init();
    // R3F est typé pour WebGLRenderer mais accepte le renderer WebGPU.
    return renderer as unknown as THREE.WebGLRenderer;
  },
  createHideWallsMaterial: source =>
    createHideWallsMaterialWebGPU(source as THREE.MeshStandardMaterial),
  createHeatmapMaterial: createHeatmapGroundMaterialWebGPU,
  updateHeatmapMaterial: updateHeatmapGroundMaterialWebGPU,
  // Pas d'équivalent exposé par WebGPURenderer.
  getMaxTextures: () => null,
};
