import Stack from '@mui/material/Stack';
import {HeaderCard} from './HeaderCard';
import {SideBarConfig} from '../House/config';
import {PersonCard} from './PersonCard';
import {PetCard} from './PetCard';
import {useRef} from 'react';
import {SideBarDock} from './SideBarDock';

export function SideBar() {
  const sideBarConfig = SideBarConfig;

  const sideBarRef = useRef<HTMLDivElement>(null);

  return (
    <Stack
      ref={sideBarRef}
      position="relative"
      direction="column"
      width="30%"
      height="100%"
      spacing={2}
      overflow="hidden"
      p={theme => theme.spacing(4, 2)}
    >
      <HeaderCard weather={sideBarConfig.weather} />
      <Stack spacing={2} p={2} bgcolor="background.paper" borderRadius={2}>
        <Stack direction="row" spacing={2}>
          <PersonCard person={sideBarConfig.persons?.[0]} />
          <PersonCard person={sideBarConfig.persons?.[1]} />
        </Stack>
        <PetCard />
      </Stack>
      <Stack
        p={2}
        bgcolor="background.paper"
        borderRadius={2}
        width="100%"
        height="100%"
      />
      <SideBarDock sideBarRef={sideBarRef} />
    </Stack>
  );
}
