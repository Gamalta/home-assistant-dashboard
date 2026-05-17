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
import {HideWalls} from './HideWalls';
import {HeatmapGround} from './HeatmapGround';
import {WebGLRenderer, WebGLRendererParameters} from 'three';
import {WebGPURenderer} from 'three/webgpu';
import {WebGPURendererParameters} from 'three/src/renderers/webgpu/WebGPURenderer.js';

export function House() {
  const {configuration} = useAppContext();
  const {houseConfig} = useHouseContext();
  const {scene, cameras} = useGLTF(houseConfig?.house?.model ?? '');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const mainCamera =
    cameras?.find(camera => camera.name === houseConfig?.house?.camera) ??
    cameras?.[0];

  return (
    <Stack sx={{position: 'relative', height: '100%'}}>
      <Stack sx={{position: 'relative', height: '100%', width: '100%'}}>
        <Canvas
          key={
            configuration.webGPU
              ? `config-${houseConfig?.id ?? 0}-webgpu`
              : `config-${houseConfig?.id ?? 0}-webgl`
          }
          frameloop="demand"
          camera={{position: mainCamera?.position.toArray() ?? [0, 7, -7]}}
          flat
          ref={canvasRef}
          gl={async gl => {
            if (configuration.webGPU) {
              const renderer = new WebGPURenderer(
                gl as WebGPURendererParameters,
              );
              await renderer.init();
              return renderer;
            }
            return new WebGLRenderer(gl as WebGLRendererParameters);
          }}
        >
          <PerformanceMonitor
            ms={100}
            iterations={3}
            threshold={0.5}
            factor={0.5}
          >
            {configuration.debug && (
              <>
                {!configuration.webGPU && (
                  <GizmoHelper alignment="top-right" margin={[55, 55]}>
                    <GizmoViewport
                      axisColors={['red', 'green', 'blue']}
                      labelColor="black"
                    />
                  </GizmoHelper>
                )}
                <Stats />
              </>
            )}
            <Camera />
            <Scene scene={scene} />
            <AmbientLight />
            {houseConfig?.house?.rooms.map(room => (
              <Room3d key={room.id} room={room} />
            ))}
            {configuration.hideWallsShader && <HideWalls />}
            {configuration.heatmapShader && (
              <HeatmapGround rooms={houseConfig?.house?.rooms ?? []} />
            )}
            <Environment preset="night" resolution={128} />
          </PerformanceMonitor>
        </Canvas>
      </Stack>
    </Stack>
  );
}
