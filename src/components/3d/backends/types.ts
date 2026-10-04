import type * as THREE from 'three';
import type {HeatmapPoint} from '../House/shaders/HeatmapGroundMaterial/common';

/**
 * Tout ce qui dépend du moteur de rendu (WebGL ou WebGPU). Chaque
 * implémentation est chargée à la demande pour ne pas embarquer
 * `three/webgpu` quand on utilise WebGL (et inversement).
 */
export type RenderBackend = {
  kind: 'webgl' | 'webgpu';
  /** `defaults` : paramètres fournis par R3F (canvas, alpha...). */
  createRenderer: (
    defaults: THREE.WebGLRendererParameters,
  ) => Promise<THREE.WebGLRenderer>;
  createHideWallsMaterial: (source: THREE.Material) => THREE.Material;
  createHeatmapMaterial: (points: HeatmapPoint[]) => THREE.Material;
  updateHeatmapMaterial: (
    material: THREE.Material,
    points: HeatmapPoint[],
  ) => void;
  getMaxTextures: (renderer: unknown) => number | null;
  /** API et GPU réellement utilisés (ex : rendu logiciel, secours WebGL2). */
  describeGpu: (renderer: unknown) => string;
  /** Attend que le GPU ait terminé le travail déjà soumis. */
  waitForGpu: (renderer: unknown) => Promise<void>;
};
