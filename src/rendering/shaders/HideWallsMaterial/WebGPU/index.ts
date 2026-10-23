import * as THREE from 'three';
import {
  MeshLambertNodeMaterial,
  MeshStandardNodeMaterial,
  type Node,
} from 'three/webgpu';
import {
  positionWorld,
  cameraPosition,
  distance,
  uniform,
  smoothstep,
  mix,
  materialOpacity,
} from 'three/tsl';

type WallMaterial = THREE.MeshStandardMaterial | THREE.MeshLambertMaterial;

function createVariant(source: WallMaterial, fadeVariant: boolean) {
  let material: MeshStandardNodeMaterial | MeshLambertNodeMaterial;
  if (source instanceof THREE.MeshStandardMaterial) {
    material = new MeshStandardNodeMaterial();
    material.roughness = source.roughness;
    material.metalness = source.metalness;
  } else {
    material = new MeshLambertNodeMaterial();
  }
  material.name = source.name;
  material.color.copy(source.color);
  material.map = source.map;
  material.side = source.side;
  material.opacity = source.opacity;

  const fadeRadius = uniform(8.0);
  const minOpacity = uniform(0.05);
  const nearFadeDistance = uniform(6.0);
  const dist = distance(cameraPosition, positionWorld);
  const near = dist.lessThan(nearFadeDistance).toFloat();
  const fadeT = smoothstep(nearFadeDistance, fadeRadius, dist);
  const fade = mix(mix(minOpacity, 1.0, fadeT), minOpacity, near);

  // Chaque pixel n'est dessiné que par l'une des deux variantes (voir
  // version WebGL).
  if (fadeVariant) {
    material.maskNode = fade.lessThan(1.0);
    // On garde `material.opacity` (utilisée par la carte des températures).
    material.opacityNode = fade.mul(
      materialOpacity as unknown as Node<'float'>,
    );
    material.transparent = true;
    material.depthWrite = false;
  } else {
    material.maskNode = fade.greaterThanEqual(1.0);
  }

  return material;
}

export function createHideWallsMaterialsWebGPU(source: WallMaterial) {
  return {
    opaque: createVariant(source, false),
    fade: createVariant(source, true),
  };
}
