import Stack from '@mui/material/Stack';
import {House} from './components/House';
import {HouseProvider} from './contexts/HouseContext';
import {SideBar} from './components/SideBar';
import {
  Group,
  Panel,
  Separator,
  useDefaultLayout,
} from 'react-resizable-panels';
import { useState } from 'react';
import { useEffect } from 'react';

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
        <Separator style={{outline: 0}} onPointerDown={() => setIsDragging(true)}>
          <Stack
            height="100vh"
            width="26px"
            display="flex"
            justifyContent="center"
            bgcolor="background.primary"
            sx={{
              '&:hover': {div: {height: '10%'}},
            }}
            borderRadius="0 16px 16px 0"
          >
            <Stack
              bgcolor={isDragging ? 'cyan' : 'grey'}
              width="5px"
              m="0 0 0 16px"
              height={isDragging ? '10%' : '5%'}
              borderRadius="50px"
              sx={{transition: '500ms', opacity: isDragging ? 0.5 : 1}}
            />
          </Stack>
        </Separator>
        <Panel defaultSize="70%">
          <House />
        </Panel>
      </Group>
    </HouseProvider>
  );
}
