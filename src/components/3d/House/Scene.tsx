import {useEffect, useRef} from 'react';
import * as THREE from 'three';
import {useAppContext} from '../../../contexts/AppContext';
import { createCameraFadeMaterial } from './shaders/cameraFadeMaterial';

type SceneProps = {
  scene: THREE.Group;
};

type FadeMaterial = THREE.MeshStandardMaterial & {
  userData: {
    shader?: any;
  };
};

export function Scene(props: SceneProps) {
  const {scene} = props;

  const {setTriangle} = useAppContext();
  const materialRefs = useRef<FadeMaterial[]>([]);

  useEffect(() => {
    let total = 0;

    materialRefs.current = [];
    const oldMaterials = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();

    scene.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;

      total +=
        (object.geometry.index?.count ??
          object.geometry.attributes.position.count) / 3;

      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      const isWall = materials.some(material => {
        return material.name?.toLowerCase().startsWith('wall_') || ['white', 'yellowbrt'].includes(material.name);
      }
      );
      if (!isWall) return;

      oldMaterials.set(
        object,
        Array.isArray(object.material) ? [...object.material] : object.material,
      );

      const sourceMaterial = materials[0] as THREE.MeshStandardMaterial;
      const material = createCameraFadeMaterial(sourceMaterial.clone());
      object.material = material;
      materialRefs.current.push(material);
    });

    setTriangle(total);

    return () => {
      oldMaterials.forEach((material, mesh) => {
        mesh.material = material;
      });
    };
  }, [scene, setTriangle]);

  return <primitive object={scene} />;
}
