import {HassEntityWithService} from '@hakit/core';
import {Modal, ModalProps} from '..';
import {BatteryDisplay} from '../../display/BatteryDisplay';
import {SignalDisplay} from '../../display/SignalDisplay';
import Stack from '@mui/material/Stack';
import {TemperatureModalContent} from './TemperatureModalContent';

type TemperatureModalProps = Omit<ModalProps, 'children'> & {
  temperatureEntity: HassEntityWithService<'sensor'>;
  humidityEntity?: HassEntityWithService<'sensor'>;
  batteryEntity?: HassEntityWithService<'sensor'>;
  signalEntity?: HassEntityWithService<'sensor'>;
};

export function TemperatureModal(props: TemperatureModalProps) {
  const {
    temperatureEntity,
    humidityEntity,
    batteryEntity,
    signalEntity,
    ...modalProps
  } = props;

  return (
    <Modal
      {...modalProps}
      action={
        (signalEntity || batteryEntity) && (
          <Stack
            direction="row"
            borderRadius={1}
            border={theme => `1px solid ${theme.palette.divider}`}
            spacing={1}
            p={1}
          >
            {signalEntity && (
              <SignalDisplay signal={Number(signalEntity?.state) ?? -100} />
            )}
            {batteryEntity && (
              <BatteryDisplay batteryLevel={Number(batteryEntity.state)} />
            )}
          </Stack>
        )
      }
    >
      <TemperatureModalContent
        temperatureEntity={temperatureEntity}
        humidityEntity={humidityEntity}
      />
    </Modal>
  );
}
