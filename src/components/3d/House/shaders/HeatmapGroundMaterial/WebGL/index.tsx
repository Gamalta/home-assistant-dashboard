import * as THREE from 'three';
import heatmapGroundFragment from './heatmapGround.fragment.glsl?raw';
import heatmapGroundVertex from './heatmapGround.vertex.glsl?raw';
import {HeatmapPoint} from '..';

export function createHeatmapGroundMaterialWebGl(points: HeatmapPoint[]) {
  const minTemp = Math.min(...points.map(point => point.temperature));
  const maxTemp = Math.max(...points.map(point => point.temperature));

  const shaderMaterial = new THREE.ShaderMaterial({
    name: 'heatmapGround',
    transparent: false,
    depthWrite: false,
    side: THREE.FrontSide,
    uniforms: {
      points: {
        value: Array.from({length: 10}, (_, i) => {
          const p = points[i];
          return p
            ? new THREE.Vector3(p.x, p.temperature, p.z)
            : new THREE.Vector3(0, 0, 0);
        }),
      },
      minTemp: {value: minTemp},
      maxTemp: {value: maxTemp},
      numPoints: {value: points.length},
    },
    vertexShader: heatmapGroundVertex,
    fragmentShader: heatmapGroundFragment,
  });
  return shaderMaterial;
}

export function updateHeatmapGroundMaterialWebGl(
  material: THREE.ShaderMaterial,
  points: HeatmapPoint[],
) {
  const {uniforms} = material;
  const values = uniforms.points.value as THREE.Vector3[];
  for (let i = 0; i < values.length; i++) {
    const p = points[i];
    if (p) values[i].set(p.x, p.temperature, p.z);
    else values[i].set(0, 0, 0);
  }
  uniforms.minTemp.value = Math.min(...points.map(point => point.temperature));
  uniforms.maxTemp.value = Math.max(...points.map(point => point.temperature));
  uniforms.numPoints.value = points.length;
}
