import * as THREE from 'three';

/** Lumière du ciel seul et du soleil seul, précalculée sur le second jeu d'UV. */
export type LightMaps = {sky: THREE.Texture; sun: THREE.Texture};

/**
 * Couleur et force du ciel et du soleil, qui multiplient leur carte. Tous les
 * matériaux les partagent : l'heure ne change que ces deux couleurs.
 */
export const bakedLight = {sky: new THREE.Color(0), sun: new THREE.Color(0)};
