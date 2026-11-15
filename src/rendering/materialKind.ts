import type * as THREE from 'three';

export type MaterialKind = 'wall' | 'ground' | 'other';

/** Nom du matériau sans le suffixe ajouté par Blender (`white.003` → `white`). */
const baseName = (material: THREE.Material) =>
  material.name.toLowerCase().replace(/\.\d+$/, '');

// Même règle dans scripts/optimize-model.sh, qui ne fusionne pas deux rôles, et
// dans scripts/bake-lighting.py, qui unit les murs.
export function getMaterialKind(material: THREE.Material): MaterialKind {
  const name = baseName(material);
  if (name.startsWith('room_')) return 'ground';
  if (name.startsWith('wall_') || ['white', 'yellowbrt'].includes(name)) {
    return 'wall';
  }
  return 'other';
}
