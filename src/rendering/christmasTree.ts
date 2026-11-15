import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Proportions d'un sapin de hauteur 1 : trois étages de branches sur un tronc.
export const TIERS = [
  {radius: 0.36, height: 0.42, base: 0.1, lights: 12},
  {radius: 0.28, height: 0.36, base: 0.34, lights: 9},
  {radius: 0.19, height: 0.32, base: 0.56, lights: 7},
];
const TRUNK = {radius: 0.05, height: 0.12};
const STAR = {y: 0.9, radius: 0.045};
const LIGHT_RADIUS = 0.024;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

const PALETTE = ['#ff3b30', '#ffcc00', '#2f7bff', '#ff4fd8'].map(
  color => new THREE.Color(color),
);
const STAR_COLOR = new THREE.Color('#ffd84a');

function painted(geometry: THREE.BufferGeometry, color: string) {
  const {r, g, b} = new THREE.Color(color);
  const count = geometry.attributes.position.count;
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) colors.set([r, g, b], i * 3);
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geometry;
}

/** Tronc et branches en une seule géométrie, colorée par sommet : un seul draw call. */
export function createTreeBody() {
  const trunk = new THREE.CylinderGeometry(
    TRUNK.radius,
    TRUNK.radius * 1.2,
    TRUNK.height,
    8,
  ).translate(0, TRUNK.height / 2, 0);
  const tiers = TIERS.map(tier =>
    new THREE.ConeGeometry(tier.radius, tier.height, 16).translate(
      0,
      tier.base + tier.height / 2,
      0,
    ),
  );
  return mergeGeometries([
    painted(trunk, '#5b3a24'),
    ...tiers.map(tier => painted(tier, '#2a7d45')),
  ]);
}

/** Guirlande en spirale sur chaque étage, puis l'étoile, en dernier. */
export const TREE_LIGHTS = [
  ...TIERS.flatMap((tier, tierIndex) =>
    Array.from({length: tier.lights}, (_, index) => {
      // Du bas vers le haut de l'étage, sans toucher sa pointe.
      const rise = 0.1 + (0.7 * (index + 0.5)) / tier.lights;
      const angle = index * GOLDEN_ANGLE + tierIndex;
      // Un peu hors des branches, pour ne pas s'y enfoncer.
      const radius = tier.radius * (1 - rise) + LIGHT_RADIUS / 2;
      return {
        position: new THREE.Vector3(
          radius * Math.cos(angle),
          tier.base + rise * tier.height,
          radius * Math.sin(angle),
        ),
        radius: LIGHT_RADIUS,
      };
    }),
  ),
  {position: new THREE.Vector3(0, STAR.y, 0), radius: STAR.radius},
];

/** Couleur d'une lumière au pas `step` : chacune passe à la suivante de la palette, l'étoile reste dorée. */
export function treeLightColor(index: number, step: number) {
  if (index === TREE_LIGHTS.length - 1) return STAR_COLOR;
  return PALETTE[(index + step) % PALETTE.length];
}
