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

  const sideBarRef = useRef<HTMLDivElement | null>(null);

  return (
    <Stack
      ref={sideBarRef}
      direction="column"
      spacing={2}
      sx={{
        position: 'relative',
        height: '100%',
        overflow: 'hidden',
        bgcolor: 'background.primary',
        p: theme => theme.spacing(4, 0, 4, 2),
      }}
    >
      <HeaderCard weather={sideBarConfig?.weatherEntityId} />
      <Stack
        spacing={2}
        sx={{p: 2, bgcolor: 'background.paper', borderRadius: 2}}
      >
        {sideBarConfig?.persons && (
          <Stack direction="row" spacing={2}>
            <PersonCard person={sideBarConfig.persons?.[0]} />
            <PersonCard person={sideBarConfig.persons?.[1]} />
          </Stack>
        )}
        <PetCard pets={sideBarConfig?.pets} />
      </Stack>
      <Stack
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 2,
          width: '100%',
          height: '100%',
        }}
      />
      <SideBarDock sideBarRef={sideBarRef} />
    </Stack>
  );
}
