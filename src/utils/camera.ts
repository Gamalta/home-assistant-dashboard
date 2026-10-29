import type {Vector3Tuple} from 'three';

/**
 * Pose qui cadre une pièce : la caméra vise sa position (`room.position`) et
 * garde la direction de celle du modèle (vue depuis l'origine), à `distance`
 * de la pièce.
 */
export function roomCameraPose(
  room: {x: number; y: number; z: number},
  base: Vector3Tuple,
  distance: number,
) {
  const length = Math.hypot(...base);
  const [dx, dy, dz] = base.map(value => value / length);
  const target: Vector3Tuple = [room.x, room.y, room.z];
  const position: Vector3Tuple = [
    room.x + dx * distance,
    room.y + dy * distance,
    room.z + dz * distance,
  ];
  return {position, target};
}

// Le champ vertical est fixe : plus la vue est étroite, plus la caméra recule
// pour garder la même largeur de scène.
export function portraitDistance(aspect: number, max = 2.5) {
  return Math.min(Math.max(1 / aspect, 1), max);
}
