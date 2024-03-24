import {useFrame} from '@react-three/fiber';
import {useRef} from 'react';
import * as THREE from 'three';

type CameraProps = {
  globalView: boolean;
};

export function Camera(props: CameraProps) {
  const {globalView} = props;
  const camera = useRef<THREE.PerspectiveCamera>(null);

  useFrame(state => {
    if (!globalView) return;
    state.camera.position.lerp(new THREE.Vector3(0, 8.2, 0), 0.05);
    state.camera.lookAt(0, 0, 0);
    state.camera.rotation.z = 0;
  });
  return <perspectiveCamera ref={camera} fov={50} position={[0, 10, 0]} />;
}
