import Fab from '@mui/material/Fab';
import Stack from '@mui/material/Stack';
import {ButtonCard} from '@hakit/components';
import {ThermostatIcon} from '../Icons/ThermostatIcon';
import {PendantRoundIcon} from '../Icons/PendantRoundIcon';
import {DateTime} from './DateTime';

export function Header() {
  // TODO: Add an icon for displaying the current weather
  // TODO: Add a display for the outside temperature
  // TODO: Add a display for the house temperature
  return (
    <Stack
      component="header"
      mx={5}
      py={3}
      borderBottom="1px solid"
      sx={{borderBottomColor: 'text.secondary'}}
    >
      <DateTime />
      <Stack justifyContent="space-evenly" direction="row">
        <Fab variant="extended">
          <ThermostatIcon />
          20.1°C
        </Fab>
        <Fab variant="extended">
          <PendantRoundIcon />
        </Fab>
        <Fab variant="extended">
          <PendantRoundIcon />
        </Fab>
        <Fab variant="extended">
          <PendantRoundIcon />
        </Fab>
      </Stack>
      <ButtonCard entity="light.salon_main" />
    </Stack>
  );
}
