import * as THREE from 'three';
import heatmapGroundFragment from './heatmapGround.fragment.glsl?raw';
import heatmapGroundVertex from './heatmapGround.vertex.glsl?raw';

export type HeatmapPoint = {
  x: number;
  z: number;
  temperature: number;
};

export function createHeatmapGroundMaterial(points: HeatmapPoint[]) {
  const minTemp = Math.min(...points.map(point => point.temperature));
  const maxTemp = Math.max(...points.map(point => point.temperature));

  const shaderMaterial = new THREE.ShaderMaterial({
    name: 'heatmapGround',
    transparent: false,
    depthWrite: true,
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