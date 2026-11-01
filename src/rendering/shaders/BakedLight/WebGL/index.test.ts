import * as THREE from 'three';
import {expect, it} from 'vitest';
import {applyBakedLightWebGl} from '.';

it('éclaire le matériau par la carte du ciel et celle du soleil', () => {
  const material = new THREE.MeshLambertMaterial();
  const sky = new THREE.Texture();
  const sun = new THREE.Texture();
  applyBakedLightWebGl(material, {sky, sun});
  const shader = {
    uniforms: {} as Record<string, THREE.IUniform>,
    vertexShader: THREE.ShaderLib.lambert.vertexShader,
    fragmentShader: THREE.ShaderLib.lambert.fragmentShader,
  };

  material.onBeforeCompile(
    shader as THREE.WebGLProgramParametersWithUniforms,
    {} as THREE.WebGLRenderer,
  );

  expect(material.lightMap).toBe(sky);
  expect(shader.uniforms.bakedSunMap.value).toBe(sun);
  // Une montée de three qui change le bloc de la lightMap ferait échouer ici.
  expect(shader.fragmentShader).toContain(
    'bakedSunLight * texture2D(bakedSunMap, vLightMapUv)',
  );
  expect(shader.fragmentShader).not.toContain(
    'lightMapTexel.rgb * lightMapIntensity',
  );
});
