uniform sampler2D map;
// u = dot(uRow, (x, z, 1)) sur le sol, v de même.
uniform vec3 uRow;
uniform vec3 vRow;
uniform float minTemp;
uniform float maxTemp;
varying vec3 vWorldPosition;

vec3 temperatureToColor(float temp) {
  float normalized = (temp - minTemp) / (maxTemp - minTemp);
  normalized = clamp(normalized, 0.0, 1.0);

  vec3 color;

  if(normalized < 0.2) {
    color = mix(vec3(0.1, 0.2, 0.8), vec3(0.0, 0.5, 1.0), normalized / 0.2);
  } else if(normalized < 0.4) {
    color = mix(vec3(0.0, 0.5, 1.0), vec3(0.2, 0.8, 0.3), (normalized - 0.2) / 0.2);
  } else if(normalized < 0.6) {
    color = mix(vec3(0.2, 0.8, 0.3), vec3(1.0, 1.0, 0.1), (normalized - 0.4) / 0.2);
  } else if(normalized < 0.8) {
    color = mix(vec3(1.0, 1.0, 0.1), vec3(1.0, 0.5, 0.0), (normalized - 0.6) / 0.2);
  } else {
    color = mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 0.0, 0.0), (normalized - 0.8) / 0.2);
  }
  return color;
}

void main() {
  vec3 point = vec3(vWorldPosition.xz, 1.0);
  // La texture garde l'écart au milieu de l'échelle.
  float temp = 0.5 * (minTemp + maxTemp) + texture2D(map, vec2(dot(uRow, point), dot(vRow, point))).r;
  float tempStep = 1.0;
  float contourValue = mod(temp, tempStep);
  float width = fwidth(temp) * 0.3;
  // Pas d'isotherme là où la température ne varie pas : autour d'un capteur
  // à 21,5 °C, elle couvrirait tout le sol.
  float contourLine = width > 0.0 ? 1.0 - smoothstep(width, 2.0 * width, abs(contourValue - 0.5)) : 0.0;
  vec3 color = temperatureToColor(temp);
  color = mix(color, vec3(0.0), contourLine * 0.3);
  gl_FragColor = vec4(color, 1.0);
}