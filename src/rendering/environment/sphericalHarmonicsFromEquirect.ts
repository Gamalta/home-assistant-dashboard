import * as THREE from 'three';

const SAMPLE_STEP = 4;

function readTexel(data: ArrayLike<number>, index: number, half: boolean) {
  const value = data[index];
  return half ? THREE.DataUtils.fromHalfFloat(value) : value;
}

export function sphericalHarmonicsFromEquirect(texture: THREE.DataTexture) {
  const {data, width, height} = texture.image as {
    data: ArrayLike<number>;
    width: number;
    height: number;
  };
  const half = texture.type === THREE.HalfFloatType;
  const channels = data.length / (width * height);
  const sh = new THREE.SphericalHarmonics3();
  const basis = new Array<number>(9).fill(0);
  const direction = new THREE.Vector3();
  const color = new THREE.Color();
  let totalWeight = 0;

  for (let y = 0; y < height; y += SAMPLE_STEP) {
    const v = 1 - (y + 0.5) / height;
    const latitude = (v - 0.5) * Math.PI;
    const weight = Math.cos(latitude);
    for (let x = 0; x < width; x += SAMPLE_STEP) {
      const u = (x + 0.5) / width;
      const longitude = (u - 0.5) * 2 * Math.PI;
      direction.set(
        Math.cos(longitude) * Math.cos(latitude),
        Math.sin(latitude),
        Math.sin(longitude) * Math.cos(latitude),
      );
      const index = (y * width + x) * channels;
      color.setRGB(
        readTexel(data, index, half),
        readTexel(data, index + 1, half),
        readTexel(data, index + 2, half),
      );
      totalWeight += weight;
      THREE.SphericalHarmonics3.getBasisAt(direction, basis);
      for (let i = 0; i < 9; i++) {
        sh.coefficients[i].x += basis[i] * color.r * weight;
        sh.coefficients[i].y += basis[i] * color.g * weight;
        sh.coefficients[i].z += basis[i] * color.b * weight;
      }
    }
  }

  const norm = (4 * Math.PI) / totalWeight;
  sh.coefficients.forEach(coefficient => coefficient.multiplyScalar(norm));
  return sh;
}
