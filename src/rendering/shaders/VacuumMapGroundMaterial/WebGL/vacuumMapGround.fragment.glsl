uniform sampler2D map;
// u = dot(uRow, (x, z, 1)) sur le sol, v de même.
uniform vec3 uRow;
uniform vec3 vRow;
uniform vec3 floorColor;
varying vec3 vWorldPosition;

void main() {
  vec3 point = vec3(vWorldPosition.xz, 1.0);
  vec2 uv = vec2(dot(uRow, point), dot(vRow, point));
  vec4 plan = texture2D(map, uv);
  // Hors de l'image, le bord de la texture, étiré, ne déborde pas sur le sol.
  vec2 inside = step(vec2(0.0), uv) * step(uv, vec2(1.0));
  gl_FragColor = vec4(mix(floorColor, plan.rgb, plan.a * inside.x * inside.y), 1.0);
  #include <colorspace_fragment>
}
