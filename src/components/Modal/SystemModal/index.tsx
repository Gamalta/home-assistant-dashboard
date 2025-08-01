import {Modal, ModalProps} from '..';
import Stack from '@mui/material/Stack';
import {SystemInfoDisplay} from './SystemInfoDisplay';
import {SystemGraphDisplay} from './SystemGraphDisplay';
import {SideBarConfigType} from '../../../configs/sidebar';

type SystemModalProps = Omit<ModalProps, 'children'> & {
  systemConfig: SideBarConfigType['system'];
};

export function SystemModal(props: SystemModalProps) {
  const {systemConfig, ...modalProps} = props;

  return (
    <Modal {...modalProps}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          {(systemConfig?.graphs ?? []).map(graph => (
            <SystemGraphDisplay key={graph.label} graphConfig={graph} />
          ))}
        </Stack>
        <Stack spacing={1}>
          <SystemInfoDisplay
            label="Lancé depuis:"
            sensor={systemConfig?.uptimeEntityId}
            formatEntity={entity => entity.custom.relativeTime}
          />
          <SystemInfoDisplay
            label="Alimentation:"
            sensor={systemConfig?.powerStatusEntityId}
            formatEntity={entity =>
              entity.state === 'off' ? 'Suffisant' : 'Insuffisante'
            }
          />
        </Stack>
      </Stack>
    </Modal>
  );
}
