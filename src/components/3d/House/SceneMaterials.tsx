import {useThree} from '@react-three/fiber';
import {useEffect, useRef} from 'react';
import * as THREE from 'three';
import type {HouseConfigType} from '../../../configs/house';
import type {RenderBackend} from '../../../rendering/backends';
import {useHeatmapPoints} from '../../../hooks/useHeatmapPoints';

type SceneMaterialsProps = {
  scene: THREE.Object3D;
  backend: RenderBackend;
  hideWalls: boolean;
  heatmap: boolean;
  /** Éclairage diffus seul (Lambert) : voir `toLambert`. */
  diffuseOnly: boolean;
  rooms: HouseConfigType['rooms'];
};

type MaterialKind = 'wall' | 'ground' | 'other';

type MeshUserData = {
  originalMaterial?: THREE.Material | THREE.Material[];
};

/** Nom du matériau sans le suffixe ajouté par Blender (`white.003` → `white`). */
const baseName = (material: THREE.Material) =>
  material.name.toLowerCase().replace(/\.\d+$/, '');

// Même règle dans scripts/optimize-model.sh, qui ne fusionne pas deux rôles.
function getMaterialKind(material: THREE.Material): MaterialKind {
  const name = baseName(material);
  if (name.startsWith('room_')) return 'ground';
  if (name.startsWith('wall_') || ['white', 'yellowbrt'].includes(name)) {
    return 'wall';
  }
  return 'other';
}

/**
 * Le modèle utilise KHR_materials_specular : GLTFLoader crée des
 * MeshPhysicalMaterial, le shader le plus coûteux de three.js, évalué pour
 * chaque lumière et chaque pixel. Les matériaux étant mats (rugosité ≥ 0.64,
 * non métalliques), le reflet spéculaire est quasi invisible : un matériau
 * Lambert (diffus seul) donne le même rendu pour une fraction du coût.
 */
function toLambert(source: THREE.Material) {
  if (!(source instanceof THREE.MeshStandardMaterial)) return source;
  const material = new THREE.MeshLambertMaterial({
    name: source.name,
    color: source.color,
    map: source.map,
    emissive: source.emissive,
    emissiveMap: source.emissiveMap,
    emissiveIntensity: source.emissiveIntensity,
    alphaMap: source.alphaMap,
    aoMap: source.aoMap,
    aoMapIntensity: source.aoMapIntensity,
    vertexColors: source.vertexColors,
  });
  material.opacity = source.opacity;
  material.transparent = source.transparent;
  material.alphaTest = source.alphaTest;
  material.side = source.side;
  material.depthWrite = source.depthWrite;
  return material;
}

/**
 * Seul composant autorisé à modifier les matériaux du modèle.
 *
 * Les matériaux d'origine sont conservés dans `mesh.userData` (la scène est
 * partagée par le cache de `useGLTF`) et chaque passe repart d'eux : on n'a
 * plus d'effets qui se marchent dessus selon l'ordre d'activation des options.
 */
export function SceneMaterials(props: SceneMaterialsProps) {
  const {scene, backend, hideWalls, heatmap, diffuseOnly, rooms} = props;
  const invalidate = useThree(state => state.invalidate);

  const heatmapPoints = useHeatmapPoints(rooms);
  const heatmapPointsRef = useRef(heatmapPoints);
  heatmapPointsRef.current = heatmapPoints;
  const heatmapMaterials = useRef<THREE.Material[]>([]);
  const showHeatmap = heatmap && heatmapPoints.length > 0;

  useEffect(() => {
    const createdMaterials: THREE.Material[] = [];

    const overlays: THREE.Mesh[] = [];

    // Pour les murs, `fade` dessine la zone qui s'efface près de la caméra
    // (voir createHideWallsMaterials).
    const transform = (
      gltfMaterial: THREE.Material,
    ): {material: THREE.Material; fade?: THREE.Material} => {
      const kind = getMaterialKind(gltfMaterial);

      if (showHeatmap && kind === 'ground') {
        const material = backend.createHeatmapMaterial(
          heatmapPointsRef.current,
        );
        heatmapMaterials.current.push(material);
        createdMaterials.push(material);
        return {material};
      }

      let original = gltfMaterial;
      if (diffuseOnly) {
        original = toLambert(gltfMaterial);
        if (original !== gltfMaterial) createdMaterials.push(original);
      }

      let material = original;
      let fade: THREE.Material | undefined;
      if (hideWalls && kind === 'wall') {
        const wall = backend.createHideWallsMaterials(original);
        material = wall.opaque;
        fade = wall.fade;
        createdMaterials.push(wall.opaque, wall.fade);
      }
      if (showHeatmap) {
        // Le reste de la maison devient translucide pour laisser voir le sol.
        if (material === gltfMaterial) {
          material = original.clone();
          createdMaterials.push(material);
        }
        for (const translucent of fade ? [material, fade] : [material]) {
          translucent.transparent = true;
          translucent.opacity = gltfMaterial.opacity / 3;
          translucent.depthWrite = false;
        }
      }
      // Transparent et double face, un matériau est rendu en deux passes
      // (faces arrière puis avant) : une seule suffit ici.
      for (const created of fade ? [material, fade] : [material]) {
        if (created !== gltfMaterial && created.transparent) {
          created.forceSinglePass = true;
        }
      }
      return {material, fade};
    };

    const meshes: THREE.Mesh[] = [];
    scene.traverse(object => {
      if (object instanceof THREE.Mesh) meshes.push(object);
    });
    meshes.forEach(mesh => {
      const userData = mesh.userData as MeshUserData;
      userData.originalMaterial ??= mesh.material;
      const original = userData.originalMaterial!;
      if (Array.isArray(original)) {
        // Pas de calque de fondu pour les maillages multi-matériaux.
        mesh.material = original.map(material => transform(material).material);
        return;
      }
      const {material, fade} = transform(original);
      mesh.material = material;
      if (fade) {
        // Même géométrie, rendue une seconde fois avec le matériau de fondu.
        const overlay = new THREE.Mesh(mesh.geometry, fade);
        // Reçoit les ombres comme le mur, sans en projeter une seconde fois.
        overlay.userData.fadeOverlay = true;
        overlay.receiveShadow = mesh.receiveShadow;
        mesh.add(overlay);
        overlays.push(overlay);
      }
    });
    invalidate();

    return () => {
      overlays.forEach(overlay => overlay.removeFromParent());
      meshes.forEach(mesh => {
        mesh.material = (mesh.userData as MeshUserData).originalMaterial!;
      });
      createdMaterials.forEach(material => material.dispose());
      heatmapMaterials.current = [];
      invalidate();
    };
  }, [scene, backend, hideWalls, showHeatmap, diffuseOnly, invalidate]);

  const heatmapPointsKey = JSON.stringify(heatmapPoints);
  useEffect(() => {
    heatmapMaterials.current.forEach(material =>
      backend.updateHeatmapMaterial(material, heatmapPointsRef.current),
    );
    invalidate();
  }, [heatmapPointsKey, backend, invalidate]);

  return null;
}
