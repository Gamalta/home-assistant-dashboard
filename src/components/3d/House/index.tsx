import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import {Suspense, useEffect, useState} from 'react';
import {useGLTF} from '@react-three/drei';
import {useLoader} from '@react-three/fiber';
import * as THREE from 'three';
import {useHouseContext} from '../../../contexts/HouseContext';
import {useAppContext} from '../../../contexts/AppContext';
import {loadRenderBackend, RenderBackend} from '../../../rendering/backends';
import {ErrorBoundary} from '../../ErrorBoundary';
import {ModelLoader} from './ModelLoader';
import {HouseScene} from './HouseScene';
import {LightingTrial} from '../../LightingTrial';

type HouseProps = {
  // Pièce cadrée par la caméra ; seules ses étiquettes s'affichent.
  focusRoomId?: string;
  paused?: boolean;
};

// Derrière la maison, un cran plus sombre que l'interface, selon le thème et
// non l'heure : la maison, blanche, s'en détache.
const sceneBackground = (center: string, middle: string, edge: string) =>
  `radial-gradient(ellipse at 50% 45%, ${center} 0%, ${middle} 55%, ${edge} 100%)`;
const SCENE_BACKGROUND = {
  light: sceneBackground('#E9E9EE', '#DCDCE2', '#CDCDD5'),
  dark: sceneBackground('#232325', '#1C1C1E', '#121213'),
};

export default function House(props: HouseProps) {
  const {focusRoomId, paused} = props;
  const {configuration, setConfiguration, webGLSupported, lightingTrial} =
    useAppContext();
  const {houseConfig} = useHouseContext();
  const model = houseConfig?.house.model;
  const lightMaps = houseConfig?.house.lightMaps;
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

  // Hors du rendu : sinon useGLTF met à jour ModelLoader pendant le rendu de HouseScene.
  // Les cartes de lumière se téléchargent en même temps que le modèle.
  useEffect(() => {
    if (model) useGLTF.preload(model);
    if (lightMaps) {
      useLoader.preload(THREE.TextureLoader, [lightMaps.sky, lightMaps.sun]);
    }
  }, [model, lightMaps]);

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

  if (backend?.kind !== wantedKind) return <ModelLoader />;

  return (
    <Stack
      sx={theme => ({
        position: 'relative',
        height: '100%',
        width: '100%',
        background: SCENE_BACKGROUND.light,
        ...theme.applyStyles('dark', {background: SCENE_BACKGROUND.dark}),
      })}
    >
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
          <HouseScene
            key={`${houseConfig?.id}-${backend.kind}`}
            backend={backend}
            model={model}
            focusRoomId={focusRoomId}
            paused={paused}
          />
        </Suspense>
        {lightingTrial && <LightingTrial />}
      </ErrorBoundary>
    </Stack>
  );
}
