import * as THREE from 'three';
import hideWallsCommonVertex from './hideWallsCommon.vertex.glsl?raw';
import hideWallsWorldPosVertex from './hideWallsWorldPos.vertex.glsl?raw';
import hideWallsCommonFragment from './hideWallsCommon.fragment.glsl?raw';
import hideWallsClipFragment from './hideWallsClip.fragment.glsl?raw';
import hideWallsFadeFragment from './hideWallsFade.fragment.glsl?raw';
import {FADE_RADIUS} from '../common';

type WallMaterial = THREE.MeshStandardMaterial | THREE.MeshLambertMaterial;

function createVariant(source: WallMaterial, fade: boolean) {
  const material = source.clone();
  if (fade) {
    material.defines = {...material.defines, HIDE_WALLS_FADE: ''};
    material.transparent = true;
    material.depthWrite = false;
  }

  material.onBeforeCompile = shader => {
    shader.uniforms.fadeRadius = {value: FADE_RADIUS};
    shader.uniforms.minOpacity = {value: 0.05};
    shader.uniforms.nearFadeDistance = {value: 6.0};
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', hideWallsCommonVertex)
      .replace('#include <worldpos_vertex>', hideWallsWorldPosVertex);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', hideWallsCommonFragment)
      .replace('#include <clipping_planes_fragment>', hideWallsClipFragment)
      .replace('#include <dithering_fragment>', hideWallsFadeFragment);
  };

  return material;
}

export function createHideWallsMaterialsWebGl(source: WallMaterial) {
  return {
    opaque: createVariant(source, false),
    fade: createVariant(source, true),
  };
}
