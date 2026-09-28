import {useEntity} from '@hakit/core';
import {useFrame, useThree} from '@react-three/fiber';
import {LightConfigType} from '../../../../../configs/house';
import {useEffect, useRef, useState} from 'react';
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
  const {scene, camera, gl, invalidate} = useThree();

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
  // Changer le nombre de lumières visibles impose de recompiler les shaders.
  // On le fait en arrière-plan (compileAsync) pour éviter un à-coup :
  // hidden -> showing (compilation) -> visible (fondu) -> hiding -> hidden.
  const phase = useRef<'hidden' | 'showing' | 'visible' | 'hiding'>('hidden');
  const transition = useRef(0);
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
      // Une lumière éteinte est retirée du rendu : sinon chaque pixel continue
      // de la calculer, même à intensité nulle.
      lightObject.visible = false;
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

  const setVisible = async (visible: boolean) => {
    const id = ++transition.current;
    phase.current = visible ? 'showing' : 'hiding';
    lightObjects.forEach(lightObject => (lightObject.visible = visible));
    try {
      await gl.compileAsync(scene, camera);
    } catch {
      // Le rendu suivant compilera de façon synchrone.
    }
    if (id !== transition.current) return;
    phase.current = visible ? 'visible' : 'hidden';
    invalidate();
  };

  useEffect(() => {
    if (!lightObjects.length) return;
    if (targetIntensity > 0 && phase.current !== 'visible') {
      if (phase.current !== 'showing') setVisible(true);
    } else if (targetIntensity === 0 && phase.current === 'showing') {
      setVisible(false);
    }
    invalidate();
  }, [targetIntensity, lightObjects]);

  useFrame((_, delta) => {
    if (phase.current !== 'visible') return;
    let settled = true;
    // Seuil relatif : le fondu s'arrête dès que l'écart n'est plus visible.
    const epsilon = maxIntensity * 0.002;
    lightObjects.forEach(lightObject => {
      if (Math.abs(lightObject.intensity - targetIntensity) < epsilon) {
        lightObject.intensity = targetIntensity;
        return;
      }
      settled = false;
      const t = 1 - Math.exp(-8 * Math.min(delta, 0.03));
      lightObject.intensity += (targetIntensity - lightObject.intensity) * t;
    });
    if (!settled) invalidate();
    // Fondu de sortie terminé : on retire la lumière du rendu.
    else if (targetIntensity === 0) setVisible(false);
  });

  return null;
}
