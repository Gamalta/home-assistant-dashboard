import {useEntity} from '@hakit/core';
import {useFrame, useThree} from '@react-three/fiber';
import {LightConfigType} from '../../../../../configs/house';
import {useEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {lightColor} from '../../../../../utils/entity/light';
import {findModelLights} from '../../../../../utils/modelLights';

type RoomLight3dProps = {
  lightConfig: LightConfigType;
  model: THREE.Object3D;
};

export function RoomLight3d(props: RoomLight3dProps) {
  const {lightConfig, model} = props;
  const {scene, camera, gl, invalidate} = useThree();

  const light = useEntity(lightConfig.lightEntityId, {
    returnNullIfNotFound: true,
  });

  // Un groupe pilote les lumières de ses membres. La liste se compare par son
  // contenu : celle d'une entité simple est recréée à chaque rendu.
  const entityIds: string[] = light?.attributes.entity_id ?? [
    lightConfig.lightEntityId,
  ];
  const entityIdsKey = entityIds.join();
  // Cherchées dans le modèle pendant le rendu : les lumières prennent leur état
  // dès le premier commit, avant la précompilation de la scène (Precompile).
  const lightObjects = useMemo(
    () => findModelLights(model, entityIds),
    [model, entityIdsKey],
  );
  const phase = useRef<'hidden' | 'showing' | 'visible' | 'hiding'>('hidden');
  const transition = useRef(0);

  useEffect(() => {
    if (!lightObjects.length) {
      console.warn(
        `Aucune lumière 3D trouvée pour ${lightConfig.lightEntityId}`,
      );
      return;
    }
    lightObjects.forEach(lightObject => {
      lightObject.visible = false;
      lightObject.intensity = 0;
    });

    phase.current = 'hidden';
    invalidate();
    return () => {
      transition.current++;
      lightObjects.forEach(lightObject => {
        lightObject.intensity = 0;
        lightObject.visible = false;
      });
      invalidate();
    };
  }, [lightObjects, invalidate]);

  const maxIntensity = lightConfig.intensity ?? 12.75;
  const targetIntensity =
    light?.state === 'on'
      ? ((light?.attributes.brightness ?? 255) / 255) * maxIntensity
      : 0;

  const color = light ? lightColor(light) : undefined;
  const colorKey = color?.join(',');
  useEffect(() => {
    if (!color) return;
    lightObjects.forEach(lightObject =>
      lightObject.color.setRGB(
        color[0] / 255,
        color[1] / 255,
        color[2] / 255,
        THREE.SRGBColorSpace,
      ),
    );
    invalidate();
  }, [colorKey, lightObjects, invalidate]);

  const setVisible = async (lights: THREE.Light[], visible: boolean) => {
    const id = ++transition.current;
    phase.current = visible ? 'showing' : 'hiding';
    lights.forEach(light => (light.visible = visible));
    // Les autres lumières du même commit changent d'abord d'état : une seule
    // combinaison de lumières à compiler, pas une par lumière.
    await Promise.resolve();
    try {
      await gl.compileAsync(scene, camera);
    } catch {}
    if (id !== transition.current) return;
    phase.current = visible ? 'visible' : 'hidden';
    invalidate();
  };

  useEffect(() => {
    if (!lightObjects.length) return;
    if (targetIntensity > 0 && phase.current !== 'visible') {
      if (phase.current !== 'showing') setVisible(lightObjects, true);
    } else if (targetIntensity === 0 && phase.current === 'showing') {
      setVisible(lightObjects, false);
    }
    invalidate();
  }, [targetIntensity, lightObjects]);

  useFrame((_, delta) => {
    if (!lightObjects.length || phase.current !== 'visible') return;
    const epsilon = maxIntensity * 0.002;
    // Les lumières d'un groupe s'animent ensemble : la première sert de repère.
    if (Math.abs(lightObjects[0].intensity - targetIntensity) < epsilon) {
      lightObjects.forEach(light => (light.intensity = targetIntensity));
      if (targetIntensity === 0) setVisible(lightObjects, false);
      return;
    }
    const t = 1 - Math.exp(-8 * Math.min(delta, 0.03));
    lightObjects.forEach(
      light => (light.intensity += (targetIntensity - light.intensity) * t),
    );
    invalidate();
  });

  return null;
}
