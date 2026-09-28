import * as THREE from 'three';
import {MeshStandardNodeMaterial, type Node} from 'three/webgpu';
import {
  positionWorld,
  cameraPosition,
  distance,
  uniform,
  smoothstep,
  mix,
  materialOpacity,
} from 'three/tsl';

export function createHideWallsMaterialWebGPU(
  source: THREE.MeshStandardMaterial,
) {
  const material = new MeshStandardNodeMaterial();
  material.name = source.name;
  material.color.copy(source.color);
  material.map = source.map;
  material.side = source.side;
  material.opacity = source.opacity;
  material.roughness = source.roughness;
  material.metalness = source.metalness;

  const fadeRadius = uniform(8.0);
  const minOpacity = uniform(0.05);
  const nearFadeDistance = uniform(6.0);
  const dist = distance(cameraPosition, positionWorld);
  const near = dist.lessThan(nearFadeDistance).toFloat();
  const fadeT = smoothstep(nearFadeDistance, fadeRadius, dist);
  const opacityNode = mix(minOpacity, 1.0, fadeT);
  // On garde `material.opacity` (utilisée par la carte des températures).
  material.opacityNode = mix(opacityNode, minOpacity, near).mul(
    materialOpacity as unknown as Node<'float'>,
  );
  material.transparent = true;
  material.depthWrite = false;

  return material;
}
