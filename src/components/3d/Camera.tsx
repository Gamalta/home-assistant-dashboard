import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {OrbitControls, usePerformanceMonitor} from '@react-three/drei';
import {useEffect, useRef} from 'react';

type CameraProps = {
  /** Point visé par la caméra (centre de rotation). */
  target: THREE.Vector3Tuple;
};

const DPR_STEP = 0.25;
// Résolution utilisée pendant les mouvements : au plus 1 pixel rendu par
// pixel CSS, et jusqu'à 0.5 si l'appareil peine (PerformanceMonitor).
const MOTION_MAX_DPR = 1;
const MOTION_MIN_DPR = 0.5;
// Délai sans mouvement (amorti compris) avant de revenir à la pleine résolution.
const REST_DELAY = 250;

const quantize = (value: number) =>
  Math.max(DPR_STEP, Math.round(value / DPR_STEP) * DPR_STEP);

/**
 * Au repos (`frameloop="demand"`), une image coûte une seule fois : on la rend
 * en pleine résolution. Pendant une rotation, chaque image compte : on réduit
 * la résolution, ce qui divise le nombre de pixels à calculer par ~2 à 4.
 */
export function Camera(props: CameraProps) {
  const {target} = props;
  const setDpr = useThree(state => state.setDpr);

  const restDpr = useRef(window.devicePixelRatio);
  const appliedDpr = useRef(restDpr.current);
  const factor = useRef(1);
  const isMoving = useRef(false);
  const isDragging = useRef(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  usePerformanceMonitor({
    onChange: ({factor: newFactor}) => (factor.current = newFactor),
  });

  const applyDpr = (dpr: number) => {
    if (dpr === appliedDpr.current) return;
    appliedDpr.current = dpr;
    setDpr(dpr);
  };

  useEffect(
    () => () => {
      if (timeout.current) clearTimeout(timeout.current);
    },
    [],
  );

  const handleChange = () => {
    if (!isMoving.current) {
      isMoving.current = true;
      const motionDpr = THREE.MathUtils.lerp(
        MOTION_MIN_DPR,
        MOTION_MAX_DPR,
        THREE.MathUtils.clamp(factor.current, 0, 1),
      );
      applyDpr(Math.min(restDpr.current, quantize(motionDpr)));
    }
    scheduleRest();
  };

  // Retour à la pleine résolution une fois le doigt levé et l'amorti terminé.
  const scheduleRest = () => {
    if (timeout.current) clearTimeout(timeout.current);
    if (isDragging.current) return;
    timeout.current = setTimeout(() => {
      isMoving.current = false;
      applyDpr(restDpr.current);
    }, REST_DELAY);
  };

  return (
    <OrbitControls
      target={target}
      maxPolarAngle={Math.PI / 2}
      minPolarAngle={0}
      onChange={handleChange}
      onStart={() => {
        isDragging.current = true;
        if (timeout.current) clearTimeout(timeout.current);
      }}
      onEnd={() => {
        isDragging.current = false;
        scheduleRest();
      }}
    />
  );
}
