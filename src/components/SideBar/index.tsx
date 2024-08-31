import Stack from '@mui/material/Stack';
import {HeaderCard} from './HeaderCard';
import {WeatherCard} from '@hakit/components';

export function SideBar() {
  return (
    <Stack
      direction="column"
      width="30%"
      height="100%"
      spacing={2}
      p={theme => theme.spacing(4, 2)}
    >
      <HeaderCard />
      <WeatherCard entity="weather.weather" />
    </Stack>
  );
}
