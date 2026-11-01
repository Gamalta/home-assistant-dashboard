import {useLayoutEffect} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {sunDirection} from '../../../rendering/daylight';
import {bakedLight} from '../../../rendering/shaders/BakedLight/common';
import {useDaylight} from '../../../hooks/useDaylight';

type Ambience = {
  sky: string;
  ground: string;
  skyIntensity: number;
  sun: string;
  sunIntensity: number;
  exposure: number;
};

type DaylightProps = {
  /** Le ciel et le soleil viennent des cartes de lumière précalculées. */
  baked: boolean;
};

// Clair doux : ciel bleuté, soleil chaud, nuit bleue où les lampes dominent
// (ADR 0046). Ces réglages servent sans cartes de lumière.
const SOFT: Record<'day' | 'night', Ambience> = {
  day: {
    sky: '#eef3ff',
    ground: '#a39a8f',
    skyIntensity: 1.9,
    sun: '#ffe9c9',
    sunIntensity: 1.7,
    exposure: 1.1,
  },
  night: {
    sky: '#93a2c4',
    ground: '#323849',
    skyIntensity: 1.25,
    sun: '#c4d2ff',
    sunIntensity: 0.5,
    exposure: 1,
  },
};
// Les mêmes teintes avec les cartes, qui contiennent déjà les rebonds de la
// lumière : elles demandent moins de force.
const BAKED: typeof SOFT = {
  day: {
    sky: '#f2f5ff',
    ground: '#8a8580',
    skyIntensity: 1.7,
    sun: '#ffeedd',
    sunIntensity: 1.3,
    exposure: 1.05,
  },
  night: {
    sky: '#7f93c4',
    ground: '#2b3144',
    skyIntensity: 0.5,
    sun: '#c4d2ff',
    sunIntensity: 0,
    exposure: 1,
  },
};
// Avec les cartes, la lumière hémisphérique garde cette part du ciel : elle
// éclaire les faces que l'effacement des murs dévoile et que le calcul,
// fait maison fermée, laisse sombres.
const BAKED_FILL = 0.5;
const SUN = sunDirection({elevation: 45, azimuth: 215}).multiplyScalar(20);

const mix = (night: string, day: string, t: number) =>
  new THREE.Color(night).lerp(new THREE.Color(day), t);

/**
 * Ciel et soleil, plus ou moins forts selon `sun.sun` ou, à défaut, l'heure.
 * Seuls des uniforms suivent l'heure : aucun shader n'est recompilé.
 */
export function Daylight(props: DaylightProps) {
  const {baked} = props;
  const {gl, invalidate} = useThree();
  const day = useDaylight();
  const {day: DAY, night: NIGHT} = baked ? BAKED : SOFT;
  const sky = mix(NIGHT.sky, DAY.sky, day);
  const skyIntensity = THREE.MathUtils.lerp(
    NIGHT.skyIntensity,
    DAY.skyIntensity,
    day,
  );
  const sunColor = mix(NIGHT.sun, DAY.sun, day);
  const sunIntensity = THREE.MathUtils.lerp(
    NIGHT.sunIntensity,
    DAY.sunIntensity,
    day,
  );

  // Avant la première image : le tone mapping fait partie des shaders,
  // l'exposition n'est qu'un uniform.
  useLayoutEffect(() => {
    gl.toneMapping = THREE.NeutralToneMapping;
    gl.toneMappingExposure = THREE.MathUtils.lerp(
      NIGHT.exposure,
      DAY.exposure,
      day,
    );
    bakedLight.sky.copy(sky).multiplyScalar(skyIntensity);
    bakedLight.sun.copy(sunColor).multiplyScalar(sunIntensity);
    invalidate();
  }, [gl, day, baked, invalidate]);

  return (
    <>
      <hemisphereLight
        color={sky}
        groundColor={mix(NIGHT.ground, DAY.ground, day)}
        intensity={skyIntensity * (baked ? BAKED_FILL : 1)}
      />
      {!baked && (
        <directionalLight
          position={SUN}
          color={sunColor}
          intensity={sunIntensity}
        />
      )}
    </>
  );
}
