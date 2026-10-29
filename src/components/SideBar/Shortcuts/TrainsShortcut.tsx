import TrainIcon from '@mui/icons-material/TrainRounded';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {useState} from 'react';
import type {TrainsShortcutConfigType} from '../../../configs/sidebar';
import {useTrainDepartures} from '../../../hooks/useTrainDepartures';
import {departureStatus, formatTime} from '../../../utils/trains';
import {TrainsModal} from '../../Modal/TrainsModal';
import {TrainView} from '../../Modal/TrainsModal/TrainView';
import {ShortcutCard} from './ShortcutCard';

type TrainsShortcutProps = {
  id: string;
  shortcutConfig: TrainsShortcutConfigType;
};

export function TrainsShortcut(props: TrainsShortcutProps) {
  const {id, shortcutConfig} = props;
  const [open, setOpen] = useState(false);
  const departures = useTrainDepartures(shortcutConfig.prefix);
  const [next, ...following] = departures.slice(0, 3);

  return (
    <>
      <ShortcutCard
        id={id}
        icon={<TrainIcon />}
        label={shortcutConfig.label}
        onClick={() => setOpen(true)}
      >
        {next ? (
          <Stack spacing={0.5}>
            <Stack direction="row" spacing={1} sx={{alignItems: 'baseline'}}>
              <Typography
                variant="h4"
                component={next.cancelled ? 's' : 'span'}
              >
                {formatTime(next.scheduled)}
              </Typography>
              <Typography
                component="span"
                noWrap
                sx={{flex: 1, color: departureStatus(next).color}}
              >
                {departureStatus(next).label}
              </Typography>
              {next.platform && (
                <Typography variant="subtitle2" component="span">
                  Voie {next.platform}
                </Typography>
              )}
            </Stack>
            <Stack direction="row" spacing={2}>
              {following.map(departure => {
                const status = departureStatus(departure);
                return (
                  <Typography
                    key={departure.entityId}
                    variant="body2"
                    component="span"
                    noWrap
                  >
                    <Box component={departure.cancelled ? 's' : 'span'}>
                      {formatTime(departure.scheduled)}
                    </Box>
                    <Box component="span" sx={{ml: 0.75, color: status.color}}>
                      {status.label}
                    </Box>
                  </Typography>
                );
              })}
            </Stack>
          </Stack>
        ) : (
          <Typography component="span" sx={{color: 'text.secondary'}}>
            Aucun départ
          </Typography>
        )}
        {/* Pleine largeur, posée sur le bord bas de la carte. */}
        <Box sx={{mt: 'auto', mx: -1.5, mb: -1.5}}>
          <TrainView height={60} />
        </Box>
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
