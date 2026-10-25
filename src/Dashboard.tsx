import Stack from '@mui/material/Stack';
import House from './components/3d/House';
import {HouseProvider} from './contexts/HouseContext';
import {SideBar} from './components/SideBar';
import {ScenarioBar} from './components/ScenarioBar';
import {
  Group,
  Panel,
  Separator,
  useDefaultLayout,
} from 'react-resizable-panels';
import {useState} from 'react';
import {useEffect} from 'react';
import {useIsMobile} from './hooks/useIsMobile';
import {MobileDashboard} from './components/Mobile';

export default function Dashboard() {
  const mobile = useIsMobile();
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

  if (mobile) {
    return (
      <HouseProvider>
        <MobileDashboard />
      </HouseProvider>
    );
  }

  return (
    <HouseProvider>
      <Group
        defaultLayout={defaultLayout}
        orientation="horizontal"
        onLayoutChanged={onLayoutChanged}
        style={{height: '100vh'}}
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
        <Panel defaultSize="70%" style={{position: 'relative'}}>
          <House />
          <ScenarioBar />
        </Panel>
      </Group>
    </HouseProvider>
  );
}
