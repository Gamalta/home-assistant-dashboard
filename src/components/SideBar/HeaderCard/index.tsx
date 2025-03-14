import Stack from '@mui/material/Stack';
import {motion} from 'framer-motion';
import {DateTime} from './DateTime';
import {WeatherDisplay} from './WeatherDisplay';
import {EntityName, FilterByDomain} from '@hakit/core';

type HeaderCardProps = {
  weather?: FilterByDomain<EntityName, 'weather'>;
};

export function HeaderCard(props: HeaderCardProps) {
  const {weather} = props;

  return (
    <Stack
      component={motion.header}
      direction="row"
      p={2}
      bgcolor="background.paper"
      borderRadius={2}
      justifyContent="space-between"
    >
      <DateTime />
      {weather && <WeatherDisplay weather={weather} />}
    </Stack>
  );
}
