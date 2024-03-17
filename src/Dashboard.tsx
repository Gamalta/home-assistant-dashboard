import Stack from '@mui/material/Stack';
import {Header} from './components/Header';
import {House} from './components/3d/House';

export default function Dashboard() {
  return (
    <Stack direction="row" height="100vh">
      <Stack
        direction="column"
        width="30%"
        height="100%"
        bgcolor="background.paper"
      >
        <Header />
      </Stack>
      <Stack position="relative" width="70%" height="100%">
        <House />
      </Stack>
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
  );
}
