import {useEffect, useLayoutEffect, useState} from 'react';
import {useThree} from '@react-three/fiber';
import {useEntity} from '@hakit/core';
import * as THREE from 'three';
import {
  daylightFactor,
  sunAtHour,
  sunDirection,
  sunFromHour,
  type SunPosition,
} from '../../../rendering/daylight';
import {useAppContext} from '../../../contexts/AppContext';

// Jour doux et chaud, nuit sombre et contrastée : le choix du propriétaire
// parmi dix ambiances essayées (ADR 0030).
const DAY = {
  sky: new THREE.Color('#fff3e3'),
  ground: new THREE.Color('#d9b48a'),
  skyIntensity: 1.1,
  exposure: 1.2,
};
const NIGHT = {
  sky: new THREE.Color('#c8c4bc'),
  ground: new THREE.Color('#8a7660'),
  skyIntensity: 0.45,
  exposure: 1,
};
// Soleil haut et fixe : il adoucit les volumes sans écraser une façade.
const SUN = sunDirection({elevation: 75, azimuth: 200}).multiplyScalar(20);

/**
 * Ciel et soleil, plus ou moins forts selon `sun.sun` ou, à défaut, l'heure.
 * Seuls des uniforms suivent l'heure : aucun shader n'est recompilé.
 */
export function Daylight() {
  const {gl, invalidate} = useThree();
  const sunEntity = useEntity('sun.sun', {returnNullIfNotFound: true});
  const {simulatedHour} = useAppContext();
  const [hourSun, setHourSun] = useState(() => sunFromHour(new Date()));

  useEffect(() => {
    const interval = setInterval(
      () => setHourSun(sunFromHour(new Date())),
      60000,
    );
    return () => clearInterval(interval);
  }, []);

  const elevation = Number(sunEntity?.attributes.elevation);
  const sun: SunPosition =
    simulatedHour !== null
      ? sunAtHour(simulatedHour)
      : isNaN(elevation)
        ? hourSun
        : {elevation, azimuth: Number(sunEntity!.attributes.azimuth)};
  const day = daylightFactor(sun.elevation);

  // Avant la première image : le tone mapping fait partie des shaders,
  // l'exposition n'est qu'un uniform.
  useLayoutEffect(() => {
    gl.toneMapping = THREE.NeutralToneMapping;
    gl.toneMappingExposure = THREE.MathUtils.lerp(
      NIGHT.exposure,
      DAY.exposure,
      day,
    );
    invalidate();
  }, [gl, day, invalidate]);

  return (
    <>
      <hemisphereLight
        color={NIGHT.sky.clone().lerp(DAY.sky, day)}
        groundColor={NIGHT.ground.clone().lerp(DAY.ground, day)}
        intensity={THREE.MathUtils.lerp(
          NIGHT.skyIntensity,
          DAY.skyIntensity,
          day,
        )}
      />
      <directionalLight position={SUN} color="#fff0d8" intensity={0.35 * day} />
    </>
  );
}
