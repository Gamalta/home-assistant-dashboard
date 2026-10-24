import {useEntity} from '@hakit/core';
import Button from '@mui/material/Button';
import {motion} from 'framer-motion';
import {useState} from 'react';
import {BatteryConfigType} from '../../../../configs/house';
import {BatteryLevelDisplay} from '../../../display/BatteryLevelDisplay';
import {BatteryModal} from '../../../Modal/BatteryModal';

type RoomBatteryProps = {
  id: string;
  batteryConfig: BatteryConfigType;
};

export function RoomBattery(props: RoomBatteryProps) {
  const {id, batteryConfig} = props;
  const [batteryModal, setBatteryModal] = useState(false);
  const battery = useEntity(batteryConfig.batteryEntityId, {
    returnNullIfNotFound: true,
  });

  if (!battery) return <></>;
  return (
    <>
      <motion.div layoutId={`layoutid-${id}`}>
        <Button
          variant="contained"
          color="secondary"
          aria-label={batteryConfig.name}
          sx={{height: '100%', minWidth: 0, px: '6px'}}
          onClick={() => setBatteryModal(true)}
        >
          <BatteryLevelDisplay state={battery.state} />
        </Button>
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
