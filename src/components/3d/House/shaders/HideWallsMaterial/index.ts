import * as THREE from 'three';
import hideWallsCommonVertex from './hideWallsCommon.vertex.glsl?raw';
import hideWallsWorldPosVertex from './hideWallsWorldPos.vertex.glsl?raw';
import hideWallsCommonFragment from './hideWallsCommon.fragment.glsl?raw';
import hideWallsDitheringFragment from './hideWallsDithering.fragment.glsl?raw';

export type FadeMaterial = THREE.MeshStandardMaterial & {
  userData: {
    shader?: THREE.WebGLProgramParametersWithUniforms;
  };
};

export function createHideWallsMaterial(
  source: THREE.MeshStandardMaterial,
): FadeMaterial {
  const material = source.clone() as FadeMaterial;
  material.transparent = true;
  material.depthWrite = true;

  material.onBeforeCompile = shader => {
    material.userData.shader = shader;
    shader.uniforms.fadeRadius = {value: 8.0};
    shader.uniforms.minOpacity = {value: 0.05};
    shader.uniforms.nearFadeDistance = {value: 6.0};
    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      hideWallsCommonVertex,
    );
    shader.vertexShader = shader.vertexShader.replace(
      '#include <worldpos_vertex>',
      hideWallsWorldPosVertex,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      hideWallsCommonFragment,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      hideWallsDitheringFragment,
    );
  };

  return material;
}
