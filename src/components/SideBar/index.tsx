import Stack from '@mui/material/Stack';
import {HeaderCard} from './HeaderCard';
import {SideBarConfig} from '../House/config';

export function SideBar() {
  const siderBarConfig = SideBarConfig;
  return (
    <Stack
      direction="column"
      width="30%"
      height="100%"
      spacing={2}
      p={theme => theme.spacing(4, 2)}
    >
      <HeaderCard weather={siderBarConfig.weather} />
    </Stack>
  );
}
