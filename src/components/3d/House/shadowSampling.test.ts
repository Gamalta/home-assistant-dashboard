import * as THREE from 'three';
import {expect, it, vi} from 'vitest';
import {enableSingleTapShadows} from './shadowSampling';

// Échoue si une mise à jour de three modifie le code PCF ciblé par le patch.
it('remplace les 5 lectures PCF de three par une seule', () => {
  const warn = vi.spyOn(console, 'warn');

  enableSingleTapShadows();
  const chunk = THREE.ShaderChunk.shadowmap_pars_fragment;

  expect(warn).not.toHaveBeenCalled();
  expect(chunk).toContain(
    'shadow = texture( shadowMap, vec3( shadowCoord.xy, shadowCoord.z ) );',
  );
  expect(chunk).toContain('shadow = texture( shadowMap, vec4( bd3D, dp ) );');
  expect(chunk).not.toContain(') * 0.2;');
});
