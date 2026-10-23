import {useEffect, useState} from 'react';
import {useThree} from '@react-three/fiber';
import {useEntity} from '@hakit/core';
import * as THREE from 'three';

const NIGHT_INTENSITY = 0.05;
const DAY_INTENSITY = 0.7;
const NIGHT_ELEVATION = -6;
const DAY_ELEVATION = 10;

function intensityFromHour(date: Date) {
  const hour = date.getHours() + date.getMinutes() / 60;
  if (hour >= 19 || hour < 6) return NIGHT_INTENSITY;
  if (hour < 8) {
    return THREE.MathUtils.mapLinear(hour, 6, 8, NIGHT_INTENSITY, 0.5);
  }
  if (hour >= 17) {
    return THREE.MathUtils.mapLinear(hour, 17, 19, 0.5, NIGHT_INTENSITY);
  }
  return DAY_INTENSITY;
}

function intensityFromElevation(elevation: number) {
  const t = THREE.MathUtils.smoothstep(
    elevation,
    NIGHT_ELEVATION,
    DAY_ELEVATION,
  );
  return THREE.MathUtils.lerp(NIGHT_INTENSITY, DAY_INTENSITY, t);
}

export function AmbientLight() {
  const invalidate = useThree(state => state.invalidate);
  const sun = useEntity('sun.sun', {returnNullIfNotFound: true});
  const elevation = Number(sun?.attributes.elevation);
  const [hourIntensity, setHourIntensity] = useState(() =>
    intensityFromHour(new Date()),
  );

  useEffect(() => {
    const interval = setInterval(
      () => setHourIntensity(intensityFromHour(new Date())),
      60000,
    );
    return () => clearInterval(interval);
  }, []);

  const intensity = isNaN(elevation)
    ? hourIntensity
    : intensityFromElevation(elevation);

  useEffect(() => invalidate(), [intensity, invalidate]);

  return <ambientLight intensity={intensity} />;
}
