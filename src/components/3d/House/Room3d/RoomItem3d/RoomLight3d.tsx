import {useEntity} from '@hakit/core';
import {useFrame, useThree} from '@react-three/fiber';
import {LightConfigType} from '../../../../../configs/house';
import {useEffect, useState} from 'react';
import * as THREE from 'three';

type RoomLight3dProps = {
  lightConfig: LightConfigType;
};

export function RoomLight3d(props: RoomLight3dProps) {
  const {lightConfig} = props;
  const {scene, invalidate} = useThree();

  const light = useEntity(lightConfig.lightEntityId, {
    returnNullIfNotFound: true,
  });

  const [lightMesh, setLightMesh] = useState<THREE.Light>();
  useEffect(() => {
    const prefix = lightConfig.lightEntityId.split('.')[1].toLowerCase();
    let found: THREE.Light | undefined;
    scene.traverse(obj => {
      if (found) return;
      if (obj.name.toLowerCase().startsWith(prefix)) {
        found = obj as THREE.Light;
      }
    });
    setLightMesh(found);
  }, [scene, lightConfig.lightEntityId]);

  useEffect(() => {
    if (!lightMesh) return;
    lightMesh.visible = true;
    lightMesh.intensity = 0;

    // On réecrit l'angle car 180 venant de blender ne fonctionne pas (on perd les ombres)
    if ('angle' in lightMesh && Number(lightMesh.angle) > 1.57079637050628) {
      lightMesh.angle = 180;
    }

    invalidate();
    return () => {
      lightMesh.intensity = 0;
      invalidate();
    };
  }, [lightMesh, invalidate]);

  const targetIntensity = light?.state === 'on' ? ((light?.attributes.brightness ?? 255) / 255 * 0.05) : 0;
  useEffect(() => {
    if (!lightMesh) return;

    if (light?.custom?.color) {
      lightMesh.color.set(new THREE.Color(...light.custom.color));
    }
    invalidate();
  }, [light, lightMesh, targetIntensity, invalidate]);

  useFrame((_, delta) => {
    if (!lightMesh) return;

    if (Math.abs(lightMesh.intensity - targetIntensity) < 0.0001) {
      lightMesh.intensity = targetIntensity;
      return;
    }

    const t = 1 - Math.exp(-8 * Math.min(delta, 0.03));
    lightMesh.intensity += (targetIntensity - lightMesh.intensity) * t;
    invalidate();
  });

  return <></>;
}
