import {useFrame, useThree} from '@react-three/fiber';
import {useHouseContext} from '../../contexts/HouseContext';
import * as THREE from 'three';

export function Camera() {
  const {room} = useHouseContext();
  const {invalidate} = useThree();
  const cameraPosition = new THREE.Vector3(0, 8.2, 0);
  const cameraLookAt = new THREE.Vector3(0, 0, -0.05);

  /*useFrame(state => {
    //Performance
    console.log('performance', state.performance.current);
    if (state.performance.current < 0.7) {
      state.performance.regress();
    }
  });*/

  useFrame(state => {
    /**Camera position */
    if (room || state.camera.position.equals(cameraPosition)) return;

    invalidate();
    if (state.camera.position.distanceTo(cameraPosition) < 0.01) {
      state.camera.position.copy(cameraPosition);
    } else {
      state.camera.position.lerp(cameraPosition, 0.05);
    }
    state.camera.lookAt(cameraLookAt);
  });

  return null;
}
