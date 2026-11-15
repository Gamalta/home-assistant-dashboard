import type * as THREE from 'three';
import type {TemperatureMap} from '../shaders/HeatmapGroundMaterial/common';
import type {LightMaps} from '../shaders/BakedLight/common';
import type {FloorMap} from '../shaders/VacuumMapGroundMaterial/common';

export type RenderBackend = {
  kind: 'webgl' | 'webgpu';
  createRenderer: (
    defaults: THREE.WebGLRendererParameters,
  ) => Promise<THREE.WebGLRenderer>;
  createHideWallsMaterials: (source: THREE.Material) => {
    opaque: THREE.Material;
    fade: THREE.Material;
  };
  createHeatmapMaterial: (map: TemperatureMap) => THREE.Material;
  updateHeatmapMaterial: (
    material: THREE.Material,
    map: TemperatureMap,
  ) => void;
  createVacuumMapMaterial: (floorMap: FloorMap) => THREE.Material;
  updateVacuumMapMaterial: (
    material: THREE.Material,
    floorMap: FloorMap,
  ) => void;
  /** Absent : le backend ne lit pas l'éclairage précalculé (repli Clair doux). */
  applyBakedLight?: (
    material: THREE.MeshLambertMaterial,
    maps: LightMaps,
  ) => void;
  getMaxTextures: (renderer: unknown) => number | null;
  describeGpu: (renderer: unknown) => string;
  waitForGpu: (renderer: unknown) => Promise<void>;
  compile: (
    renderer: unknown,
    scene: THREE.Object3D,
    camera: THREE.Camera,
  ) => Promise<void>;
};
