import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import {Suspense, useEffect, useState} from 'react';
import {useGLTF} from '@react-three/drei';
import {useHouseContext} from '../../../contexts/HouseContext';
import {useAppContext} from '../../../contexts/AppContext';
import {loadRenderBackend, RenderBackend} from '../../../rendering/backends';
import {ErrorBoundary} from '../../ErrorBoundary';
import {ModelLoader} from './ModelLoader';
import {HouseScene} from './HouseScene';
import {LabelFilter} from './LabelFilter';
import {LightingTrial} from '../../LightingTrial';

export default function House() {
  const {configuration, setConfiguration, webGLSupported, lightingTrial} =
    useAppContext();
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

  // Hors du rendu : sinon useGLTF met à jour ModelLoader pendant le rendu de HouseScene.
  useEffect(() => {
    if (model) useGLTF.preload(model);
  }, [model]);

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
          <HouseScene
            key={`${houseConfig?.id}-${backend.kind}`}
            backend={backend}
            model={model}
          />
        </Suspense>
        <LabelFilter rooms={houseConfig?.house.rooms ?? []} />
        {lightingTrial && <LightingTrial />}
      </ErrorBoundary>
    </Stack>
  );
}
