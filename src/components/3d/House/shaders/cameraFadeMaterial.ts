import * as THREE from 'three';

export type FadeMaterial = THREE.MeshStandardMaterial & {
  userData: {
    shader?: THREE.WebGLProgramParametersWithUniforms;
  };
};

export function createCameraFadeMaterial(
  source: THREE.MeshStandardMaterial,
): FadeMaterial {
  const material = source.clone() as FadeMaterial;
  material.transparent = true;
  material.depthWrite = true;

  material.onBeforeCompile = shader => {
    material.userData.shader = shader;
    shader.uniforms.fadeRadius = {value: 8.0};
    shader.uniforms.minOpacity = {value: 0.05};
    shader.uniforms.nearFadeDistance = {value: 6.0};
    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `
      #include <common>
      varying vec3 vWorldPosition;
      `,
    );
    shader.vertexShader = shader.vertexShader.replace(
      '#include <worldpos_vertex>',
      `
      #include <worldpos_vertex>
      vWorldPosition = worldPosition.xyz;
      `,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `
      #include <common>
      varying vec3 vWorldPosition;
      uniform float fadeRadius;
      uniform float minOpacity;
      uniform float nearFadeDistance;
      `,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `
      float dist = length(cameraPosition - vWorldPosition);
      float opacity;

      if (dist < nearFadeDistance) {
        opacity = minOpacity;
      } else if (dist < fadeRadius) {
        opacity = smoothstep(nearFadeDistance, fadeRadius, dist);
        opacity = opacity * (1.0 - minOpacity) + minOpacity;
      } else {
        opacity = 1.0;
      }

      gl_FragColor.a *= opacity;
      #include <dithering_fragment>
      `,
    );
  };

  return material;
}