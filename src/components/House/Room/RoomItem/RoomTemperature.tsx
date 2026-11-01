import {UNKNOWN, useEntity} from '@hakit/core';
import {useLongPress} from '../../../../hooks/useLongPress';
import Button from '@mui/material/Button';
import {TemperatureConfigType} from '../../../../configs/house';
import {useState} from 'react';
import {motion} from 'framer-motion';
import {TemperatureModal} from '../../../Modal/TemperatureModal';
import {ThermostatIcon} from '../../../Icons/ThermostatIcon';
import {Tile} from '../../../Mobile/Tile';
import type {ItemVariant} from '.';

type RoomTemperatureProps = {
  id: string;
  tempConfig: TemperatureConfigType;
  variant: ItemVariant;
};

export function RoomTemperature(props: RoomTemperatureProps) {
  const {id, tempConfig, variant} = props;

  const [tempModal, setTempModal] = useState(false);

  const tempLongPress = useLongPress(
    () => setTempModal(true),
    () => setTempModal(true),
  );

  const temperature = useEntity(tempConfig.temperatureEntityId ?? 'unknown', {
    returnNullIfNotFound: true,
  });
  const humidity = useEntity(tempConfig.humidityEntityId ?? 'unknown', {
    returnNullIfNotFound: true,
  });

  const battery = useEntity(tempConfig.batteryEntityId ?? 'unknown', {
    returnNullIfNotFound: true,
  });

  const signal = useEntity(tempConfig.signalEntityId ?? 'unknown', {
    returnNullIfNotFound: true,
  });

  if (!temperature) return;
  const degrees =
    temperature.state === UNKNOWN ? '-' : Math.floor(Number(temperature.state));

  return (
    <>
      <motion.div layoutId={`${id}-temp`}>
        {variant === 'tile' ? (
          <Tile
            icon={<ThermostatIcon />}
            name="Thermomètre"
            state={
              humidity ? `${degrees}° · ${humidity.state} %` : `${degrees}°`
            }
            {...tempLongPress}
          />
        ) : (
          <Button
            variant="contained"
            color="secondary"
            sx={{
              height: '100%',
              minWidth: 0,
              px: '6px',
            }}
            {...tempLongPress}
          >
            {degrees}°
          </Button>
        )}
      </motion.div>
      <TemperatureModal
        id={`${id}-temp`}
        open={tempModal}
        onClose={() => setTempModal(false)}
        temperatureEntity={temperature}
        humidityEntity={humidity ?? undefined}
        batteryEntity={battery ?? undefined}
        signalEntity={signal ?? undefined}
        title="Thermomètre"
      />
    </>
  );
}
