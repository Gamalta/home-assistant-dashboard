import {useThree} from '@react-three/fiber';
import {useEffect, useRef} from 'react';
import * as THREE from 'three';
import {FadeMaterial} from './shaders/HideWallsMaterial/WebGL';
import {createHideWallsMaterial} from './shaders/HideWallsMaterial';
import {MeshStandardNodeMaterial} from 'three/webgpu';
import {useAppContext} from '../../../contexts/AppContext';

export function HideWalls() {
  const {scene} = useThree();
  const {configuration} = useAppContext();
  const materialRefs = useRef<(FadeMaterial | MeshStandardNodeMaterial)[]>([]);

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
      const material = createHideWallsMaterial(
        configuration.webGPU,
        sourceMaterial.clone(),
      );
      object.material = material;
      materialRefs.current.push(material);
    });

    return () => {
      oldMaterials.forEach((oldMaterial, mesh) => {
        const currentMaterials = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];
        currentMaterials.forEach(mat => {
          if (!mat) return;
          mat.dispose();
        });

        mesh.material = oldMaterial;
      });
    };
  }, [scene, configuration.hideWallsShader, configuration.heatmapShader]);

  return null;
}
