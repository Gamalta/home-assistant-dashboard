import {UNKNOWN, useEntity} from '@hakit/core';
import {HouseConfig} from '../config';
import {useLongPress} from '../../../hooks/useLongPress';
import {useRoomContext} from '../../../contexts/RoomContext';
import {motion} from 'framer-motion';
import {TemperatureModal} from '../../Modal/Type/TemperatureModal';
import Button from '@mui/material/Button';

type RoomActionTemperature = {
  id: string;
  room: (typeof HouseConfig)['rooms'][0];
};

export function RoomActionTemperature(props: RoomActionTemperature) {
  const {id, room} = props;
  const {tempModalOpen, setTempModalOpen} = useRoomContext();

  const tempLongPress = useLongPress(
    () => setTempModalOpen(true),
    () => setTempModalOpen(true)
  );

  const temperature = useEntity(room.temperature?.entity ?? 'unknown', {
    returnNullIfNotFound: true,
    historyOptions: {
      disable: false,
      hoursToShow: 24,
    },
  });
  const humidity = useEntity(room.temperature?.humidity ?? 'unknown', {
    returnNullIfNotFound: true,
    historyOptions: {
      disable: false,
      hoursToShow: 24,
    },
  });

  const battery = useEntity(room.temperature?.battery ?? 'unknown', {
    returnNullIfNotFound: true,
  });

  const signal = useEntity(room.temperature?.signal ?? 'unknown', {
    returnNullIfNotFound: true,
  });

  if (!temperature) return;

  return (
    <>
      <motion.div layoutId={`${id}-temp`}>
        <Button
          variant="text"
          sx={{
            minWidth: 0,
            bgcolor: 'transparent',
            color: 'text.secondary',
          }}
          {...tempLongPress}
        >
          {`${
            temperature.state === UNKNOWN
              ? '-'
              : Math.floor(Number(temperature.state))
          }°`}
        </Button>
      </motion.div>
      <TemperatureModal
        id={`${id}-temp`}
        open={tempModalOpen}
        onClose={() => setTempModalOpen(false)}
        temperatureEntity={temperature}
        humidityEntity={humidity ?? undefined}
        batteryEntity={battery ?? undefined}
        signalEntity={signal ?? undefined}
        title={`Thermomètre ${room.name}`}
      />
    </>
  );
}
