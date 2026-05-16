import {useThree} from '@react-three/fiber';
import {useEffect, useRef} from 'react';
import * as THREE from 'three';
import {
  createHideWallsMaterial,
  FadeMaterial,
} from './shaders/HideWallsMaterial';

export function HideWalls() {
  const {scene} = useThree();
  const materialRefs = useRef<FadeMaterial[]>([]);

  useEffect(() => {
    materialRefs.current = [];
    const oldMaterials = new Map<
      THREE.Mesh,
      THREE.Material | THREE.Material[]
    >();

    scene.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;

      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      const isWall = materials.some(
        material =>
          material.name?.toLowerCase().startsWith('wall_') ||
          ['white', 'yellowbrt'].includes(material.name),
      );
      if (!isWall) return;

      oldMaterials.set(
        object,
        Array.isArray(object.material) ? [...object.material] : object.material,
      );

      const sourceMaterial = materials[0] as THREE.MeshStandardMaterial;
      const material = createHideWallsMaterial(sourceMaterial.clone());
      object.material = material;
      materialRefs.current.push(material);
    });

    return () => {
      oldMaterials.forEach((material, mesh) => (mesh.material = material));
    };
  }, [scene]);

  return null;
}
