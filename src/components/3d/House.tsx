import {Canvas, Vector3, useLoader} from '@react-three/fiber';
import {useEffect, useRef} from 'react';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {HouseConfig} from './config';
import {Room} from './Room';
import {Camera} from './Camera';
import {Button, Stack} from '@mui/material';
import {AmbientLight} from './AmbientLight';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import {useHouseContext} from '../../context/House';

export function House() {
  const config = HouseConfig;

  const HouseModel = useLoader(GLTFLoader, config.model);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {room, setRoom} = useHouseContext();

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(HouseModel.scene);
    const size = box.getSize(new THREE.Vector3());
    HouseModel.scene.position.set(-size.x / 2, 0, size.z / 2);
    HouseModel.scene.traverse(object => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
        object.material.envMapIntensity = 20;
      }
    });
  }, [HouseModel]);

  return (
    <Stack position="relative" height="100%">
      <Stack position="absolute" height="100%" width="100%">
        <Canvas shadows flat ref={canvasRef}>
          <Camera />
          <AmbientLight />
          <OutsideLight position={[0, 5, 4]} />
          <OutsideLight position={[0, 5, -4]} />
          <OutsideLight position={[4, 5, 0]} />

          {/* House model */}
          <primitive object={HouseModel.scene} />

          {/* Transparent ceiling for lock light */}
          <mesh position={[0, 2.55, 0]} castShadow>
            <boxGeometry args={[10, 0.1, 9]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
          {config.room.map(room => (
            <Room key={room.name} room={room} debug={room.debug} />
          ))}
        </Canvas>
      </Stack>
      {room && (
        <Button
          onClick={() => setRoom(null)}
          sx={{position: 'absolute', top: 0, left: 0}}
        >
          <ArrowBackRoundedIcon />
        </Button>
      )}
    </Stack>
  );
}

const OutsideLight = ({position}: {position: Vector3}) => (
  <directionalLight
    castShadow
    position={position}
    intensity={0.05}
    shadow-mapSize-width={1024}
    shadow-mapSize-height={1024}
    shadow-camera-left={-7}
    shadow-camera-right={7}
    shadow-camera-top={7}
    shadow-camera-bottom={-7}
    shadow-bias={-0.0001}
    shadow-normalBias={0.05}
  />
);
