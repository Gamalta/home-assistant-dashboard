import {useFrame, useThree} from '@react-three/fiber';
import {type RefObject, useEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {enableSingleTapShadows} from './shadowSampling';

type LightShadowsProps = {
  scene: THREE.Object3D;
  enabled: boolean;
  /** Carte d'environnement active : elle occupe une unité de texture. */
  reflections: boolean;
  /** Caméra en mouvement : ombres suspendues. */
  moving: RefObject<boolean>;
};

type ShadowLight = THREE.SpotLight | THREE.PointLight;

const SHADOW_MAP_SIZE = 512;
// Les spots du modèle ont un cône de 180° : la caméra d'ombre (ouverture =
// 2 × angle × focus) serait dégénérée. Ramenée à ~144°, elle laisse les
// pixels presque à l'horizontale de la lampe sans ombre.
const SPOT_SHADOW_FOCUS = 0.8;
// Distance maximale utile dans la maison : améliore la précision de profondeur.
const SHADOW_FAR = 20;

/**
 * Ombres de toutes les lumières du modèle.
 *
 * - La maison est statique : une ombre n'est calculée qu'une fois, au premier
 *   rendu où sa lumière est allumée. Pendant une rotation, il ne reste que
 *   leur lecture.
 * - `castShadow` est posé sur toutes les lumières, même éteintes (three.js
 *   ignore les lumières invisibles) : la compilation en arrière-plan de
 *   RoomLight3d à l'allumage inclut ainsi l'ombre.
 * - Pendant un mouvement, les ombres sont suspendues : leur lecture coûte
 *   ~10× le reste du rendu par pixel sur une tablette d'entrée de gamme.
 *   Chaque matériau garde ses programmes avec et sans ombres, et les ombres
 *   calculées sont conservées : seul le premier changement compile.
 */
export function LightShadows(props: LightShadowsProps) {
  const {scene, enabled, reflections, moving} = props;
  const gl = useThree(state => state.gl);
  const invalidate = useThree(state => state.invalidate);
  // Lumières autorisées à projeter une ombre (unités de texture).
  const shadowLights = useRef<ShadowLight[]>([]);
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
    gl.shadowMap.enabled = true;
    scene.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      // Le calque de fondu des murs a la même géométrie que le mur.
      object.castShadow = !object.userData.fadeOverlay;
      object.receiveShadow = true;
    });

    // Chaque ombre occupe une unité de texture du shader, comme la texture
    // du matériau et la carte d'environnement : au-delà, il ne compile plus.
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
      // Calculée au premier rendu où la lumière est visible, puis conservée.
      shadow.autoUpdate = false;
      shadow.needsUpdate = true;
      if (light instanceof THREE.SpotLight) {
        light.shadow.focus = SPOT_SHADOW_FOCUS;
      }
    });
    shadowLights.current = lights.slice(0, budget);
    suspended.current = moving.current;
    shadowLights.current.forEach(
      light => (light.castShadow = !suspended.current),
    );
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
      gl.shadowMap.enabled = false;
      shadowLights.current = [];
      invalidate();
    };
  }, [enabled, reflections, gl, scene, lights, moving, invalidate]);

  // Évalué avant chaque rendu : OrbitControls signale le mouvement avant.
  useFrame(() => {
    if (moving.current === suspended.current) return;
    suspended.current = moving.current;
    shadowLights.current.forEach(
      light => (light.castShadow = !suspended.current),
    );
  });

  return null;
}
