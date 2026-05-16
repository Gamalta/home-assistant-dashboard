uniform vec3 points[6];
uniform float minTemp;
uniform float maxTemp;
uniform int numPoints;
varying vec3 vPosition;

float idwInterpolation(vec3 pos) {
  float tempSum = 0.0;
  float weightSum = 0.0;

  for(int i = 0; i < 6; i++) {
    if(i >= numPoints) break;
    float dx = pos.x - points[i].x;
    float dy = pos.y - points[i].z;
    float distSq = dx*dx + dy*dy;

    if(distSq < 0.01) {
      return points[i].y;
    }

    float weight = 1.0 / distSq;
    tempSum += points[i].y * weight;
    weightSum += weight;
  }

  return tempSum / weightSum;
}

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
  float temp = idwInterpolation(vPosition);
  float tempStep = 1.0;
  float contourValue = mod(temp, tempStep);
  float width = fwidth(temp) * 0.3;
  float contourLine = 1.0 - smoothstep(width, 2.0 * width, abs(contourValue - 0.5));
  vec3 color = temperatureToColor(temp);
  color = mix(color, vec3(0.0), contourLine * 0.3);
  gl_FragColor = vec4(color, 1.0);
}