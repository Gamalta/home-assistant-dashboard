import Stack from '@mui/material/Stack';
import {DateTime} from './DateTime';
import {WeatherDisplay} from './WeatherDisplay';

export function HeaderCard() {
  return (
    <Stack
      component="header"
      direction="row"
      p={2}
      bgcolor="background.paper"
      borderRadius={2}
      justifyContent="space-between"
    >
      <DateTime />
      <WeatherDisplay />
    </Stack>
  );
}
