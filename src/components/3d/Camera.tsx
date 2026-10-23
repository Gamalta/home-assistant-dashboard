import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {OrbitControls, usePerformanceMonitor} from '@react-three/drei';
import {useEffect, useRef} from 'react';

type CameraProps = {
  target: THREE.Vector3Tuple;
  onMovingChange?: (moving: boolean) => void;
};

const DPR_STEP = 0.25;
const MOTION_MAX_DPR = 1;
const MOTION_MIN_DPR = 0.5;
const REST_DELAY = 250;

const quantize = (value: number) =>
  Math.max(DPR_STEP, Math.round(value / DPR_STEP) * DPR_STEP);

export function Camera(props: CameraProps) {
  const {target, onMovingChange} = props;
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
      onMovingChange?.(true);
      const motionDpr = THREE.MathUtils.lerp(
        MOTION_MIN_DPR,
        MOTION_MAX_DPR,
        THREE.MathUtils.clamp(factor.current, 0, 1),
      );
      applyDpr(Math.min(restDpr.current, quantize(motionDpr)));
    }
    scheduleRest();
  };

  const scheduleRest = () => {
    if (timeout.current) clearTimeout(timeout.current);
    if (isDragging.current) return;
    timeout.current = setTimeout(() => {
      isMoving.current = false;
      onMovingChange?.(false);
      applyDpr(restDpr.current);
    }, REST_DELAY);
  };

  return (
    <OrbitControls
      makeDefault
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
