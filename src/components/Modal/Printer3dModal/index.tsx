import {useEntity} from '@hakit/core';
import Stack from '@mui/material/Stack';
import {Modal, ModalProps} from '..';
import {
  printSpeedLabel,
  type Printer3dEntityIds,
} from '../../../utils/entity/printer3d';
import {SelectToggle} from '../../display/SelectToggle';
import {SignalDisplay} from '../../display/SignalDisplay';
import {ExternalSpool} from './ExternalSpool';
import {PrintControls} from './PrintControls';
import {PrinterAlerts} from './PrinterAlerts';
import {PrinterView} from './PrinterView';
import {PrintProgress} from './PrintProgress';

type Printer3dModalProps = Omit<ModalProps, 'children'> & {
  ids: Printer3dEntityIds;
};

export function Printer3dModal(props: Printer3dModalProps) {
  const {ids, ...modalProps} = props;
  const wifi = useEntity(ids.wifiSignal, {returnNullIfNotFound: true});

  return (
    <Modal
      {...modalProps}
      action={
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'center',
            borderRadius: 1,
            border: theme => `1px solid ${theme.palette.divider}`,
            p: 1,
          }}
        >
          <ExternalSpool entityId={ids.externalSpool} />
          {wifi && <SignalDisplay signal={Number(wifi.state)} />}
        </Stack>
      }
    >
      <Stack
        direction={{xs: 'column', sm: 'row'}}
        spacing={3}
        sx={{mt: -2, alignItems: {xs: 'center', sm: 'normal'}}}
      >
        <PrinterView ids={ids} />
        <Stack spacing={2} sx={{width: {xs: '100%', sm: 300}}}>
          <PrinterAlerts ids={ids} />
          <PrintProgress ids={ids} />
          <SelectToggle
            entityId={ids.printingSpeed}
            label="Vitesse"
            optionLabel={printSpeedLabel}
          />
          <PrintControls ids={ids} />
        </Stack>
      </Stack>
    </Modal>
  );
}
