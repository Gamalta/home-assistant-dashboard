import * as THREE from 'three';
import groundVertex from '../../HeatmapGroundMaterial/WebGL/heatmapGround.vertex.glsl?raw';
import vacuumMapGroundFragment from './vacuumMapGround.fragment.glsl?raw';
import {FLOOR_COLOR, type FloorMap} from '../common';

export function createVacuumMapGroundMaterialWebGl(floorMap: FloorMap) {
  const material = new THREE.ShaderMaterial({
    name: 'vacuumMapGround',
    depthWrite: false,
    uniforms: {
      map: {value: null},
      uRow: {value: new THREE.Vector3()},
      vRow: {value: new THREE.Vector3()},
      floorColor: {value: new THREE.Color(FLOOR_COLOR)},
    },
    // Même sommet que la carte des températures : la position du sol.
    vertexShader: groundVertex,
    fragmentShader: vacuumMapGroundFragment,
  });
  updateVacuumMapGroundMaterialWebGl(material, floorMap);
  return material;
}

export function updateVacuumMapGroundMaterialWebGl(
  material: THREE.ShaderMaterial,
  floorMap: FloorMap,
) {
  const {uniforms} = material;
  uniforms.map.value = floorMap.texture;
  uniforms.uRow.value.fromArray(floorMap.uv[0]);
  uniforms.vRow.value.fromArray(floorMap.uv[1]);
}
