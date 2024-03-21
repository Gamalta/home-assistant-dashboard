import {useFrame} from '@react-three/fiber';
import {CameraConfig} from './config';
import * as THREE from 'three';
import {useState} from 'react';

type RoomProps = {
  name: string;
  camera: CameraConfig;
  position: [number, number, number];
  size: [number, number];
};

export function Room(props: RoomProps) {
  const {name, camera, position, size} = props;
  const [clicked, setClicked] = useState(false);

  useFrame(state => {
    if (!clicked) return;
    const cameraPosition = new THREE.Vector3(...camera.position);
    const cameraLookAt = new THREE.Vector3(...camera.lookAt);

    state.camera.position.lerp(cameraPosition, 0.05);
    state.camera.lookAt(cameraLookAt);
    state.camera.updateProjectionMatrix();

    if (state.camera.position.distanceTo(cameraPosition) < 0.01) {
      //setClicked(false);
    }
  });

  return (
    <mesh
      position={position}
      castShadow
      onClick={() => setClicked(!clicked)}
      onPointerEnter={e => console.log('enter')}
      onPointerLeave={e => console.log('leave')}
    >
      <boxGeometry args={[size[0], 0.1, size[1]]} />
      <meshBasicMaterial transparent opacity={0.5} />
    </mesh>
  );
}
