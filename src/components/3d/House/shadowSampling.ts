import * as THREE from 'three';

/**
 * Le filtrage PCF de three.js lit 5 fois chaque ombre (disque de Vogel tourné
 * par un bruit, avec de la trigonométrie), pour chaque pixel et chaque
 * lumière. Une seule lecture suffit : le filtrage matériel (LinearFilter sur
 * une texture de comparaison) interpole déjà 2×2 texels, d'où des bords
 * adoucis pour 5 fois moins de lectures. Concerne le moteur WebGL.
 */
const SPOT_SAMPLES =
  /shadow = \(\s*texture\( shadowMap, vec3\( shadowCoord\.xy \+ vogelDiskSample\( 0, 5, phi \)[\s\S]*?\) \* 0\.2;/;
const POINT_SAMPLES =
  /shadow = \(\s*texture\( shadowMap, vec4\( bd3D \+ \( tangent \* sample0\.x[\s\S]*?\) \* 0\.2;/;

let patched = false;

export function enableSingleTapShadows() {
  if (patched) return;
  patched = true;
  const source = THREE.ShaderChunk.shadowmap_pars_fragment;
  if (!SPOT_SAMPLES.test(source) || !POINT_SAMPLES.test(source)) {
    // Code de three.js modifié (mise à jour) : on garde son filtrage.
    console.warn('Filtrage des ombres à une lecture non appliqué.');
    return;
  }
  THREE.ShaderChunk.shadowmap_pars_fragment = source
    .replace(
      SPOT_SAMPLES,
      'shadow = texture( shadowMap, vec3( shadowCoord.xy, shadowCoord.z ) );',
    )
    .replace(POINT_SAMPLES, 'shadow = texture( shadowMap, vec4( bd3D, dp ) );');
}
