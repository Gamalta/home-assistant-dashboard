import {useEntity} from '@hakit/core';
import {HouseConfig} from '../config';
import {useLongPress} from '../../../hooks/useLongPress';
import {useRoomContext} from '../../../contexts/RoomContext';
import {motion} from 'framer-motion';
import Fab from '@mui/material/Fab';
import {ThermostatIcon} from '../../Icons/ThermostatIcon';
import {TemperatureModal} from '../../Modal/Type/TemperatureModal';

type RoomTemperature = {
  id: string;
  room: (typeof HouseConfig)['rooms'][0];
};

export function RoomTemperature(props: RoomTemperature) {
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

  if (!temperature) return;

  return (
    <>
      <motion.div layoutId={`${id}-temp`}>
        <Fab size="small" variant="extended" {...tempLongPress}>
          <ThermostatIcon />
          {`${temperature.state}°C`}
        </Fab>
      </motion.div>
      <TemperatureModal
        id={`${id}-temp`}
        open={tempModalOpen}
        onClose={() => setTempModalOpen(false)}
        temperatureEntity={temperature}
        humidityEntity={humidity ?? undefined}
        title={`Température ${room.name}`}
      />
    </>
  );
}
