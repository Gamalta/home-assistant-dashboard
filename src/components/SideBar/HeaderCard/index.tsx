import Stack from '@mui/material/Stack';
import {motion} from 'framer-motion';
import {DateTime} from './DateTime';
import {WeatherDisplay} from './WeatherDisplay';
import {AlertBadge} from './AlertBadge';
import {AllLightsOffAction} from './AllLightsOffAction';
import {EntityName, FilterByDomain} from '@hakit/core';
import type {
  ActionConfigType,
  AlertsConfigType,
} from '../../../configs/sidebar';

type HeaderCardProps = {
  weather?: FilterByDomain<EntityName, 'weather'>;
  alerts?: AlertsConfigType;
  actions?: ActionConfigType[];
};

export function HeaderCard(props: HeaderCardProps) {
  const {weather, alerts, actions = []} = props;

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
      <DateTime>
        {actions.map((action, index) => {
          const id = `layoutid-action-${index}`;
          switch (action.type) {
            case 'allLightsOff':
              return (
                <AllLightsOffAction key={id} id={id} actionConfig={action} />
              );
          }
        })}
      </DateTime>
      {alerts && <AlertBadge config={alerts} />}
      {weather && <WeatherDisplay weather={weather} />}
    </Stack>
  );
}
