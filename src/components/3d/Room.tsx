import {useFrame} from '@react-three/fiber';
import {CameraConfig} from './config';
import * as THREE from 'three';

type RoomProps = {
  name: string;
  camera: CameraConfig;
  position: [number, number, number];
  size: [number, number];
  active: boolean;
  onClick: () => void;
};

export function Room(props: RoomProps) {
  const {name, camera, position, size, active, onClick} = props;

  useFrame(state => {
    if (!active) return;
    const cameraPosition = new THREE.Vector3(...camera.position);
    const cameraLookAt = new THREE.Vector3(...camera.lookAt);

    state.camera.position.lerp(cameraPosition, 0.05);
    state.camera.lookAt(cameraLookAt);
  });

  return (
    <mesh
      position={position}
      castShadow
      onClick={onClick}
      onPointerEnter={() => console.log('enter')}
      onPointerLeave={() => console.log('leave')}
    >
      <boxGeometry args={[size[0], 0.1, size[1]]} />
      <meshBasicMaterial transparent opacity={0.5} />
    </mesh>
  );
}
