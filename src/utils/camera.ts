import type {Vector3Tuple} from 'three';

/**
 * Pose qui cadre une pièce : la caméra garde la direction de celle du modèle
 * (vue depuis l'origine), à `distance` de la cible. La cible avance vers la
 * caméra d'une part `shift` de la distance, ce qui remonte la pièce à l'écran.
 */
export function roomCameraPose(
  room: {x: number; z: number},
  base: Vector3Tuple,
  distance: number,
  shift: number,
) {
  const length = Math.hypot(...base);
  const [dx, dy, dz] = base.map(value => value / length);
  const ground = Math.hypot(dx, dz) || 1;
  const target: Vector3Tuple = [
    room.x + (dx / ground) * distance * shift,
    0,
    room.z + (dz / ground) * distance * shift,
  ];
  const position: Vector3Tuple = [
    target[0] + dx * distance,
    target[1] + dy * distance,
    target[2] + dz * distance,
  ];
  return {position, target};
}

// Le champ vertical est fixe : plus la vue est étroite, plus la caméra recule
// pour garder la même largeur de scène.
export function portraitDistance(aspect: number, max = 2.5) {
  return Math.min(Math.max(1 / aspect, 1), max);
}
