import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import {Canvas} from '@react-three/fiber';
import {Suspense, useEffect, useMemo, useState} from 'react';
import {
  Environment,
  GizmoHelper,
  GizmoViewport,
  PerformanceMonitor,
  Stats,
  useGLTF,
  useProgress,
} from '@react-three/drei';
import * as THREE from 'three';
import {useHouseContext} from '../../../contexts/HouseContext';
import type {Position3dType} from '../../../configs/house';
import {useAppContext} from '../../../contexts/AppContext';
import {Scene} from './Scene';
import {AmbientLight} from './AmbientLight';
import {Camera} from '../Camera';
import {Room3d} from './Room3d';
import {SceneMaterials} from './SceneMaterials';
import {loadRenderBackend, RenderBackend} from '../backends';
import {ErrorBoundary} from '../../ErrorBoundary';
// Servi avec l'application : pas de dépendance à un CDN au démarrage.
import nightEnvironment from '../assets/dikhololo_night_1k.hdr?url';

const DEFAULT_CAMERA = {
  position: [0, 7, -7] as THREE.Vector3Tuple,
  target: [0, 0, 0] as THREE.Vector3Tuple,
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

/**
 * Position initiale : celle de la caméra du modèle (son orientation n'est pas
 * utilisée, la vue est pilotée par OrbitControls). Cible : `cameraTarget` de
 * la configuration, sinon l'origine.
 */
function useModelCamera(
  cameras: THREE.Camera[],
  cameraName?: string,
  cameraTarget?: Position3dType,
) {
  return useMemo(() => {
    const camera =
      cameras.find(camera => camera.name === cameraName) ?? cameras[0];
    const target: THREE.Vector3Tuple = cameraTarget
      ? [cameraTarget.x, cameraTarget.y, cameraTarget.z]
      : DEFAULT_CAMERA.target;
    if (!camera) return {...DEFAULT_CAMERA, target};

    camera.updateWorldMatrix(true, false);
    const position = camera.getWorldPosition(new THREE.Vector3()).toArray();
    return {...DEFAULT_CAMERA, position, target};
  }, [cameras, cameraName, cameraTarget]);
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
  const camera = useModelCamera(
    cameras,
    houseConfig?.house.camera,
    houseConfig?.house.cameraTarget,
  );
  const rooms = houseConfig?.house.rooms ?? [];

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
        <Camera target={camera.target} />
        <Scene scene={scene} backend={backend} />
        <SceneMaterials
          scene={scene}
          backend={backend}
          hideWalls={configuration.hideWallsShader}
          heatmap={configuration.heatmapShader}
          rooms={rooms}
        />
        <AmbientLight />
        {rooms.map(room => (
          <Room3d key={room.id} room={room} />
        ))}
        <Environment files={nightEnvironment} resolution={128} />
      </PerformanceMonitor>
    </Canvas>
  );
}

export default function House() {
  const {configuration, setConfiguration} = useAppContext();
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

  if (!model) {
    return (
      <Stack
        sx={{height: '100%', justifyContent: 'center', alignItems: 'center'}}
      >
        <Alert severity="warning" variant="filled">
          Aucun modèle 3D dans cette configuration.
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
          // WebGPU peut échouer à l'initialisation : on retente en WebGL.
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
