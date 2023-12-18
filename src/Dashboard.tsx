import Stack from '@mui/material/Stack';
import {Light} from './components/Light';
import {IrisIcon} from './components/Icons/IrisIcon';
import {ButtonCard} from '@hakit/components';

export default function Dashboard() {
  return (
    <Stack gap={2} p={2} direction={{xs: 'column', sm: 'row'}}>
      <Light
        entityGroup="light.sejour"
        lights={['light.hue_iris', 'light.salon']}
        icon={<IrisIcon />}
      />
      <ButtonCard entity="light.sejour" />
    </Stack>
  );
}
