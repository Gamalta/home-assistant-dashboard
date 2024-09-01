import Stack from '@mui/material/Stack';
import {DateTime} from './DateTime';
import {WeatherDisplay} from './WeatherDisplay';
import {SideBarConfig} from '../../House/config';

type HeaderCardProps = {
  weather: SideBarConfig['weather'];
};

export function HeaderCard(props: HeaderCardProps) {
  const {weather} = props;
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
      <WeatherDisplay weather={weather} />
    </Stack>
  );
}
