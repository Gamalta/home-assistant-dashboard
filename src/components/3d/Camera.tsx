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
  // devicePixelRatio est constant pour un écran donné : on le lit une seule fois.
  const maxDpr = useRef(window.devicePixelRatio);
  // Valeur lissée (continue) et valeur réellement appliquée (quantifiée).
  const smoothedDpr = useRef(maxDpr.current);
  const appliedDpr = useRef(maxDpr.current);

  usePerformanceMonitor({
    onChange: ({factor: newFactor}) => (factor.current = newFactor),
  });

  // On quantifie le DPR par paliers de 0,25 pour éviter d'appeler setDpr
  // (donc renderer.setSize + réallocation du drawing buffer) à chaque frame.
  const DPR_STEP = 0.25;
  const quantize = (value: number) =>
    Math.max(DPR_STEP, Math.round(value / DPR_STEP) * DPR_STEP);

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
