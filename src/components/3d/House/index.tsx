import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import {Canvas} from '@react-three/fiber';
import {Suspense, useEffect, useMemo, useRef, useState} from 'react';
import {
  GizmoHelper,
  GizmoViewport,
  PerformanceMonitor,
  Stats,
  useGLTF,
  useProgress,
} from '@react-three/drei';
import * as THREE from 'three';
import {useHouseContext} from '../../../contexts/HouseContext';
import {useAppContext} from '../../../contexts/AppContext';
import {Scene} from './Scene';
import {AmbientLight} from './AmbientLight';
import {Camera} from '../Camera';
import {Benchmark} from '../Benchmark';
import {Room3d} from './Room3d';
import {SceneMaterials} from './SceneMaterials';
import {EnvironmentLighting} from './EnvironmentLighting';
import {LightShadows} from './LightShadows';
import {loadRenderBackend, RenderBackend} from '../../../rendering/backends';
import {ErrorBoundary} from '../../ErrorBoundary';
import nightEnvironment from '../assets/dikhololo_night_1k.hdr?url';

const DEFAULT_CAMERA = {
  position: [0, 7, -7] as THREE.Vector3Tuple,
  fov: 75,
};

function CenteredLoader(props: {progress?: number}) {
  const {progress} = props;
  return (
    <Stack
      spacing={1}
      sx={{height: '100%', justifyContent: 'center', alignItems: 'center'}}
    >
      <CircularProgress
        variant={progress === undefined ? 'indeterminate' : 'determinate'}
        value={progress}
      />
      {progress !== undefined && (
        <Typography variant="caption">{Math.round(progress)} %</Typography>
      )}
    </Stack>
  );
}

function ModelLoader() {
  const {progress} = useProgress();
  return <CenteredLoader progress={progress} />;
}

function useModelCamera(cameras: THREE.Camera[], cameraName?: string) {
  return useMemo(() => {
    const camera =
      cameras.find(camera => camera.name === cameraName) ?? cameras[0];
    if (!camera) return DEFAULT_CAMERA;

    camera.updateWorldMatrix(true, false);
    const position = camera.getWorldPosition(new THREE.Vector3()).toArray();
    return {...DEFAULT_CAMERA, position};
  }, [cameras, cameraName]);
}

type HouseSceneProps = {
  backend: RenderBackend;
  model: string;
};

function HouseScene(props: HouseSceneProps) {
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
      flat
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
      </PerformanceMonitor>
    </Canvas>
  );
}

export default function House() {
  const {configuration, setConfiguration, webGLSupported} = useAppContext();
  const {houseConfig} = useHouseContext();
  const model = houseConfig?.house.model;
  const [backend, setBackend] = useState<RenderBackend | null>(null);
  const wantedKind = configuration.webGPU ? 'webgpu' : 'webgl';

  // Le code propre à WebGL / WebGPU n'est téléchargé que s'il est utilisé.
  useEffect(() => {
    let cancelled = false;
    loadRenderBackend(configuration.webGPU).then(loaded => {
      if (!cancelled) setBackend(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [configuration.webGPU]);

  if (!webGLSupported || !model) {
    return (
      <Stack
        sx={{height: '100%', justifyContent: 'center', alignItems: 'center'}}
      >
        <Alert severity="warning" variant="filled">
          {model
            ? 'Cet appareil ne supporte pas WebGL.'
            : 'Aucun modèle 3D dans cette configuration.'}
        </Alert>
      </Stack>
    );
  }

  if (backend?.kind !== wantedKind) return <CenteredLoader />;

  return (
    <Stack sx={{position: 'relative', height: '100%', width: '100%'}}>
      <ErrorBoundary
        resetKey={`${houseConfig?.id}-${backend.kind}`}
        onError={() => {
          if (backend.kind === 'webgpu') {
            setConfiguration(prev => ({...prev, webGPU: false}));
          }
        }}
        fallback={
          <Stack
            sx={{
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Alert severity="error" variant="filled">
              Impossible d&apos;afficher la vue 3D.
            </Alert>
          </Stack>
        }
      >
        <Suspense fallback={<ModelLoader />}>
          <HouseScene backend={backend} model={model} />
        </Suspense>
      </ErrorBoundary>
    </Stack>
  );
}
