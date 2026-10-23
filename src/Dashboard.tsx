import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import {HouseProvider, useHouseContext} from './contexts/HouseContext';
import {useAppContext} from './contexts/AppContext';
import {SideBar} from './components/SideBar';
import {
  Group,
  Panel,
  Separator,
  useDefaultLayout,
} from 'react-resizable-panels';
import {lazy, Suspense, useState} from 'react';
import {useEffect} from 'react';

// Chargée à la demande : three.js (~1 Mo) ne retarde pas l'affichage de la barre latérale.
const House3d = lazy(() => import('./components/3d/House'));

const centered = {
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
};

function Loader() {
  return (
    <Stack sx={centered}>
      <CircularProgress />
    </Stack>
  );
}

function HouseView() {
  const {webGLSupported, webGPUSupported} = useAppContext();
  const {houseConfig} = useHouseContext();
  const house = houseConfig?.house;

  if (!webGLSupported || !house?.model) {
    return (
      <Stack sx={centered}>
        <Alert severity="error" variant="filled">
          {house?.model
            ? 'Cet appareil ne supporte pas WebGL.'
            : 'Aucun modèle 3D dans cette configuration.'}
        </Alert>
      </Stack>
    );
  }

  // On attend la détection WebGPU pour ne pas créer le canvas deux fois.
  if (webGPUSupported === null) return <Loader />;

  return (
    <Suspense fallback={<Loader />}>
      <House3d />
    </Suspense>
  );
}

export default function Dashboard() {
  const [isDragging, setIsDragging] = useState(false);
  const {defaultLayout, onLayoutChanged} = useDefaultLayout({
    groupId: 'siderbar-main',
    storage: localStorage,
  });

  useEffect(() => {
    const handlePointerUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging]);

  return (
    <HouseProvider>
      <Group
        defaultLayout={defaultLayout}
        orientation="horizontal"
        onLayoutChanged={onLayoutChanged}
      >
        <Panel
          defaultSize="30%"
          minSize="10%"
          maxSize="30%"
          collapsedSize="5%"
          collapsible
        >
          <SideBar />
        </Panel>
        <Separator
          style={{outline: 0}}
          onPointerDown={() => setIsDragging(true)}
        >
          <Stack
            sx={{
              display: 'flex',
              justifyContent: 'center',
              height: '100vh',
              width: '26px',
              bgcolor: 'background.primary',
              borderRadius: '0 16px 16px 0',
              '&:hover': {div: {height: '10%'}},
            }}
          >
            <Stack
              sx={{
                height: isDragging ? '10%' : '5%',
                width: '5px',
                bgcolor: isDragging ? 'cyan' : 'grey',
                borderRadius: '50px',
                margin: '0 0 0 16px',
                transition: '500ms',
                opacity: isDragging ? 0.5 : 1,
              }}
            />
          </Stack>
        </Separator>
        <Panel defaultSize="70%">
          <HouseView />
        </Panel>
      </Group>
    </HouseProvider>
  );
}
