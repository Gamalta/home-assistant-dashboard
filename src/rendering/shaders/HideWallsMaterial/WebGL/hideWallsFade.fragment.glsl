#ifdef HIDE_WALLS_FADE
  gl_FragColor.a *= fade;
#endif

#include <dithering_fragment>
