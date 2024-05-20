import {useFrame, useThree} from '@react-three/fiber';
import {useHouseContext} from '../../contexts/HouseContext';
import * as THREE from 'three';
import {HouseConfig} from './config';
import {useState} from 'react';
import {usePerformanceMonitor} from '@react-three/drei';

const DEFAULT_CAMERA_POSITION = HouseConfig.camera.position;
const DEFAULT_CAMERA_LOOKAT = HouseConfig.camera.lookAt;

export function Camera() {
  const {room} = useHouseContext();
  const [dpr, _setDpr] = useState(1);
  const [factor, setFactor] = useState(0.5);
  const {invalidate, setDpr: setThreeDpr} = useThree();

  const cameraPosition = new THREE.Vector3(
    ...(room ? room.camera.position : DEFAULT_CAMERA_POSITION)
  );
  const cameraLookAt = new THREE.Vector3(
    ...(room ? room.camera.lookAt : DEFAULT_CAMERA_LOOKAT)
  );

  const setDpr = (dpr: number) => {
    _setDpr(dpr);
    setThreeDpr(dpr);
  };

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
      state.camera.lookAt(cameraLookAt);
      setDpr(Math.round(Math.max(factor, 0.1) * 10) / 10);
      invalidate();
    }
  });

  return null;
}
