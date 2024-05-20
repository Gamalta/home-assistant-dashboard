import {Canvas, Vector3} from '@react-three/fiber';
import {Suspense, useEffect, useRef} from 'react';
import * as THREE from 'three';
import {PerformanceMonitor, Stats, useGLTF} from '@react-three/drei';
import {HouseConfig} from './config';
import {Room} from './Room';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import {useHouseContext} from '../../contexts/HouseContext';
import {Loader} from './Loader';
import {Camera} from './Camera';

export function House() {
  const config = HouseConfig;

  const {scene, cameras} = useGLTF(config.model);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {room, setRoom} = useHouseContext();

  useEffect(() => {
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
            camera={{position: [0, 5, 10]}}
            gl={{antialias: false}}
            shadows
            flat
            ref={canvasRef}
          >
            <PerformanceMonitor
              ms={100}
              iterations={3}
              threshold={0.5}
              factor={0.5}
            >
              <Stats />
              <Camera cameras={cameras} />

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
            </PerformanceMonitor>
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
