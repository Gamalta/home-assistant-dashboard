import {Canvas, ThreeEvent, useThree} from '@react-three/fiber';
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
import {OutlineEffect} from 'postprocessing';
import {EffectComposer, Outline} from '@react-three/postprocessing';
import {OutsideLight} from './OutsideLight';
import {AmbientLight} from './AmbientLight';

export function House() {
  const config = HouseConfig;
  const {scene, cameras} = useGLTF(config.model);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {room, setRoom} = useHouseContext();

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
              <Scene scene={scene} />
              <AmbientLight />

              <OutsideLight position={[0, 5, 4]} />
              <OutsideLight position={[0, 5, -4]} />
              <OutsideLight position={[4, 5, 0]} />
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

type SceneProps = {
  scene: THREE.Group;
};

function Scene(props: SceneProps) {
  const config = HouseConfig;
  const {scene} = props;
  const outlineRef = useRef<OutlineEffect>(null);
  const {invalidate} = useThree();
  const {setRoom} = useHouseContext();

  useEffect(() => {
    scene.traverse(object => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;

        switch (object.name) {
          case 'Walls':
            object.material = new THREE.MeshStandardMaterial({
              color: 'white',
              roughness: 0.9,
              metalness: 0.0,
            });
            break;
          case 'Floor':
            object.material = new THREE.MeshStandardMaterial({
              color: 'gray',
              roughness: 0.6,
              metalness: 0.1,
            });
            break;
        }
      }
    });
  }, [scene]);

  const roomWithMesh = config.rooms.map(room => ({
    room,
    mesh: scene.children.find(obj => obj.name === `Room_${room.id}`),
    lightMeshes: scene.children.filter(obj =>
      obj.name.startsWith(`Light_${room.id}`)
    ),
  }));

  return (
    <>
      <primitive
        object={scene}
        onPointerOver={(event: ThreeEvent<PointerEvent>) => {
          event.stopPropagation();
          if (!outlineRef.current || !event.object.name.startsWith('Room_')) {
            return;
          }
          outlineRef.current.selection.set([event.object]);
          invalidate();
        }}
        onPointerOut={(event: ThreeEvent<PointerEvent>) => {
          event.stopPropagation();
          if (!outlineRef.current || !event.object.name.startsWith('Room_')) {
            return;
          }
          outlineRef.current.selection.clear();
          invalidate();
        }}
        onClick={(event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation();
          if (!event.object.name.startsWith('Room_')) return;
          const room = roomWithMesh.find(
            ({room}) => `Room_${room.id}` === event.object.name
          );
          if (room) setRoom(room.room);
        }}
      />
      {roomWithMesh.map(({room, mesh, lightMeshes}) => (
        <Room key={room.id} room={room} mesh={mesh} lightMeshes={lightMeshes} />
      ))}
      <EffectComposer autoClear={false}>
        <Outline ref={outlineRef} blur edgeStrength={100} />
      </EffectComposer>
    </>
  );
}

useGLTF.preload(HouseConfig.model);
