import {Canvas, invalidate} from '@react-three/fiber';
import Stack from '@mui/material/Stack';
import {useEffect, useRef, useState} from 'react';
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
import {RoomFocus} from '../RoomFocus';
import {Benchmark} from '../Benchmark';
import {Room3d} from './Room3d';
import {SceneMaterials} from './SceneMaterials';
import {LightShadows} from './LightShadows';
import {Precompile} from './Precompile';
import {ModelLoader} from './ModelLoader';

type HouseSceneProps = {
  backend: RenderBackend;
  model: string;
  focusRoomId?: string;
  paused?: boolean;
};

export function HouseScene(props: HouseSceneProps) {
  const {backend, model, focusRoomId, paused = false} = props;
  const {configuration} = useAppContext();
  const {houseConfig} = useHouseContext();
  const {scene, cameras} = useGLTF(model);
  const camera = useModelCamera(cameras, houseConfig?.house.camera);
  const rooms = houseConfig?.house.rooms ?? [];
  const focusRoom = rooms.find(room => room.id === focusRoomId);
  const moving = useRef(false);
  // Options qui changent les shaders : la scène ne s'affiche qu'une fois
  // compilée pour celles en cours.
  const graphics = [
    configuration.hideWallsShader,
    configuration.heatmapShader,
    configuration.shadows,
  ].join();
  const [compiled, setCompiled] = useState<string>();
  const ready = compiled === graphics;

  // En pause, la boucle ignore les invalidate() : une image au retour
  // rattrape les changements survenus entre-temps.
  useEffect(() => {
    if (!paused) invalidate();
  }, [paused]);

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
        frameloop={ready && !paused ? 'demand' : 'never'}
        camera={{position: camera.position, fov: camera.fov}}
        // R3F réapplique `shadows` à gl.shadowMap à chaque rendu du Canvas :
        // sans la prop, il éteint les ombres. PCF explicite : three remplace
        // PCFSoft, obsolète, au premier rendu d'ombre, ce qui change la clé
        // des programmes.
        shadows={configuration.shadows && 'percentage'}
        gl={backend.createRenderer}
        // drei donne aux étiquettes un z-index qui croît quand la caméra
        // approche, jusqu'à 16 millions : isolées dans le canvas, elles
        // restent sous le chargeur, le menu rapide et les modales.
        style={{isolation: 'isolate'}}
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
          {focusRoom && (
            <RoomFocus position={focusRoom.position} base={camera.position} />
          )}
          {ready && <Benchmark backend={backend} />}
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
            <Room3d
              key={room.id}
              room={room}
              model={scene}
              showLabels={!focusRoomId || room.id === focusRoomId}
            />
          ))}
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
