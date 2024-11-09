import Stack from '@mui/material/Stack';
import {House} from './components/House';
import {HouseProvider} from './contexts/HouseContext';
import {useState} from 'react';
import {SideBar} from './components/SideBar';
import {Panel, PanelGroup, PanelResizeHandle} from 'react-resizable-panels';

export default function Dashboard() {
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
        </PanelResizeHandle>
        <Panel defaultSize={70}>
          <House />
        </Panel>
      </PanelGroup>
    </HouseProvider>
  );
}
