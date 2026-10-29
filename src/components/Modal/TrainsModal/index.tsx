import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {Modal, ModalProps} from '..';
import {
  departureStatus,
  formatTime,
  type TrainDeparture,
} from '../../../utils/trains';
import {TrainView} from './TrainView';

type TrainsModalProps = Omit<ModalProps, 'children'> & {
  departures: TrainDeparture[];
};

export function TrainsModal(props: TrainsModalProps) {
  const {departures, ...modalProps} = props;

  return (
    <Modal {...modalProps}>
      <TrainView height={72} />
      {departures.length ? (
        <Stack
          component="ul"
          spacing={1}
          sx={{mt: 2, mb: 0, p: 0, minWidth: 320, listStyle: 'none'}}
        >
          {departures.map(departure => {
            const status = departureStatus(departure);
            const details = [
              departure.train,
              departure.arrival && `arrivée ${formatTime(departure.arrival)}`,
            ].filter(Boolean);

            return (
              <Stack
                component="li"
                key={departure.entityId}
                direction="row"
                spacing={2}
                sx={{
                  alignItems: 'center',
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: 'background.tertiary',
                }}
              >
                <Typography
                  variant="h6"
                  component={departure.cancelled ? 's' : 'span'}
                  sx={{color: departure.cancelled ? 'text.secondary' : null}}
                >
                  {formatTime(departure.expected)}
                </Typography>
                <Stack sx={{flex: 1}}>
                  <Typography variant="body2" component="span">
                    {departure.delay > 0 && (
                      <Box component="s" sx={{mr: 1, color: 'text.secondary'}}>
                        {formatTime(departure.scheduled)}
                      </Box>
                    )}
                    <Box component="span" sx={{color: status.color}}>
                      {status.label}
                    </Box>
                  </Typography>
                  {details.length > 0 && (
                    <Typography
                      variant="caption"
                      component="span"
                      sx={{color: 'text.secondary'}}
                    >
                      {details.join(' · ')}
                    </Typography>
                  )}
                </Stack>
                {departure.platform && (
                  <Typography variant="subtitle2" component="span">
                    Voie {departure.platform}
                  </Typography>
                )}
              </Stack>
            );
          })}
        </Stack>
      ) : (
        <Typography sx={{mt: 2, color: 'text.secondary'}}>
          Aucun départ prévu.
        </Typography>
      )}
    </Modal>
  );
}
