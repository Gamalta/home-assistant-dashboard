import * as THREE from 'three';
import type {RenderBackend} from './types';
import {createHideWallsMaterialWebGl} from '../House/shaders/HideWallsMaterial/WebGL';
import {
  createHeatmapGroundMaterialWebGl,
  updateHeatmapGroundMaterialWebGl,
} from '../House/shaders/HeatmapGroundMaterial/WebGL';

export const webGLBackend: RenderBackend = {
  kind: 'webgl',
  createRenderer: async defaults =>
    new THREE.WebGLRenderer({
      ...defaults,
      powerPreference: 'high-performance',
      antialias: false,
    }),
  createHideWallsMaterial: source =>
    createHideWallsMaterialWebGl(source as THREE.MeshStandardMaterial),
  createHeatmapMaterial: createHeatmapGroundMaterialWebGl,
  updateHeatmapMaterial: (material, points) =>
    updateHeatmapGroundMaterialWebGl(material as THREE.ShaderMaterial, points),
  getMaxTextures: renderer =>
    renderer instanceof THREE.WebGLRenderer
      ? renderer.capabilities.maxTextures
      : null,
};
