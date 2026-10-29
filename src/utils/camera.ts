import type {Vector3Tuple} from 'three';

/** Champ vertical de la caméra, en degrés : une vue presque isométrique. */
export const FOV = 30;

// Les caméras des modèles ont été placées pour un champ de 75° : elles
// reculent d'autant pour garder le même cadrage.
export const FRAMING =
  Math.tan((75 * Math.PI) / 360) / Math.tan((FOV * Math.PI) / 360);

/**
 * Pose qui cadre une pièce sur son centre (sa lampe principale) : la caméra
 * garde la direction de celle du modèle (vue depuis l'origine), à `distance` de
 * la cible. La cible avance vers la caméra d'une part `shift` de la distance,
 * ce qui remonte la pièce à l'écran.
 */
export function roomCameraPose(
  center: {x: number; y: number; z: number},
  base: Vector3Tuple,
  distance: number,
  shift: number,
) {
  const length = Math.hypot(...base);
  const [dx, dy, dz] = base.map(value => value / length);
  const ground = Math.hypot(dx, dz) || 1;
  const target: Vector3Tuple = [
    center.x + (dx / ground) * distance * shift,
    center.y,
    center.z + (dz / ground) * distance * shift,
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
