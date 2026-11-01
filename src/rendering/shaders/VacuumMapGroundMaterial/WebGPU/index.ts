import * as THREE from 'three/webgpu';
import {
  dot,
  mix,
  positionWorld,
  step,
  texture,
  uniform,
  vec2,
  vec3,
  vec4,
} from 'three/tsl';
import {FLOOR_COLOR, type FloorMap} from '../common';

type VacuumMapUniforms = {
  map: THREE.TextureNode;
  uRow: THREE.UniformNode<'vec3', THREE.Vector3>;
  vRow: THREE.UniformNode<'vec3', THREE.Vector3>;
};

type VacuumMapNodeMaterial = THREE.MeshBasicNodeMaterial & {
  userData: {vacuumMapUniforms?: VacuumMapUniforms};
};

export function createVacuumMapGroundMaterialWebGPU(floorMap: FloorMap) {
  const uRow = uniform(new THREE.Vector3());
  const vRow = uniform(new THREE.Vector3());
  // u = dot(uRow, (x, z, 1)) sur le sol, v de même.
  const point = vec3(positionWorld.x, positionWorld.z, 1);
  const uv = vec2(dot(uRow, point), dot(vRow, point));
  const map = texture(floorMap.texture, uv);
  // Hors de l'image, le bord de la texture, étiré, ne déborde pas sur le sol.
  const inside = step(0, uv.x)
    .mul(step(uv.x, 1))
    .mul(step(0, uv.y))
    .mul(step(uv.y, 1));

  const material = new THREE.MeshBasicNodeMaterial() as VacuumMapNodeMaterial;
  material.name = 'vacuumMapGround';
  material.depthWrite = false;
  const floor = new THREE.Color(FLOOR_COLOR);
  material.colorNode = vec4(
    mix(vec3(floor.r, floor.g, floor.b), map.rgb, map.a.mul(inside)),
    1,
  );
  material.userData.vacuumMapUniforms = {map, uRow, vRow};
  updateVacuumMapGroundMaterialWebGPU(material, floorMap);
  return material;
}

export function updateVacuumMapGroundMaterialWebGPU(
  material: THREE.Material,
  floorMap: FloorMap,
) {
  const uniforms = (material as VacuumMapNodeMaterial).userData
    .vacuumMapUniforms;
  if (!uniforms) return;
  uniforms.map.value = floorMap.texture;
  uniforms.uRow.value.fromArray(floorMap.uv[0]);
  uniforms.vRow.value.fromArray(floorMap.uv[1]);
}
