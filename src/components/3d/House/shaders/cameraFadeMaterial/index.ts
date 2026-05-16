import * as THREE from 'three';
import fadeCommonVertex from './fadeCommon.vertex.glsl?raw';
import fadeWorldPosVertex from './fadeWorldPos.vertex.glsl?raw';
import fadeCommonFragment from './fadeCommon.fragment.glsl?raw';
import fadeDitherFragment from './fadeDither.fragment.glsl?raw';

export type FadeMaterial = THREE.MeshStandardMaterial & {
  userData: {
    shader?: THREE.WebGLProgramParametersWithUniforms;
  };
};

export function createCameraFadeMaterial(
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
      fadeCommonVertex,
    );
    shader.vertexShader = shader.vertexShader.replace(
      '#include <worldpos_vertex>',
      fadeWorldPosVertex,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      fadeCommonFragment,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      fadeDitherFragment,
    );
  };

  return material;
}
