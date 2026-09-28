import {useEntity} from '@hakit/core';
import {useFrame, useThree} from '@react-three/fiber';
import {LightConfigType} from '../../../../../configs/house';
import {useEffect, useState} from 'react';
import * as THREE from 'three';

type RoomLight3dProps = {
  lightConfig: LightConfigType;
};

// Calibrée sur le rendu précédent, où la couleur 0-255 était passée telle
// quelle à three.js (ce qui multipliait l'intensité 0.05 par 255).
const DEFAULT_INTENSITY = 12.75;
// Angle maximal d'une SpotLight three.js (demi-angle du cône).
const MAX_SPOT_ANGLE = Math.PI / 2;

export function RoomLight3d(props: RoomLight3dProps) {
  const {lightConfig} = props;
  const {scene, invalidate} = useThree();

  const light = useEntity(lightConfig.lightEntityId, {
    returnNullIfNotFound: true,
  });

  const lightNamesKey = (
    lightConfig.lightNames ?? [lightConfig.lightEntityId.split('.')[1]]
  )
    .map(name => name.toLowerCase())
    .join('|');

  // Une entité peut piloter plusieurs lumières du modèle (ex: salon_light et
  // salon_light_2).
  const [lightObjects, setLightObjects] = useState<THREE.Light[]>([]);
  useEffect(() => {
    const names = lightNamesKey.split('|');
    const useExactNames = !!lightConfig.lightNames;
    const found: THREE.Light[] = [];
    scene.traverse(obj => {
      if (!(obj instanceof THREE.Light)) return;
      const name = obj.name.toLowerCase();
      const matches = useExactNames
        ? names.includes(name)
        : names.some(prefix => name.startsWith(prefix));
      if (matches) found.push(obj);
    });
    if (!found.length) {
      console.warn(
        `Aucune lumière 3D trouvée pour ${lightConfig.lightEntityId} (${names.join(', ')})`,
      );
    }
    setLightObjects(found);
  }, [scene, lightNamesKey, lightConfig.lightNames, lightConfig.lightEntityId]);

  useEffect(() => {
    lightObjects.forEach(lightObject => {
      lightObject.visible = true;
      lightObject.intensity = 0;

      // Un spot « 180° » dans Blender est exporté avec un angle > π/2, que
      // three.js ne gère pas : on le ramène au maximum supporté (en radians).
      if (
        lightObject instanceof THREE.SpotLight &&
        lightObject.angle > MAX_SPOT_ANGLE
      ) {
        lightObject.angle = MAX_SPOT_ANGLE;
      }
    });

    invalidate();
    return () => {
      lightObjects.forEach(lightObject => (lightObject.intensity = 0));
      invalidate();
    };
  }, [lightObjects, invalidate]);

  const maxIntensity = lightConfig.intensity ?? DEFAULT_INTENSITY;
  const targetIntensity =
    light?.state === 'on'
      ? ((light?.attributes.brightness ?? 255) / 255) * maxIntensity
      : 0;

  const color = light?.custom?.color;
  const colorKey = color?.join(',');
  useEffect(() => {
    if (!color) return;
    // Home Assistant fournit du RGB 0-255, three.js attend des valeurs 0-1.
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

  useFrame((_, delta) => {
    lightObjects.forEach(lightObject => {
      if (Math.abs(lightObject.intensity - targetIntensity) < 0.0001) {
        lightObject.intensity = targetIntensity;
        return;
      }

      const t = 1 - Math.exp(-8 * Math.min(delta, 0.03));
      lightObject.intensity += (targetIntensity - lightObject.intensity) * t;
      invalidate();
    });
  });

  return null;
}
