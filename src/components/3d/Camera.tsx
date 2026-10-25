import * as THREE from 'three';
import {useFrame, useThree} from '@react-three/fiber';
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
  const invalidate = useThree(state => state.invalidate);

  const factor = useRef(1);
  const isMoving = useRef(false);
  const isDragging = useRef(false);
  const hasMoved = useRef(false);
  const isStopping = useRef(false);
  const lastMove = useRef(0);
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

  const stopMoving = () => {
    isMoving.current = false;
    isStopping.current = false;
    onMovingChange?.(false);
    setDpr(window.devicePixelRatio);
  };

  // Après OrbitControls (priorité -1) : la première image sans déplacement,
  // hors d'un geste, marque la fin de l'inertie, même si les images sont lentes.
  useFrame(() => {
    const settled =
      isMoving.current && !isDragging.current && !hasMoved.current;
    hasMoved.current = false;
    if (!settled || isStopping.current) return;
    isStopping.current = true;
    const delay = lastMove.current + REST_DELAY - performance.now();
    timeout.current = setTimeout(stopMoving, delay);
  });

  return (
    <OrbitControls
      makeDefault
      maxPolarAngle={Math.PI / 2}
      minPolarAngle={0}
      onChange={() => {
        // Une fois l'inertie finie, OrbitControls applique encore des restes
        // sous son seuil à chaque image : sans geste, ils ne relancent pas le
        // mouvement (sinon les ombres et le DPR clignotent).
        const leftover = !isMoving.current || isStopping.current;
        if (leftover && !isDragging.current) return;
        clearTimeout(timeout.current);
        isStopping.current = false;
        hasMoved.current = true;
        lastMove.current = performance.now();
        if (!isMoving.current) startMoving();
      }}
      onStart={() => (isDragging.current = true)}
      onEnd={() => {
        isDragging.current = false;
        // Une image de plus pour constater l'arrêt d'un geste fini immobile.
        if (isMoving.current) invalidate();
      }}
    />
  );
}
