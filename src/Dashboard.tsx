import Stack from '@mui/material/Stack';
import {Header} from './components/Header';
import {House} from './components/House';
import {HouseProvider} from './contexts/HouseContext';
import {useRef} from 'react';
import {FloatingActionProvider} from './contexts/FloatingAction';

export default function Dashboard() {
  const HouseContainerRef = useRef<HTMLDivElement>(null);
  return (
    <HouseProvider>
      <Stack direction="row" height="100vh">
        <Stack
          direction="column"
          width="30%"
          height="100%"
          bgcolor="background.paper"
        >
          <Header />
        </Stack>
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
