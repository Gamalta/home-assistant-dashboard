import {Canvas} from '@react-three/fiber';
import Stack from '@mui/material/Stack';
import {useRef, useState} from 'react';
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
import {AmbientLight} from './AmbientLight';
import {Camera} from '../Camera';
import {Benchmark} from '../Benchmark';
import {Room3d} from './Room3d';
import {SceneMaterials} from './SceneMaterials';
import {EnvironmentLighting} from './EnvironmentLighting';
import {LightShadows} from './LightShadows';
import {Precompile} from './Precompile';
import {ModelLoader} from './ModelLoader';
import nightEnvironment from '../assets/dikhololo_night_1k.hdr?url';

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
  // Options qui changent les shaders : la scène ne s'affiche qu'une fois
  // compilée pour celles en cours.
  const graphics = [
    configuration.hideWallsShader,
    configuration.heatmapShader,
    configuration.environmentReflections,
    configuration.shadows,
  ].join();
  const [compiled, setCompiled] = useState<string>();
  const ready = compiled === graphics;

  return (
    <>
      {compiled === undefined && (
        <Stack
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            bgcolor: 'background.default',
          }}
        >
          <ModelLoader />
        </Stack>
      )}
      <Canvas
        frameloop={ready ? 'demand' : 'never'}
        camera={{position: camera.position, fov: camera.fov}}
        flat
        // R3F réapplique `shadows` à gl.shadowMap à chaque rendu du Canvas :
        // sans la prop, il éteint les ombres. PCF explicite : three remplace
        // PCFSoft, obsolète, au premier rendu d'ombre, ce qui change la clé
        // des programmes.
        shadows={configuration.shadows && 'percentage'}
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
          {ready && <Benchmark backend={backend} />}
          <Scene scene={scene} backend={backend} />
          <SceneMaterials
            scene={scene}
            backend={backend}
            hideWalls={configuration.hideWallsShader}
            heatmap={configuration.heatmapShader}
            diffuseOnly={!configuration.environmentReflections}
            rooms={rooms}
          />
          <LightShadows
            scene={scene}
            enabled={configuration.shadows}
            reflections={configuration.environmentReflections}
            moving={moving}
          />
          <AmbientLight />
          {rooms.map(room => (
            <Room3d key={room.id} room={room} />
          ))}
          <EnvironmentLighting
            file={nightEnvironment}
            reflections={configuration.environmentReflections}
          />
          <Precompile
            key={graphics}
            backend={backend}
            onCompiled={() => setCompiled(graphics)}
          />
        </PerformanceMonitor>
      </Canvas>
    </>
  );
}
