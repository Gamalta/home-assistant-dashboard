import Stack from '@mui/material/Stack';
import {HeaderCard} from './HeaderCard';
import {SideBarConfig} from '../House/config';
import {PersonCard} from './PersonCard';
import {PetCard} from './PetCard';

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
      <Stack spacing={2} p={2} bgcolor="background.paper" borderRadius={2}>
        <Stack direction="row" spacing={2}>
          <PersonCard person={siderBarConfig.persons[0]} />
          <PersonCard person={siderBarConfig.persons[1]} />
        </Stack>
        <PetCard />
      </Stack>
    </Stack>
  );
}
