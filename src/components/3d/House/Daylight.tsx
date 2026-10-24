import {useEffect, useLayoutEffect, useState} from 'react';
import {useThree} from '@react-three/fiber';
import {useEntity} from '@hakit/core';
import * as THREE from 'three';
import {
  daylightFactor,
  sunDirection,
  sunAtHour,
  sunFromHour,
  type SunPosition,
} from '../../../rendering/daylight';
import type {LightingStyle} from '../../../rendering/lightingStyles';
import {useAppContext} from '../../../contexts/AppContext';

const NIGHT_SKY = new THREE.Color('#c8c4bc');
const LOW_SUN = new THREE.Color('#ffb070');

type DaylightProps = {
  style: LightingStyle;
  /** Azimut vers lequel pointe l'axe -Z du modèle, en degrés. */
  orientation?: number;
};

/**
 * Ciel et soleil, placés d'après `sun.sun` ou, à défaut, l'heure. Le nombre
 * de lumières ne change jamais : le jour qui passe ne recompile aucun shader.
 */
export function Daylight(props: DaylightProps) {
  const {style, orientation} = props;
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

  // Avant la première image : le tone mapping fait partie des shaders.
  useLayoutEffect(() => {
    gl.toneMapping = style.toneMapping;
    gl.toneMappingExposure = style.exposure ?? 1;
    invalidate();
  }, [gl, style, invalidate]);

  const elevation = Number(sunEntity?.attributes.elevation);
  const sun: SunPosition =
    simulatedHour !== null
      ? sunAtHour(simulatedHour)
      : isNaN(elevation)
        ? hourSun
        : {elevation, azimuth: Number(sunEntity!.attributes.azimuth)};
  const day = daylightFactor(sun.elevation);
  const fixedSun = style.sunElevation !== undefined;
  const direction = fixedSun
    ? sunDirection({
        elevation: style.sunElevation!,
        azimuth: style.sunAzimuth ?? 180,
      })
    : sunDirection(sun, orientation);
  const sunColor = new THREE.Color(style.sun);
  if (!fixedSun) {
    sunColor.lerp(
      LOW_SUN,
      1 - THREE.MathUtils.smoothstep(sun.elevation, 0, 30),
    );
  }

  useEffect(() => invalidate(), [sun.elevation, sun.azimuth, invalidate]);

  return (
    <>
      <ambientLight intensity={(style.ambient ?? 0) * day} />
      <hemisphereLight
        color={NIGHT_SKY.clone().lerp(new THREE.Color(style.sky), day)}
        groundColor={style.ground}
        intensity={THREE.MathUtils.lerp(0.45, style.skyIntensity, day)}
      />
      <directionalLight
        position={direction.multiplyScalar(20)}
        color={sunColor}
        intensity={style.sunIntensity * day}
      />
    </>
  );
}
