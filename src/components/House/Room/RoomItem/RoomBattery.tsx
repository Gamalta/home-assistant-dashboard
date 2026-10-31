import {useEntity} from '@hakit/core';
import Button from '@mui/material/Button';
import {motion} from 'framer-motion';
import {useState} from 'react';
import {BatteryConfigType} from '../../../../configs/house';
import {Leds} from '../../../../theme/Leds';
import {batteryLevel, isBatteryLow} from '../../../../utils/entity/battery';
import {BatteryLevelDisplay} from '../../../display/BatteryLevelDisplay';
import {BatteryIcon} from '../../../Icons/BatteryIcon';
import {Tile} from '../../../Mobile/Tile';
import type {ItemVariant} from '.';
import {BatteryModal} from '../../../Modal/BatteryModal';

type RoomBatteryProps = {
  id: string;
  batteryConfig: BatteryConfigType;
  variant: ItemVariant;
};

export function RoomBattery(props: RoomBatteryProps) {
  const {id, batteryConfig, variant} = props;
  const [batteryModal, setBatteryModal] = useState(false);
  const battery = useEntity(batteryConfig.batteryEntityId, {
    returnNullIfNotFound: true,
  });

  if (!battery) return <></>;
  const level = batteryLevel(battery.state);
  return (
    <>
      <motion.div layoutId={`layoutid-${id}`}>
        {variant === 'tile' ? (
          <Tile
            icon={<BatteryIcon level={level} />}
            name={batteryConfig.name}
            state={level === null ? '--' : `${level} %`}
            active={isBatteryLow(level)}
            color={Leds.red.color}
            onClick={() => setBatteryModal(true)}
          />
        ) : (
          <Button
            variant="contained"
            color="secondary"
            aria-label={batteryConfig.name}
            sx={{height: '100%', minWidth: 0, px: '6px'}}
            onClick={() => setBatteryModal(true)}
          >
            <BatteryLevelDisplay state={battery.state} />
          </Button>
        )}
      </motion.div>
      <BatteryModal
        id={`layoutid-${id}`}
        open={batteryModal}
        onClose={() => setBatteryModal(false)}
        title={batteryConfig.name}
        batteryConfig={batteryConfig}
      />
    </>
  );
}
