import * as THREE from 'three';
import {bakedLight, type LightMaps} from '../common';

const uniforms = {
  bakedSkyLight: {value: bakedLight.sky},
  bakedSunLight: {value: bakedLight.sun},
  bakedSunMap: {value: null as THREE.Texture | null},
};

// Les cartes stockent la lumière divisée par 1,5, en sRGB
// (scripts/bake-lighting.py). Lambert divise ensuite l'irradiance par π.
const LIGHT_MAPS = THREE.ShaderChunk.lights_fragment_maps.replace(
  'lightMapTexel.rgb * lightMapIntensity',
  `1.5 * PI * (
    bakedSkyLight * lightMapTexel.rgb +
    bakedSunLight * texture2D(bakedSunMap, vLightMapUv).rgb
  )`,
);

/** La carte du ciel devient la lightMap du matériau, celle du soleil s'y ajoute. */
export function applyBakedLightWebGl(
  material: THREE.MeshLambertMaterial,
  maps: LightMaps,
) {
  material.lightMap = maps.sky;
  uniforms.bakedSunMap.value = maps.sun;
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, uniforms);
    shader.fragmentShader = `uniform vec3 bakedSkyLight;
uniform vec3 bakedSunLight;
uniform sampler2D bakedSunMap;
${shader.fragmentShader.replace('#include <lights_fragment_maps>', LIGHT_MAPS)}`;
  };
}
