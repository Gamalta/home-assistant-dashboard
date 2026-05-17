import * as THREE from 'three';
import {useFrame, useThree} from '@react-three/fiber';
import {OrbitControls, usePerformanceMonitor} from '@react-three/drei';
import {useRef} from 'react';
import type {ComponentRef} from 'react';

export function Camera() {
  const {setDpr} = useThree();

  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const isMoving = useRef<boolean>(false);
  const factor = useRef(1);
  const currentDpr = useRef(window.devicePixelRatio);

  usePerformanceMonitor({
    onChange: ({factor: newFactor}) => (factor.current = newFactor),
  });

  useFrame(() => {
    const perf =
      THREE.MathUtils.clamp(factor.current, 0, 1) * window.devicePixelRatio;
    const nextDpr = THREE.MathUtils.lerp(currentDpr.current, perf, 0.1);
    const targetDpr = isMoving.current ? nextDpr : window.devicePixelRatio;
    if (Math.abs(targetDpr - currentDpr.current) > 0.01) {
      currentDpr.current = targetDpr;
      setDpr(targetDpr);
    }
  });

  return (
    <OrbitControls
      ref={controls}
      maxPolarAngle={Math.PI / 2}
      minPolarAngle={0}
      onStart={() => {
        if (timeout.current) clearTimeout(timeout.current);
        isMoving.current = true;
      }}
      onEnd={() =>
        (timeout.current = setTimeout(() => {
          isMoving.current = false;
          if (currentDpr.current != window.devicePixelRatio)
            setDpr(window.devicePixelRatio);
        }, 1000))
      }
    />
  );
}
