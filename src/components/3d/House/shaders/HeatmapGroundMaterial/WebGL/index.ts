import * as THREE from 'three';
import heatmapGroundFragment from './heatmapGround.fragment.glsl?raw';
import heatmapGroundVertex from './heatmapGround.vertex.glsl?raw';
import {
  getTemperatureRange,
  HeatmapPoint,
  limitHeatmapPoints,
  MAX_HEATMAP_POINTS,
} from '../common';

export function createHeatmapGroundMaterialWebGl(points: HeatmapPoint[]) {
  const material = new THREE.ShaderMaterial({
    name: 'heatmapGround',
    transparent: false,
    depthWrite: false,
    side: THREE.FrontSide,
    defines: {MAX_POINTS: MAX_HEATMAP_POINTS},
    uniforms: {
      points: {
        value: Array.from(
          {length: MAX_HEATMAP_POINTS},
          () => new THREE.Vector3(),
        ),
      },
      minTemp: {value: 0},
      maxTemp: {value: 1},
      numPoints: {value: 0},
    },
    vertexShader: heatmapGroundVertex,
    fragmentShader: heatmapGroundFragment,
  });
  updateHeatmapGroundMaterialWebGl(material, points);
  return material;
}

export function updateHeatmapGroundMaterialWebGl(
  material: THREE.ShaderMaterial,
  points: HeatmapPoint[],
) {
  const limitedPoints = limitHeatmapPoints(points);
  const {minTemp, maxTemp} = getTemperatureRange(limitedPoints);
  const {uniforms} = material;
  const values = uniforms.points.value as THREE.Vector3[];
  values.forEach((value, i) => {
    const p = limitedPoints[i];
    if (p) value.set(p.x, p.temperature, p.z);
    else value.set(0, 0, 0);
  });
  uniforms.minTemp.value = minTemp;
  uniforms.maxTemp.value = maxTemp;
  uniforms.numPoints.value = limitedPoints.length;
}
