import Stack from '@mui/material/Stack';
import {useHouseContext} from '../../../contexts/HouseContext';
import {Canvas} from '@react-three/fiber';
import {useRef} from 'react';
import {
  Environment,
  GizmoHelper,
  GizmoViewport,
  PerformanceMonitor,
  Stats,
  useGLTF,
} from '@react-three/drei';
import {Scene} from './Scene';
import {AmbientLight} from './AmbientLight';
import {Camera} from '../Camera';
import {useAppContext} from '../../../contexts/AppContext';
import {Room3d} from './Room3d';
import {Bloom, EffectComposer} from '@react-three/postprocessing';

export function House() {
  const {configuration} = useAppContext();
  const {houseConfig} = useHouseContext();
  const {scene, cameras} = useGLTF(houseConfig?.house?.model!);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const mainCamera =
    cameras?.find(camera => camera.name === houseConfig?.house?.camera) ??
    cameras?.[0];

  return (
    <Stack sx={{position: 'relative', height: '100%'}}>
      <Stack sx={{position: 'relative', height: '100%', width: '100%'}}>
        <Canvas
          frameloop="demand"
          camera={{position: mainCamera?.position.toArray() ?? [0, 7, -7]}}
          flat
          ref={canvasRef}
        >
          <PerformanceMonitor
            ms={100}
            iterations={3}
            threshold={0.5}
            factor={0.5}
          >
            {configuration.debug && (
              <>
                <GizmoHelper alignment="top-right" margin={[55, 55]}>
                  <GizmoViewport
                    axisColors={['red', 'green', 'blue']}
                    labelColor="black"
                  />
                </GizmoHelper>
                <Stats />
              </>
            )}
            <Camera />
            <Scene scene={scene} />
            <AmbientLight />
            <Environment preset="night" resolution={128} />
            <EffectComposer multisampling={0}>
              <Bloom intensity={0.05} luminanceThreshold={0.9} />
            </EffectComposer>
            {houseConfig?.house?.rooms.map(room => (
              <Room3d key={room.id} room={room} />
            ))}
          </PerformanceMonitor>
        </Canvas>
      </Stack>
    </Stack>
  );
}
