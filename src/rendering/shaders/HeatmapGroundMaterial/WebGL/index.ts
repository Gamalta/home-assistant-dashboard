import * as THREE from 'three';
import heatmapGroundFragment from './heatmapGround.fragment.glsl?raw';
import heatmapGroundVertex from './heatmapGround.vertex.glsl?raw';
import type {TemperatureMap} from '../common';

export function createHeatmapGroundMaterialWebGl(map: TemperatureMap) {
  const material = new THREE.ShaderMaterial({
    name: 'heatmapGround',
    transparent: false,
    depthWrite: false,
    side: THREE.FrontSide,
    uniforms: {
      map: {value: null},
      uRow: {value: new THREE.Vector3()},
      vRow: {value: new THREE.Vector3()},
      minTemp: {value: 0},
      maxTemp: {value: 1},
    },
    vertexShader: heatmapGroundVertex,
    fragmentShader: heatmapGroundFragment,
  });
  updateHeatmapGroundMaterialWebGl(material, map);
  return material;
}

export function updateHeatmapGroundMaterialWebGl(
  material: THREE.ShaderMaterial,
  map: TemperatureMap,
) {
  const {uniforms} = material;
  uniforms.map.value = map.texture;
  uniforms.uRow.value.fromArray(map.uv[0]);
  uniforms.vRow.value.fromArray(map.uv[1]);
  uniforms.minTemp.value = map.minTemp;
  uniforms.maxTemp.value = map.maxTemp;
}
