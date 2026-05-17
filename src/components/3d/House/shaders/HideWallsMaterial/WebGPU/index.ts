import * as THREE from 'three';
import {MeshStandardNodeMaterial} from 'three/webgpu';
import {
  positionWorld,
  cameraPosition,
  distance,
  uniform,
  smoothstep,
  mix,
} from 'three/tsl';

export function createHideWallsMaterialWebGPU(
  source: THREE.MeshStandardMaterial,
) {
  const material = new MeshStandardNodeMaterial();
  material.color.copy(source.color);
  material.roughness = source.roughness;
  material.metalness = source.metalness;

  const fadeRadius = uniform(8.0);
  const minOpacity = uniform(0.05);
  const nearFadeDistance = uniform(6.0);
  const dist = distance(cameraPosition, positionWorld);
  const near = dist.lessThan(nearFadeDistance).toFloat();
  const fadeT = smoothstep(nearFadeDistance, fadeRadius, dist);
  const opacityNode = mix(minOpacity, 1.0, fadeT);
  material.opacityNode = mix(opacityNode, minOpacity, near);
  material.transparent = true;
  material.depthWrite = false;

  return material;
}
