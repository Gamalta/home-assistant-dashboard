import {Canvas, Vector3} from '@react-three/fiber';
import {Suspense, useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {PerformanceMonitor, Stats, useGLTF} from '@react-three/drei';
import {HouseConfig} from './config';
import {Room} from './Room';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import {useHouseContext} from '../../contexts/HouseContext';
import {Loader} from './Loader';
import {degToRad} from 'three/src/math/MathUtils.js';
import {Camera} from './Camera';

export function House() {
  const config = HouseConfig;

  const [dpr, setDpr] = useState(1);
  const {scene} = useGLTF(config.model);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {room, setRoom} = useHouseContext();

  useEffect(() => {
    scene.position.set(-2.5, 0, 0);
    scene.rotation.set(0, degToRad(-90), 0);
    scene.traverse(object => {
      if (object instanceof THREE.Mesh) {
        object.material = new THREE.MeshStandardMaterial({
          color: 'white',
          roughness: 0.5,
          metalness: 0.5,
        });
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
  }, [scene]);

  return (
    <Stack position="relative" height="100%">
      <Stack position="absolute" height="100%" width="100%">
        <Suspense fallback={<Loader />}>
          <Canvas
            frameloop="demand"
            dpr={dpr}
            camera={{position: [0, 5, 10]}}
            performance={{min: 0.1, max: 1, current: 0.5}}
            gl={{antialias: false}}
            shadows
            flat
            ref={canvasRef}
          >
            <PerformanceMonitor
              ms={100}
              iterations={2}
              onChange={({factor}) => setDpr(Math.round(factor * 20) / 10)}
            />

            <Stats />
            <Camera />

            <OutsideLight position={[0, 5, 4]} />
            <OutsideLight position={[0, 5, -4]} />
            <OutsideLight position={[4, 5, 0]} />

            {/* House model */}
            <primitive object={scene} />

            {/* Transparent ceiling for lock light */}
            <mesh position={[0, 2.55, 0]} castShadow>
              <boxGeometry args={[10, 0.1, 9]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>

            {config.room.map(room => (
              <Room key={room.name} room={room} debug={room.debug} />
            ))}
          </Canvas>
        </Suspense>
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
    //castShadow
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

useGLTF.preload(HouseConfig.model);
