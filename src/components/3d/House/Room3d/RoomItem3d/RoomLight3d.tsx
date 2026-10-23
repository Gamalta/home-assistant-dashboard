import {useEntity} from '@hakit/core';
import {useFrame, useThree} from '@react-three/fiber';
import {LightConfigType} from '../../../../../configs/house';
import {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';

type RoomLight3dProps = {
  lightConfig: LightConfigType;
};

export function RoomLight3d(props: RoomLight3dProps) {
  const {lightConfig} = props;
  const {scene, camera, gl, invalidate} = useThree();

  const light = useEntity(lightConfig.lightEntityId, {
    returnNullIfNotFound: true,
  });

  const [lightObject, setLightObject] = useState<THREE.Light>();
  const phase = useRef<'hidden' | 'showing' | 'visible' | 'hiding'>('hidden');
  const transition = useRef(0);
  useEffect(() => {
    const prefix = lightConfig.lightEntityId.split('.')[1].toLowerCase();
    let found: THREE.Light | undefined;
    scene.traverse(obj => {
      if (found || !(obj instanceof THREE.Light)) return;
      if (obj.name.toLowerCase().startsWith(prefix)) found = obj;
    });
    if (!found) {
      console.warn(
        `Aucune lumière 3D trouvée pour ${lightConfig.lightEntityId} (${prefix})`,
      );
    }
    setLightObject(found);
  }, [scene, lightConfig.lightEntityId]);

  useEffect(() => {
    if (!lightObject) return;
    lightObject.visible = false;
    lightObject.intensity = 0;

    phase.current = 'hidden';
    invalidate();
    return () => {
      transition.current++;
      lightObject.intensity = 0;
      lightObject.visible = false;
      invalidate();
    };
  }, [lightObject, invalidate]);

  const maxIntensity = lightConfig.intensity ?? 12.75;
  const targetIntensity =
    light?.state === 'on'
      ? ((light?.attributes.brightness ?? 255) / 255) * maxIntensity
      : 0;

  const color = light?.custom?.color;
  const colorKey = color?.join(',');
  useEffect(() => {
    if (!color || !lightObject) return;
    lightObject.color.setRGB(
      color[0] / 255,
      color[1] / 255,
      color[2] / 255,
      THREE.SRGBColorSpace,
    );
    invalidate();
  }, [colorKey, lightObject, invalidate]);

  const setVisible = async (light: THREE.Light, visible: boolean) => {
    const id = ++transition.current;
    phase.current = visible ? 'showing' : 'hiding';
    light.visible = visible;
    try {
      await gl.compileAsync(scene, camera);
    } catch {
    }
    if (id !== transition.current) return;
    phase.current = visible ? 'visible' : 'hidden';
    invalidate();
  };

  useEffect(() => {
    if (!lightObject) return;
    if (targetIntensity > 0 && phase.current !== 'visible') {
      if (phase.current !== 'showing') setVisible(lightObject, true);
    } else if (targetIntensity === 0 && phase.current === 'showing') {
      setVisible(lightObject, false);
    }
    invalidate();
  }, [targetIntensity, lightObject]);

  useFrame((_, delta) => {
    if (!lightObject || phase.current !== 'visible') return;
    const epsilon = maxIntensity * 0.002;
    if (Math.abs(lightObject.intensity - targetIntensity) < epsilon) {
      lightObject.intensity = targetIntensity;
      if (targetIntensity === 0) setVisible(lightObject, false);
      return;
    }
    const t = 1 - Math.exp(-8 * Math.min(delta, 0.03));
    lightObject.intensity += (targetIntensity - lightObject.intensity) * t;
    invalidate();
  });

  return null;
}
