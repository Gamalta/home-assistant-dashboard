import Stack from '@mui/material/Stack';
import {IrisIcon} from './components/Icons/IrisIcon';
import {ButtonCard} from '@hakit/components';
import {LightGroupCard} from './components/Light/lightGroupCard';

export default function Dashboard() {
  return (
    <Stack gap={2} p={2} direction={{xs: 'column', sm: 'row'}}>
      <LightGroupCard
        entityGroup="light.sejour"
        entities={['light.hue_iris', 'light.salon']}
        icon={<IrisIcon />}
      />
      <LightGroupCard
        entityGroup="light.cuisine"
        entities={['light.hue_play_1']}
        icon={<IrisIcon />}
      />
      <ButtonCard entity="light.sejour" />
    </Stack>
  );
}
