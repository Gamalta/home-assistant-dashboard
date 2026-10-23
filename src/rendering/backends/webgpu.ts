import type * as THREE from 'three';
import {WebGPURenderer} from 'three/webgpu';
import type {WebGPURendererParameters} from 'three/src/renderers/webgpu/WebGPURenderer.js';
import type {RenderBackend} from './types';
import {describeWebGlContext, waitForWebGlContext} from './webglInfo';

type BackendInternals = {
  isWebGLBackend?: boolean;
  gl?: WebGLRenderingContext;
  device?: GPUDevice;
};

// WebGPURenderer bascule seul sur WebGL2 si WebGPU échoue : on regarde le
// backend effectivement utilisé.
const getBackend = (renderer: unknown) =>
  (renderer as {backend: BackendInternals}).backend;
import {createHideWallsMaterialsWebGPU} from '../shaders/HideWallsMaterial/WebGPU';
import {
  createHeatmapGroundMaterialWebGPU,
  updateHeatmapGroundMaterialWebGPU,
} from '../shaders/HeatmapGroundMaterial/WebGPU';

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
  createHideWallsMaterials: source =>
    createHideWallsMaterialsWebGPU(
      source as THREE.MeshStandardMaterial | THREE.MeshLambertMaterial,
    ),
  createHeatmapMaterial: createHeatmapGroundMaterialWebGPU,
  updateHeatmapMaterial: updateHeatmapGroundMaterialWebGPU,
  // Pas d'équivalent exposé par WebGPURenderer.
  getMaxTextures: () => null,
  describeGpu: renderer => {
    const {isWebGLBackend, gl, device} = getBackend(renderer);
    if (isWebGLBackend && gl) {
      return `WebGPU → secours WebGL2 · ${describeWebGlContext(gl)}`;
    }
    const info = device?.adapterInfo;
    if (!info) return 'WebGPU';
    const name =
      info.description ||
      [info.vendor, info.architecture, info.device].filter(Boolean).join(' ');
    return `WebGPU · ${name || 'GPU inconnu'}${
      info.isFallbackAdapter ? ' (rendu logiciel)' : ''
    }`;
  },
  waitForGpu: async renderer => {
    const {isWebGLBackend, gl, device} = getBackend(renderer);
    if (isWebGLBackend && gl) waitForWebGlContext(gl);
    else await device?.queue.onSubmittedWorkDone();
  },
};
