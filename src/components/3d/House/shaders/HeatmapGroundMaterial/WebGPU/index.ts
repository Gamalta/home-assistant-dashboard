import * as THREE from 'three/webgpu';

import {
  vec3,
  vec4,
  float,
  uniform,
  storage,
  Fn,
  mix,
  clamp,
  smoothstep,
  abs,
  mod,
  fwidth,
  positionLocal,
  If,
} from 'three/tsl';

import {HeatmapPoint} from '..';

export function createHeatmapGroundMaterialWebGPU(
  points: HeatmapPoint[],
): THREE.MeshBasicNodeMaterial {
  const data = new Float32Array(points.length * 3);

  points.forEach((p, i) => {
    data[i * 3 + 0] = p.x;
    data[i * 3 + 1] = p.temperature;
    data[i * 3 + 2] = p.z;
  });

  const pointsBuffer = storage(
    new THREE.StorageBufferAttribute(data, 3),
    'vec3',
    points.length,
  );
  const minTemp = uniform(Math.min(...points.map(p => p.temperature)));
  const maxTemp = uniform(Math.max(...points.map(p => p.temperature)));
  const numPoints = uniform(points.length);
  const vPosition = positionLocal;

  const idwInterpolation = Fn(([pos]: [THREE.AttributeNode<'vec3'>]) => {
    const tempSum = float(0).toVar();
    const weightSum = float(0).toVar();

    for (let i = 0; i < points.length; i++) {
      const point = pointsBuffer.element(i);

      const dx = pos.x.sub(point.x);
      const dy = pos.y.sub(point.z);
      const distSq = dx.mul(dx).add(dy.mul(dy));

      If(float(i).greaterThanEqual(numPoints), () => {
        return;
      });

      If(distSq.lessThan(0.01), () => {
        return point.y;
      });

      const weight = float(1.0).div(distSq);
      tempSum.assign(tempSum.add(point.y.mul(weight)));
      weightSum.assign(weightSum.add(weight));
    }

    return tempSum.div(weightSum);
  });

  const temperatureToColor = Fn(([temperature]: [THREE.Node<'float'>]) => {
    let normalized = temperature.sub(minTemp).div(maxTemp.sub(minTemp));
    normalized = clamp(normalized, 0.0, 1.0);
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

  const material = new THREE.MeshBasicNodeMaterial();
  material.colorNode = Fn(() => {
    const temperature = idwInterpolation(vPosition);
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

  return material;
}
