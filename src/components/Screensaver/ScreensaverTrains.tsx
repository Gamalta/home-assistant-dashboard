import TrainIcon from '@mui/icons-material/TrainRounded';
import Typography from '@mui/material/Typography';
import type {TrainsShortcutConfigType} from '../../configs/sidebar';
import {useTrainDepartures} from '../../hooks/useTrainDepartures';
import {TrainDepartureDisplay} from '../display/TrainDepartureDisplay';
import {TrainView} from '../display/TrainView';
import {ScreensaverCard} from './ScreensaverCard';

type ScreensaverTrainsProps = {
  trains: TrainsShortcutConfigType;
};

export function ScreensaverTrains(props: ScreensaverTrainsProps) {
  const {trains} = props;
  const departures = useTrainDepartures(trains.prefix);

  return (
    <ScreensaverCard icon={<TrainIcon />} title={trains.label}>
      <TrainView height={56} />
      {departures.length ? (
        departures
          .slice(0, 3)
          .map(departure => (
            <TrainDepartureDisplay
              key={departure.entityId}
              departure={departure}
            />
          ))
      ) : (
        <Typography color="textSecondary">Aucun départ</Typography>
      )}
    </ScreensaverCard>
  );
}
