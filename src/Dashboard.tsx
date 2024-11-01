import Stack from '@mui/material/Stack';
import {House} from './components/House';
import {HouseProvider} from './contexts/HouseContext';
import {useRef, useState} from 'react';
import {FloatingActionProvider} from './contexts/FloatingAction';
import {SideBar} from './components/SideBar';
import {Panel, PanelGroup, PanelResizeHandle} from 'react-resizable-panels';

export default function Dashboard() {
  const HouseContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  return (
    <HouseProvider>
      <PanelGroup autoSaveId="siderbar-main" direction="horizontal">
        <Panel
          defaultSize={30}
          minSize={10}
          maxSize={30}
          collapsedSize={5}
          collapsible
        >
          <SideBar />
        </Panel>
        <PanelResizeHandle onDragging={setIsDragging}>
          <Stack
            height="100vh"
            width="10px"
            display="flex"
            justifyContent="center"
            sx={{
              '&:hover': {div: {height: '10%'}},
            }}
          >
            <Stack
              bgcolor={isDragging ? 'cyan' : 'grey'}
              width="5px"
              height={isDragging ? '10%' : '5%'}
              borderRadius="50px"
              sx={{transition: '500ms', opacity: isDragging ? 0.5 : 1}}
            />
          </Stack>
        </PanelResizeHandle>
        <Panel defaultSize={70}>
          <FloatingActionProvider containerRef={HouseContainerRef}>
            <Stack ref={HouseContainerRef} position="relative" height="100%">
              <House />
            </Stack>
          </FloatingActionProvider>
        </Panel>
      </PanelGroup>
    </HouseProvider>
  );
}
