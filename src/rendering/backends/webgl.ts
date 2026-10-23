import * as THREE from 'three';
import type {RenderBackend} from './types';
import {describeWebGlContext, waitForWebGlContext} from './webglInfo';
import {createHideWallsMaterialsWebGl} from '../shaders/HideWallsMaterial/WebGL';
import {
  createHeatmapGroundMaterialWebGl,
  updateHeatmapGroundMaterialWebGl,
} from '../shaders/HeatmapGroundMaterial/WebGL';

export const webGLBackend: RenderBackend = {
  kind: 'webgl',
  createRenderer: async defaults =>
    new THREE.WebGLRenderer({
      ...defaults,
      powerPreference: 'high-performance',
      antialias: false,
    }),
  createHideWallsMaterials: source =>
    createHideWallsMaterialsWebGl(
      source as THREE.MeshStandardMaterial | THREE.MeshLambertMaterial,
    ),
  createHeatmapMaterial: createHeatmapGroundMaterialWebGl,
  updateHeatmapMaterial: (material, points) =>
    updateHeatmapGroundMaterialWebGl(material as THREE.ShaderMaterial, points),
  getMaxTextures: renderer =>
    renderer instanceof THREE.WebGLRenderer
      ? renderer.capabilities.maxTextures
      : null,
  describeGpu: renderer =>
    renderer instanceof THREE.WebGLRenderer
      ? `WebGL · ${describeWebGlContext(renderer.getContext())}`
      : '—',
  waitForGpu: async renderer => {
    if (renderer instanceof THREE.WebGLRenderer) {
      waitForWebGlContext(renderer.getContext());
    }
  },
};
