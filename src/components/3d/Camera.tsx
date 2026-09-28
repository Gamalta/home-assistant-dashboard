import * as THREE from 'three';
import {useFrame, useThree} from '@react-three/fiber';
import {OrbitControls, usePerformanceMonitor} from '@react-three/drei';
import {useEffect, useRef} from 'react';

type CameraProps = {
  /** Point visé par la caméra (centre de rotation). */
  target: THREE.Vector3Tuple;
};

const DPR_STEP = 0.25;
const quantize = (value: number) =>
  Math.max(DPR_STEP, Math.round(value / DPR_STEP) * DPR_STEP);

export function Camera(props: CameraProps) {
  const {target} = props;
  const {setDpr} = useThree();

  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMoving = useRef<boolean>(false);
  const factor = useRef(1);
  const maxDpr = useRef(window.devicePixelRatio);
  const smoothedDpr = useRef(maxDpr.current);
  const appliedDpr = useRef(maxDpr.current);

  useEffect(
    () => () => {
      if (timeout.current) clearTimeout(timeout.current);
    },
    [],
  );

  usePerformanceMonitor({
    onChange: ({factor: newFactor}) => (factor.current = newFactor),
  });

  useFrame(() => {
    if (!isMoving.current) return;
    const perf = THREE.MathUtils.clamp(factor.current, 0, 1) * maxDpr.current;
    smoothedDpr.current = THREE.MathUtils.lerp(smoothedDpr.current, perf, 0.1);
    const targetDpr = quantize(smoothedDpr.current);
    if (targetDpr !== appliedDpr.current) {
      appliedDpr.current = targetDpr;
      setDpr(targetDpr);
    }
  });

  return (
    <OrbitControls
      target={target}
      maxPolarAngle={Math.PI / 2}
      minPolarAngle={0}
      onStart={() => {
        if (timeout.current) clearTimeout(timeout.current);
        isMoving.current = true;
      }}
      onEnd={() =>
        (timeout.current = setTimeout(() => {
          isMoving.current = false;
          smoothedDpr.current = maxDpr.current;
          if (appliedDpr.current !== maxDpr.current) {
            appliedDpr.current = maxDpr.current;
            setDpr(maxDpr.current);
          }
        }, 1000))
      }
    />
  );
}
