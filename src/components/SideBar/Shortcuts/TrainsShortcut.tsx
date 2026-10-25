import {useEntities} from '@hakit/core';
import TrainIcon from '@mui/icons-material/TrainRounded';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {useEffect, useState} from 'react';
import type {TrainsShortcutConfigType} from '../../../configs/sidebar';
import {
  departureStatus,
  formatTime,
  trainEntityIds,
  upcomingDepartures,
} from '../../../utils/trains';
import {TrainsModal} from '../../Modal/TrainsModal';
import {ShortcutCard} from './ShortcutCard';

type TrainsShortcutProps = {
  id: string;
  shortcutConfig: TrainsShortcutConfigType;
};

export function TrainsShortcut(props: TrainsShortcutProps) {
  const {id, shortcutConfig} = props;
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    // Un train parti disparaît sans attendre la mise à jour du capteur.
    const interval = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const trains = useEntities(trainEntityIds(shortcutConfig.prefix), {
    returnNullIfNotFound: true,
    historyOptions: {disable: true},
  });
  const departures = upcomingDepartures(trains, now);

  return (
    <>
      <ShortcutCard
        id={id}
        icon={<TrainIcon />}
        label={shortcutConfig.label}
        onClick={() => setOpen(true)}
      >
        {departures.length ? (
          <Stack spacing={0.5}>
            {departures.slice(0, 3).map(departure => {
              const status = departureStatus(departure);
              return (
                <Stack
                  key={departure.entityId}
                  direction="row"
                  spacing={1.5}
                  sx={{alignItems: 'baseline'}}
                >
                  <Typography
                    variant="h6"
                    component={departure.cancelled ? 's' : 'span'}
                  >
                    {formatTime(departure.scheduled)}
                  </Typography>
                  <Typography
                    component="span"
                    noWrap
                    sx={{flex: 1, color: status.color}}
                  >
                    {status.label}
                  </Typography>
                  {departure.platform && (
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{color: 'text.secondary'}}
                    >
                      Voie {departure.platform}
                    </Typography>
                  )}
                </Stack>
              );
            })}
          </Stack>
        ) : (
          <Typography component="span" sx={{color: 'text.secondary'}}>
            Aucun départ
          </Typography>
        )}
      </ShortcutCard>
      <TrainsModal
        id={id}
        open={open}
        onClose={() => setOpen(false)}
        title={shortcutConfig.label}
        departures={departures}
      />
    </>
  );
}
