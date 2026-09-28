import * as THREE from 'three/webgpu';

import {
  vec3,
  vec4,
  float,
  uniform,
  uniformArray,
  Fn,
  mix,
  clamp,
  max,
  smoothstep,
  abs,
  mod,
  fwidth,
  positionWorld,
  If,
} from 'three/tsl';

import {
  getTemperatureRange,
  HeatmapPoint,
  limitHeatmapPoints,
  MAX_HEATMAP_POINTS,
} from '../common';

type HeatmapUniforms = {
  points: THREE.Vector3[];
  minTemp: THREE.UniformNode<'float', number>;
  maxTemp: THREE.UniformNode<'float', number>;
  numPoints: THREE.UniformNode<'float', number>;
};

type HeatmapNodeMaterial = THREE.MeshBasicNodeMaterial & {
  userData: {heatmapUniforms?: HeatmapUniforms};
};

export function createHeatmapGroundMaterialWebGPU(
  points: HeatmapPoint[],
): THREE.MeshBasicNodeMaterial {
  // Tableau de taille fixe : les mises à jour de température ne modifient que
  // les valeurs des uniforms, sans recompiler le shader.
  const pointValues = Array.from(
    {length: MAX_HEATMAP_POINTS},
    () => new THREE.Vector3(),
  );
  const pointsNode = uniformArray(pointValues, 'vec3');
  const minTemp = uniform(0);
  const maxTemp = uniform(1);
  const numPoints = uniform(0);

  const idwInterpolation = Fn(([pos]: [THREE.Node<'vec3'>]) => {
    const tempSum = float(0).toVar();
    const weightSum = float(0).toVar();

    for (let i = 0; i < MAX_HEATMAP_POINTS; i++) {
      // point = (x, température, z) en coordonnées monde.
      const point = pointsNode.element(i) as unknown as THREE.Node<'vec3'>;
      const dx = pos.x.sub(point.x);
      const dz = pos.z.sub(point.z);
      // Distance plancher : évite une division par zéro sur le capteur lui-même.
      const distSq = max(dx.mul(dx).add(dz.mul(dz)), 0.01);
      // Les emplacements au-delà de numPoints ont un poids nul.
      const active = float(i).lessThan(numPoints).toFloat();
      const weight = active.div(distSq);
      tempSum.addAssign(point.y.mul(weight));
      weightSum.addAssign(weight);
    }

    return tempSum.div(max(weightSum, 1e-6));
  });

  const temperatureToColor = Fn(([temperature]: [THREE.Node<'float'>]) => {
    const normalized = clamp(
      temperature.sub(minTemp).div(maxTemp.sub(minTemp)),
      0.0,
      1.0,
    );
    const color = vec3(0.0).toVar();

    If(normalized.lessThan(0.2), () => {
      color.assign(
        mix(vec3(0.1, 0.2, 0.8), vec3(0.0, 0.5, 1.0), normalized.div(0.2)),
      );
    })
      .ElseIf(normalized.lessThan(0.4), () => {
        color.assign(
          mix(
            vec3(0.0, 0.5, 1.0),
            vec3(0.2, 0.8, 0.3),
            normalized.sub(0.2).div(0.2),
          ),
        );
      })
      .ElseIf(normalized.lessThan(0.6), () => {
        color.assign(
          mix(
            vec3(0.2, 0.8, 0.3),
            vec3(1.0, 1.0, 0.1),
            normalized.sub(0.4).div(0.2),
          ),
        );
      })
      .ElseIf(normalized.lessThan(0.8), () => {
        color.assign(
          mix(
            vec3(1.0, 1.0, 0.1),
            vec3(1.0, 0.5, 0.0),
            normalized.sub(0.6).div(0.2),
          ),
        );
      })
      .Else(() => {
        color.assign(
          mix(
            vec3(1.0, 0.5, 0.0),
            vec3(1.0, 0.0, 0.0),
            normalized.sub(0.8).div(0.2),
          ),
        );
      });

    return color;
  });

  const material = new THREE.MeshBasicNodeMaterial() as HeatmapNodeMaterial;
  material.name = 'heatmapGround';
  material.depthWrite = false;
  material.colorNode = Fn(() => {
    const temperature = idwInterpolation(positionWorld);
    const temperatureStep = float(1.0);
    const contourValue = mod(temperature, temperatureStep);
    const width = fwidth(temperature).mul(0.3);
    const contourLine = float(1.0).sub(
      smoothstep(width, width.mul(2.0), abs(contourValue.sub(0.5))),
    );
    let color: THREE.Node<'vec3'> = temperatureToColor(temperature);
    color = mix(color, vec3(0.0), contourLine.mul(0.3));
    return vec4(color, 1.0);
  })();

  material.userData.heatmapUniforms = {
    points: pointValues,
    minTemp,
    maxTemp,
    numPoints,
  };
  updateHeatmapGroundMaterialWebGPU(material, points);

  return material;
}

export function updateHeatmapGroundMaterialWebGPU(
  material: THREE.Material,
  points: HeatmapPoint[],
) {
  const uniforms = (material as HeatmapNodeMaterial).userData.heatmapUniforms;
  if (!uniforms) return;
  const limitedPoints = limitHeatmapPoints(points);
  const {minTemp, maxTemp} = getTemperatureRange(limitedPoints);
  uniforms.points.forEach((value, i) => {
    const p = limitedPoints[i];
    if (p) value.set(p.x, p.temperature, p.z);
    else value.set(0, 0, 0);
  });
  uniforms.minTemp.value = minTemp;
  uniforms.maxTemp.value = maxTemp;
  uniforms.numPoints.value = limitedPoints.length;
}
