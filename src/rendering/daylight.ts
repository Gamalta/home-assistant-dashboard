import * as THREE from 'three';

/** Position du soleil en degrés, comme les attributs de `sun.sun`. */
export type SunPosition = {elevation: number; azimuth: number};

/**
 * Sans `sun.sun` : le soleil se lève à l'est à 6 h, culmine au sud à midi
 * et se couche à l'ouest à 18 h.
 */
export function sunFromHour(date: Date): SunPosition {
  return sunAtHour(date.getHours() + date.getMinutes() / 60);
}

/** Même calcul pour une heure décimale (14,5 : 14 h 30). */
export function sunAtHour(hour: number): SunPosition {
  return {
    elevation: 50 * Math.sin((Math.PI * (hour - 6)) / 12),
    azimuth: 90 + (hour - 6) * 15,
  };
}

/** Part du jour, de 0 (nuit, soleil sous -6°) à 1 (soleil au-dessus de 10°). */
export function daylightFactor(elevation: number) {
  return THREE.MathUtils.smoothstep(elevation, -6, 10);
}

/**
 * Direction du soleil dans le repère du modèle, où -Z pointe vers l'azimut
 * `orientation` (0 : le nord) et +X vers sa droite.
 */
export function sunDirection(sun: SunPosition, orientation = 0) {
  // Sous l'horizon, le crépuscule éclaire encore, mais pas par en dessous.
  const elevation = THREE.MathUtils.degToRad(Math.max(sun.elevation, 0));
  const azimuth = THREE.MathUtils.degToRad(sun.azimuth - orientation);
  return new THREE.Vector3(
    Math.sin(azimuth) * Math.cos(elevation),
    Math.sin(elevation),
    -Math.cos(azimuth) * Math.cos(elevation),
  );
}
