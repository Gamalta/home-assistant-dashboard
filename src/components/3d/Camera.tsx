import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {OrbitControls, usePerformanceMonitor} from '@react-three/drei';
import {useEffect, useRef} from 'react';

type CameraProps = {
  onMovingChange?: (moving: boolean) => void;
};

const MOTION_MIN_DPR = 0.5;
const MOTION_MAX_DPR = 1;
const REST_DELAY = 250;

export function Camera(props: CameraProps) {
  const {onMovingChange} = props;
  const setDpr = useThree(state => state.setDpr);

  const factor = useRef(1);
  const isMoving = useRef(false);
  const isDragging = useRef(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  usePerformanceMonitor({
    onChange: ({factor: newFactor}) => (factor.current = newFactor),
  });

  useEffect(() => () => clearTimeout(timeout.current), []);

  const startMoving = () => {
    isMoving.current = true;
    onMovingChange?.(true);
    const dpr = THREE.MathUtils.lerp(
      MOTION_MIN_DPR,
      MOTION_MAX_DPR,
      THREE.MathUtils.clamp(factor.current, 0, 1),
    );
    setDpr(Math.min(window.devicePixelRatio, Math.round(dpr * 4) / 4));
  };

  const stopMovingLater = () => {
    clearTimeout(timeout.current);
    if (isDragging.current) return;
    timeout.current = setTimeout(() => {
      isMoving.current = false;
      onMovingChange?.(false);
      setDpr(window.devicePixelRatio);
    }, REST_DELAY);
  };

  return (
    <OrbitControls
      makeDefault
      maxPolarAngle={Math.PI / 2}
      minPolarAngle={0}
      onChange={() => {
        if (!isMoving.current) startMoving();
        stopMovingLater();
      }}
      onStart={() => {
        isDragging.current = true;
        clearTimeout(timeout.current);
      }}
      onEnd={() => {
        isDragging.current = false;
        stopMovingLater();
      }}
    />
  );
}
