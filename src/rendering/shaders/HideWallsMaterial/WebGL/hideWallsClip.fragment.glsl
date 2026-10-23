#include <clipping_planes_fragment>

// Chaque pixel n'est dessiné que par l'une des deux variantes du matériau :
// l'opaque pour les parties pleines, celle de fondu pour le reste. Rejeté
// avant l'éclairage.
float dist = length(cameraPosition - vWorldPosition);
float fade = dist < nearFadeDistance
  ? minOpacity
  : mix(minOpacity, 1.0, smoothstep(nearFadeDistance, fadeRadius, dist));
#ifdef HIDE_WALLS_FADE
  if (fade >= 1.0) discard;
#else
  if (fade < 1.0) discard;
#endif
