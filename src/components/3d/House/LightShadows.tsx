import {useFrame, useThree} from '@react-three/fiber';
import {type RefObject, useEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {enableSingleTapShadows} from './shadowSampling';

type LightShadowsProps = {
  scene: THREE.Object3D;
  enabled: boolean;
  reflections: boolean;
  moving: RefObject<boolean>;
};

type ShadowLight = THREE.SpotLight | THREE.PointLight;

const SHADOW_MAP_SIZE = 512;
const SPOT_SHADOW_FOCUS = 0.8;
const SHADOW_FAR = 20;

export function LightShadows(props: LightShadowsProps) {
  const {scene, enabled, reflections, moving} = props;
  const gl = useThree(state => state.gl);
  const invalidate = useThree(state => state.invalidate);
  const suspended = useRef(false);

  const lights = useMemo(() => {
    const found: ShadowLight[] = [];
    scene.traverse(object => {
      if (object instanceof THREE.SpotLight) found.push(object);
      else if (object instanceof THREE.PointLight) found.push(object);
    });
    return found;
  }, [scene]);

  useEffect(() => {
    if (!enabled) return;
    enableSingleTapShadows();
    suspended.current = moving.current;
    scene.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = !object.userData.fadeOverlay;
      object.receiveShadow = !suspended.current;
    });

    const maxTextures =
      gl instanceof THREE.WebGLRenderer
        ? gl.capabilities.maxTextures
        : Infinity;
    const budget = maxTextures - 1 - (reflections ? 1 : 0);
    if (lights.length > budget) {
      console.warn(
        `Ombres limitées à ${budget} lumières sur ${lights.length} (unités de texture).`,
      );
    }

    lights.forEach(light => {
      const {shadow} = light;
      shadow.mapSize.set(SHADOW_MAP_SIZE, SHADOW_MAP_SIZE);
      shadow.camera.far = SHADOW_FAR;
      shadow.bias = -0.0005;
      shadow.normalBias = 0.02;
      shadow.autoUpdate = false;
      shadow.needsUpdate = true;
      if (light instanceof THREE.SpotLight) {
        light.shadow.focus = SPOT_SHADOW_FOCUS;
      }
    });
    lights.slice(0, budget).forEach(light => (light.castShadow = true));
    invalidate();

    return () => {
      scene.traverse(object => {
        if (!(object instanceof THREE.Mesh)) return;
        object.castShadow = false;
        object.receiveShadow = false;
      });
      lights.forEach(light => {
        light.castShadow = false;
        light.shadow.dispose();
      });
      invalidate();
    };
  }, [enabled, reflections, gl, scene, lights, moving, invalidate]);

  // Le nombre d'ombres fait partie de la clé de programme, receiveShadow est un
  // uniform : suspendre la lecture des ombres ne recompile aucun shader.
  useFrame(() => {
    if (!enabled || moving.current === suspended.current) return;
    suspended.current = moving.current;
    scene.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      object.receiveShadow = !suspended.current;
    });
  });

  return null;
}
