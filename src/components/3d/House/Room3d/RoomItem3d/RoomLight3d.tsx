import {useEntity} from '@hakit/core';
import {useThree} from '@react-three/fiber';
import {LightConfigType} from '../../../../../configs/house';
import {useEffect} from 'react';
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

  useEffect(() => {
    invalidate();
    let lightMesh: THREE.Light | undefined;

    scene.traverse(obj => {
      if (
        obj.name
          .toLowerCase()
          .startsWith(lightConfig.lightEntityId.split('.')[1].toLowerCase())
      ) {
        lightMesh = obj as THREE.Light;
      }
    });

    if (!lightMesh) return;

    // ON / OFF
    lightMesh.visible = light?.state === 'on';
    // couleur
    if (light?.custom?.color) {
      lightMesh.color.set(new THREE.Color(...light.custom.color));
    }

    // intensité
    lightMesh.intensity = light?.state === 'on' ? 0.05 : 0;

    // On réecrit l'angle car 180 venant de blender ne fonctionne pas (on perd les ombres)
    if ('angle' in lightMesh && Number(lightMesh.angle) > 1.57079637050628) {
      lightMesh.angle = 180;
    }

    return () => {
      if (!lightMesh) return;
      lightMesh.visible = false;
      lightMesh.intensity = 0;
    };
  }, [light]);

  return <></>;
}
