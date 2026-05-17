import {MeshStandardMaterial} from 'three';
import {createHideWallsMaterialWebGl} from './WebGL';
import {createHideWallsMaterialWebGPU} from './WebGPU';

export const createHideWallsMaterial = (
  webGPU: boolean,
  material: MeshStandardMaterial,
) =>
  webGPU
    ? createHideWallsMaterialWebGPU(material)
    : createHideWallsMaterialWebGl(material);
