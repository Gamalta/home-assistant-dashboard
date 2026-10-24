import {useEffect, useState} from 'react';
import {useThree} from '@react-three/fiber';
import {useEntity} from '@hakit/core';
import * as THREE from 'three';
import {
  daylightFactor,
  sunDirection,
  sunFromHour,
  type SunPosition,
} from '../../../rendering/daylight';

const NIGHT_SKY = new THREE.Color('#c8c4bc');
const DAY_SKY = new THREE.Color('#dfe9ff');
const GROUND = '#8a7660';
const LOW_SUN = new THREE.Color('#ffb070');
const HIGH_SUN = new THREE.Color('#fff1dc');

type DaylightProps = {
  /** Azimut vers lequel pointe l'axe -Z du modèle, en degrés. */
  orientation?: number;
};

/**
 * Ciel et soleil, placés d'après `sun.sun` ou, à défaut, l'heure. Le nombre
 * de lumières ne change jamais : le jour qui passe ne recompile aucun shader.
 */
export function Daylight(props: DaylightProps) {
  const {orientation} = props;
  const invalidate = useThree(state => state.invalidate);
  const sunEntity = useEntity('sun.sun', {returnNullIfNotFound: true});
  const [hourSun, setHourSun] = useState(() => sunFromHour(new Date()));

  useEffect(() => {
    const interval = setInterval(
      () => setHourSun(sunFromHour(new Date())),
      60000,
    );
    return () => clearInterval(interval);
  }, []);

  const elevation = Number(sunEntity?.attributes.elevation);
  const sun: SunPosition = isNaN(elevation)
    ? hourSun
    : {elevation, azimuth: Number(sunEntity!.attributes.azimuth)};
  const day = daylightFactor(sun.elevation);
  const sunColor = LOW_SUN.clone().lerp(
    HIGH_SUN,
    THREE.MathUtils.smoothstep(sun.elevation, 0, 30),
  );

  useEffect(() => invalidate(), [sun.elevation, sun.azimuth, invalidate]);

  return (
    <>
      <hemisphereLight
        color={NIGHT_SKY.clone().lerp(DAY_SKY, day)}
        groundColor={GROUND}
        intensity={THREE.MathUtils.lerp(0.45, 0.6, day)}
      />
      <directionalLight
        position={sunDirection(sun, orientation).multiplyScalar(20)}
        color={sunColor}
        intensity={2 * day}
      />
    </>
  );
}
