import Stack from '@mui/material/Stack';
import {useHouseContext} from '../../../contexts/HouseContext';
import {Canvas} from '@react-three/fiber';
import {useRef} from 'react';
import {GizmoHelper, GizmoViewcube, GizmoViewport, PerformanceMonitor, Stats, useGLTF} from '@react-three/drei';
import {Scene} from './Scene';
import {AmbientLight} from './AmbientLight';
import {Camera} from '../Camera';
import {Room} from '../../House/Room';
import {useAppContext} from '../../../contexts/AppContext';

export function House() {
  const {debug} = useAppContext();
  const {config} = useHouseContext();
  const houseConfig = config?.house;
  const {scene, cameras} = useGLTF(houseConfig?.model!);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const mainCamera =
    cameras?.find(camera => camera.name === houseConfig?.camera) ??
    cameras?.[0];

  return (
    <Stack sx={{position: 'relative', height: '100%'}}>
      <Stack sx={{position: 'relative', height: '100%', width: '100%'}}>
        <Canvas
          frameloop="demand"
          camera={{position: mainCamera?.position.toArray() ?? [0, 7, -7]}}
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
            {debug && (
              <>
                <GizmoHelper
                  alignment="top-right"
                  margin={[55, 55]}
                >
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
            {houseConfig?.rooms.map(room => (
              <Room key={room.id} room={room} />
            ))}
          </PerformanceMonitor>
        </Canvas>
      </Stack>
    </Stack>
  );
}
