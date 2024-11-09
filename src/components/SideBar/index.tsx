import Stack from '@mui/material/Stack';
import {HeaderCard} from './HeaderCard';
import {PersonCard} from './PersonCard';
import {PetCard} from './PetCard';
import {useRef} from 'react';
import {SideBarDock} from './SideBarDock';
import {useHouseContext} from '../../contexts/HouseContext';

export function SideBar() {
  const {config} = useHouseContext();
  const sideBarConfig = config?.sideBar;

  const sideBarRef = useRef<HTMLDivElement>(null);

  return (
    <Stack
      ref={sideBarRef}
      position="relative"
      direction="column"
      height="100%"
      spacing={2}
      overflow="hidden"
      bgcolor="background.primary"
      p={theme => theme.spacing(4, 0, 4, 2)}
    >
      <HeaderCard weather={sideBarConfig?.weather} />
      <Stack spacing={2} p={2} bgcolor="background.paper" borderRadius={2}>
        {sideBarConfig?.persons && (
          <Stack direction="row" spacing={2}>
            <PersonCard person={sideBarConfig.persons?.[0]} />
            <PersonCard person={sideBarConfig.persons?.[1]} />
          </Stack>
        )}
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
