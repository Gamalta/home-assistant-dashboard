import {useEntity} from '@hakit/core';
import Stack from '@mui/material/Stack';
import {Modal, ModalProps} from '..';
import type {Printer3dEntityIds} from '../../../utils/entity/printer3d';
import {SignalDisplay} from '../../display/SignalDisplay';
import {ExternalSpool} from './ExternalSpool';
import {PrintControls} from './PrintControls';
import {PrinterAlerts} from './PrinterAlerts';
import {PrinterView} from './PrinterView';
import {PrintProgress} from './PrintProgress';
import {PrintSpeed} from './PrintSpeed';

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
      <Stack direction="row" spacing={3} sx={{mt: -2}}>
        <PrinterView ids={ids} />
        <Stack spacing={2} sx={{width: 300}}>
          <PrinterAlerts ids={ids} />
          <PrintProgress ids={ids} />
          <PrintSpeed entityId={ids.printingSpeed} />
          <PrintControls ids={ids} />
        </Stack>
      </Stack>
    </Modal>
  );
}
