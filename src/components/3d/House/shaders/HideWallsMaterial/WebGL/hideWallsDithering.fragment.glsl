float dist = length(cameraPosition - vWorldPosition);
float opacity;

if (dist < nearFadeDistance) {
  opacity = minOpacity;
} else if (dist < fadeRadius) {
  opacity = smoothstep(nearFadeDistance, fadeRadius, dist);
  opacity = opacity * (1.0 - minOpacity) + minOpacity;
} else {
  opacity = 1.0;
}

gl_FragColor.a *= opacity;

#include <dithering_fragment>