import * as THREE from 'three/webgpu';

import {
  vec2,
  vec3,
  vec4,
  float,
  uniform,
  texture,
  dot,
  Fn,
  mix,
  clamp,
  smoothstep,
  abs,
  mod,
  fwidth,
  positionWorld,
  If,
} from 'three/tsl';

import type {TemperatureMap} from '../common';

type HeatmapUniforms = {
  map: THREE.TextureNode;
  uRow: THREE.UniformNode<'vec3', THREE.Vector3>;
  vRow: THREE.UniformNode<'vec3', THREE.Vector3>;
  minTemp: THREE.UniformNode<'float', number>;
  maxTemp: THREE.UniformNode<'float', number>;
};

type HeatmapNodeMaterial = THREE.MeshBasicNodeMaterial & {
  userData: {heatmapUniforms?: HeatmapUniforms};
};

export function createHeatmapGroundMaterialWebGPU(
  temperatureMap: TemperatureMap,
): THREE.MeshBasicNodeMaterial {
  const uRow = uniform(new THREE.Vector3());
  const vRow = uniform(new THREE.Vector3());
  const minTemp = uniform(0);
  const maxTemp = uniform(1);
  // u = dot(uRow, (x, z, 1)) sur le sol, v de même.
  const point = vec3(positionWorld.x, positionWorld.z, 1);
  const map = texture(
    temperatureMap.texture,
    vec2(dot(uRow, point), dot(vRow, point)),
  );

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
    const temperature = map.r;
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

  material.userData.heatmapUniforms = {map, uRow, vRow, minTemp, maxTemp};
  updateHeatmapGroundMaterialWebGPU(material, temperatureMap);

  return material;
}

export function updateHeatmapGroundMaterialWebGPU(
  material: THREE.Material,
  temperatureMap: TemperatureMap,
) {
  const uniforms = (material as HeatmapNodeMaterial).userData.heatmapUniforms;
  if (!uniforms) return;
  uniforms.map.value = temperatureMap.texture;
  uniforms.uRow.value.fromArray(temperatureMap.uv[0]);
  uniforms.vRow.value.fromArray(temperatureMap.uv[1]);
  uniforms.minTemp.value = temperatureMap.minTemp;
  uniforms.maxTemp.value = temperatureMap.maxTemp;
}
