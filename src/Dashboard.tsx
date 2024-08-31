import Stack from '@mui/material/Stack';
import {House} from './components/House';
import {HouseProvider} from './contexts/HouseContext';
import {useRef} from 'react';
import {FloatingActionProvider} from './contexts/FloatingAction';
import {SideBar} from './components/SideBar';

export default function Dashboard() {
  const HouseContainerRef = useRef<HTMLDivElement>(null);
  return (
    <HouseProvider>
      <Stack direction="row" height="100vh">
        <SideBar />
        <FloatingActionProvider containerRef={HouseContainerRef}>
          <Stack
            ref={HouseContainerRef}
            position="relative"
            width="70%"
            height="100%"
          >
            <House />
          </Stack>
        </FloatingActionProvider>
        {/*<LightGroupCard
          entityGroup="light.sejour"
          entities={['light.hue_iris', 'light.salon']}
          icon={<IrisIcon />}
          />
          <LightGroupCard
          entityGroup="light.cuisine"
          entities={['light.hue_play_1']}
          icon={<IrisIcon />}
          />
        <ButtonCard entity="light.sejour" /> */}
      </Stack>
    </HouseProvider>
  );
}
