import {useEntities} from '@hakit/core';
import TrainIcon from '@mui/icons-material/TrainRounded';
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
  const next = departures[0];

  return (
    <>
      <ShortcutCard
        id={id}
        icon={<TrainIcon />}
        label={shortcutConfig.label}
        onClick={() => setOpen(true)}
      >
        <Typography
          component="span"
          sx={{color: next ? departureStatus(next).color : 'text.secondary'}}
        >
          {next
            ? `${formatTime(next.scheduled)} · ${departureStatus(next).label}`
            : 'Aucun départ'}
        </Typography>
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
