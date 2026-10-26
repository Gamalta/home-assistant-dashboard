import Stack from '@mui/material/Stack';
import {motion} from 'framer-motion';
import {DateTime} from './DateTime';
import {WeatherDisplay} from './WeatherDisplay';
import {AlertBadge} from './AlertBadge';
import {EntityName, FilterByDomain} from '@hakit/core';
import {AlertsConfigType} from '../../../configs/sidebar';

type HeaderCardProps = {
  weather?: FilterByDomain<EntityName, 'weather'>;
  alerts?: AlertsConfigType;
};

export function HeaderCard(props: HeaderCardProps) {
  const {weather, alerts} = props;

  return (
    <Stack
      component={motion.header}
      direction="row"
      sx={{
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 2,
        justifyContent: 'space-between',
        position: 'relative',
      }}
    >
      <DateTime />
      {alerts && <AlertBadge config={alerts} />}
      {weather && <WeatherDisplay weather={weather} />}
    </Stack>
  );
}
