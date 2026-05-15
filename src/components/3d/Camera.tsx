import {useFrame, useThree} from '@react-three/fiber';
import {useRef, useState} from 'react';
import {usePerformanceMonitor} from '@react-three/drei';
import {OrbitControls} from '@react-three/drei';

export function Camera() {
  const controls = useRef<any>(null);
  const [dpr, setDpr] = useState(1);
  const [factor, setFactor] = useState(0.5);
  const {invalidate, setDpr: setThreeDpr} = useThree();

  const setDprSafe = (dpr: number) => {
    setDpr(dpr);
    setThreeDpr(dpr);
  };

  usePerformanceMonitor({onChange: ({factor}) => setFactor(factor)});

  useFrame(() => {
    const controlsObj = controls.current;
    if (!controlsObj) return;

    const isIdle = controlsObj.getDistance?.() < 0.01;

    if (isIdle) {
      if (dpr < 1) {
        setDprSafe(Math.min(1, dpr + 0.2));
        invalidate();
      }
    } else {
      setDprSafe(Math.round(Math.max(factor, 0.1) * 10) / 10);
      invalidate();
    }
  });

  return <OrbitControls />;
}
