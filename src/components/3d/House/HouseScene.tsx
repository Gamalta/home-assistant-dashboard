import {Canvas} from '@react-three/fiber';
import {useRef} from 'react';
import {
  GizmoHelper,
  GizmoViewport,
  PerformanceMonitor,
  Stats,
  useGLTF,
} from '@react-three/drei';
import {useHouseContext} from '../../../contexts/HouseContext';
import {useAppContext} from '../../../contexts/AppContext';
import {useModelCamera} from '../../../hooks/useModelCamera';
import type {RenderBackend} from '../../../rendering/backends';
import {Scene} from './Scene';
import {Daylight} from './Daylight';
import {Camera} from '../Camera';
import {Benchmark} from '../Benchmark';
import {Room3d} from './Room3d';
import {SceneMaterials} from './SceneMaterials';
import {LightShadows} from './LightShadows';

type HouseSceneProps = {
  backend: RenderBackend;
  model: string;
};

export function HouseScene(props: HouseSceneProps) {
  const {backend, model} = props;
  const {configuration} = useAppContext();
  const {houseConfig} = useHouseContext();
  const {scene, cameras} = useGLTF(model);
  const camera = useModelCamera(cameras, houseConfig?.house.camera);
  const rooms = houseConfig?.house.rooms ?? [];
  const moving = useRef(false);

  return (
    <Canvas
      key={`config-${houseConfig?.id ?? 0}-${backend.kind}`}
      frameloop="demand"
      camera={{position: camera.position, fov: camera.fov}}
      gl={backend.createRenderer}
    >
      <PerformanceMonitor ms={250} iterations={5} step={0.1} factor={1}>
        {configuration.debug && (
          <>
            {backend.kind === 'webgl' && (
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
        <Camera onMovingChange={value => (moving.current = value)} />
        <Benchmark backend={backend} />
        <Scene scene={scene} backend={backend} />
        <SceneMaterials
          scene={scene}
          backend={backend}
          hideWalls={configuration.hideWallsShader}
          heatmap={configuration.heatmapShader}
          rooms={rooms}
        />
        <LightShadows
          scene={scene}
          enabled={configuration.shadows}
          moving={moving}
        />
        <Daylight />
        {rooms.map(room => (
          <Room3d key={room.id} room={room} />
        ))}
      </PerformanceMonitor>
    </Canvas>
  );
}
