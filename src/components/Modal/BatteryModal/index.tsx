import {useEntity} from '@hakit/core';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {Modal, ModalProps} from '..';
import {BatteryConfigType} from '../../../configs/house';
import {batteryLevel, isBatteryLow} from '../../../utils/entity/battery';
import {BatteryGauge} from './BatteryGauge';
import {WallSwitchView} from './WallSwitchView';

type BatteryModalProps = Omit<ModalProps, 'children'> & {
  batteryConfig: BatteryConfigType;
};

export function BatteryModal(props: BatteryModalProps) {
  const {batteryConfig, ...modalProps} = props;
  const battery = useEntity(batteryConfig.batteryEntityId, {
    returnNullIfNotFound: true,
  });
  const level = batteryLevel(battery?.state);
  const low = isBatteryLow(level);

  return (
    <Modal {...modalProps}>
      <Stack direction="row" spacing={3} sx={{alignItems: 'center'}}>
        <WallSwitchView level={level} />
        <Stack spacing={1.5} sx={{width: 300}}>
          <Stack sx={{color: low ? 'error.main' : undefined}}>
            <Typography variant="h3">
              {level === null ? '--' : `${level}%`}
            </Typography>
            <Typography variant="h6">
              {level === null
                ? 'Niveau inconnu'
                : low
                  ? 'Pile faible, à remplacer'
                  : 'Pile en bon état'}
            </Typography>
          </Stack>
          <BatteryGauge level={level} />
          {battery && (
            <Typography variant="body2" color="textSecondary">
              Mis à jour {battery.custom.relativeTime}
            </Typography>
          )}
        </Stack>
      </Stack>
    </Modal>
  );
}
