import {useFrame, useThree} from '@react-three/fiber';
import {useHouseContext} from '../../contexts/HouseContext';
import {useState} from 'react';
import {usePerformanceMonitor} from '@react-three/drei';
import * as THREE from 'three';
import {degToRad} from 'three/src/math/MathUtils.js';

export function Camera({cameras}: {cameras: THREE.Camera[]}) {
  const {room} = useHouseContext();
  const [dpr, _setDpr] = useState(1);
  const [factor, setFactor] = useState(0.5);
  const {invalidate, setDpr: setThreeDpr} = useThree();

  const setDpr = (dpr: number) => {
    _setDpr(dpr);
    setThreeDpr(dpr);
  };

  const camera =
    cameras &&
    cameras.find(camera => camera.name === (room ? room.camera : 'Default'));
  console.log('camera', camera, camera?.name);
  const cameraPosition = camera
    ? camera.position
    : new THREE.Vector3(0, 8.2, 0);
  const cameraLookAt = camera
    ? camera.rotation
    : new THREE.Euler(degToRad(-90), 0, 0);

  usePerformanceMonitor({onChange: ({factor}) => setFactor(factor)});

  useFrame(state => {
    if (state.camera.position.equals(cameraPosition)) {
      /** Increase DPR */
      if (dpr < 1) {
        setDpr(Math.min(1, dpr + 0.2));
        invalidate();
      }
    } else {
      /** Move Camera */
      if (state.camera.position.distanceTo(cameraPosition) < 0.01) {
        state.camera.position.copy(cameraPosition);
      } else {
        state.camera.position.lerp(cameraPosition, 0.05);
      }
      state.camera.rotation.copy(cameraLookAt);
      setDpr(Math.round(Math.max(factor, 0.1) * 10) / 10);
      invalidate();
    }
  });

  return null;
}
