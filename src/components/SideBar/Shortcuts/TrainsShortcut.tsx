import TrainIcon from '@mui/icons-material/TrainRounded';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {useState} from 'react';
import type {TrainsShortcutConfigType} from '../../../configs/sidebar';
import {useTrainDepartures} from '../../../hooks/useTrainDepartures';
import {TrainDepartureDisplay} from '../../display/TrainDepartureDisplay';
import {TrainsModal} from '../../Modal/TrainsModal';
import {ShortcutCard} from './ShortcutCard';

type TrainsShortcutProps = {
  id: string;
  shortcutConfig: TrainsShortcutConfigType;
};

export function TrainsShortcut(props: TrainsShortcutProps) {
  const {id, shortcutConfig} = props;
  const [open, setOpen] = useState(false);
  const departures = useTrainDepartures(shortcutConfig.prefix);

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
            {departures.slice(0, 3).map(departure => (
              <TrainDepartureDisplay
                key={departure.entityId}
                departure={departure}
              />
            ))}
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
