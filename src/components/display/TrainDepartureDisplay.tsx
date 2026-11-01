import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  departureStatus,
  formatTime,
  type TrainDeparture,
} from '../../utils/trains';

type TrainDepartureDisplayProps = {
  departure: TrainDeparture;
};

export function TrainDepartureDisplay(props: TrainDepartureDisplayProps) {
  const {departure} = props;
  const status = departureStatus(departure);

  return (
    <Stack direction="row" spacing={1.5} sx={{alignItems: 'baseline'}}>
      <Typography variant="h6" component={departure.cancelled ? 's' : 'span'}>
        {formatTime(departure.scheduled)}
      </Typography>
      <Typography component="span" noWrap sx={{flex: 1, color: status.color}}>
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
}
