import {useThree} from '@react-three/fiber';
import {useEffect, useRef} from 'react';
import * as THREE from 'three';
import type {HouseConfigType} from '../../../configs/house';
import type {RenderBackend} from '../backends';
import {useHeatmapPoints} from './useHeatmapPoints';

type SceneMaterialsProps = {
  scene: THREE.Object3D;
  backend: RenderBackend;
  hideWalls: boolean;
  heatmap: boolean;
  rooms: HouseConfigType['rooms'];
};

type MaterialKind = 'wall' | 'ground' | 'other';

type MeshUserData = {
  originalMaterial?: THREE.Material | THREE.Material[];
};

/** Nom du matériau sans le suffixe ajouté par Blender (`white.003` → `white`). */
const baseName = (material: THREE.Material) =>
  material.name.toLowerCase().replace(/\.\d+$/, '');

function getMaterialKind(material: THREE.Material): MaterialKind {
  const name = baseName(material);
  if (name.startsWith('room_')) return 'ground';
  if (name.startsWith('wall_') || ['white', 'yellowbrt'].includes(name)) {
    return 'wall';
  }
  return 'other';
}

/**
 * Seul composant autorisé à modifier les matériaux du modèle.
 *
 * Les matériaux d'origine sont conservés dans `mesh.userData` (la scène est
 * partagée par le cache de `useGLTF`) et chaque passe repart d'eux : on n'a
 * plus d'effets qui se marchent dessus selon l'ordre d'activation des options.
 */
export function SceneMaterials(props: SceneMaterialsProps) {
  const {scene, backend, hideWalls, heatmap, rooms} = props;
  const invalidate = useThree(state => state.invalidate);

  const heatmapPoints = useHeatmapPoints(rooms);
  const heatmapPointsRef = useRef(heatmapPoints);
  heatmapPointsRef.current = heatmapPoints;
  const heatmapMaterials = useRef<THREE.Material[]>([]);
  const showHeatmap = heatmap && heatmapPoints.length > 0;

  useEffect(() => {
    const createdMaterials: THREE.Material[] = [];
    const meshes: THREE.Mesh[] = [];

    const transform = (original: THREE.Material) => {
      const kind = getMaterialKind(original);

      if (showHeatmap && kind === 'ground') {
        const material = backend.createHeatmapMaterial(
          heatmapPointsRef.current,
        );
        heatmapMaterials.current.push(material);
        createdMaterials.push(material);
        return material;
      }

      let material = original;
      if (hideWalls && kind === 'wall') {
        material = backend.createHideWallsMaterial(original);
        createdMaterials.push(material);
      }
      if (showHeatmap) {
        // Le reste de la maison devient translucide pour laisser voir le sol.
        if (material === original) {
          material = original.clone();
          createdMaterials.push(material);
        }
        material.transparent = true;
        material.opacity = original.opacity / 3;
        material.depthWrite = false;
      }
      return material;
    };

    scene.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      const userData = object.userData as MeshUserData;
      userData.originalMaterial ??= object.material;
      const original = userData.originalMaterial!;
      object.material = Array.isArray(original)
        ? original.map(transform)
        : transform(original);
      meshes.push(object);
    });
    invalidate();

    return () => {
      meshes.forEach(mesh => {
        mesh.material = (mesh.userData as MeshUserData).originalMaterial!;
      });
      createdMaterials.forEach(material => material.dispose());
      heatmapMaterials.current = [];
      invalidate();
    };
  }, [scene, backend, hideWalls, showHeatmap, invalidate]);

  const heatmapPointsKey = JSON.stringify(heatmapPoints);
  useEffect(() => {
    heatmapMaterials.current.forEach(material =>
      backend.updateHeatmapMaterial(material, heatmapPointsRef.current),
    );
    invalidate();
  }, [heatmapPointsKey, backend, invalidate]);

  return null;
}
