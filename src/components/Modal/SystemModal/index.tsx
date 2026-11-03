import {Modal, ModalProps} from '..';
import Stack from '@mui/material/Stack';
import {SystemInfoDisplay} from './SystemInfoDisplay';
import {SideBarConfigType} from '../../../configs/sidebar';
import {SystemGraphDisplay} from './SystemGraphDisplay';
import {UpdatesInfo} from './UpdatesInfo';
import {BackupInfo} from './BackupInfo';
import {TabletInfo} from './TabletInfo';

type SystemModalProps = Omit<ModalProps, 'children'> & {
  systemConfig: SideBarConfigType['system'];
};

export function SystemModal(props: SystemModalProps) {
  const {systemConfig, ...modalProps} = props;

  return (
    <Modal {...modalProps}>
      <Stack direction={{xs: 'column', sm: 'row'}} spacing={3}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={{xs: 1, sm: 2}}>
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
        <Stack spacing={1} sx={{width: {xs: '100%', sm: 300}}}>
          <SystemInfoDisplay
            label="Internet"
            sensor={systemConfig?.internetEntityId}
            formatEntity={entity =>
              entity.state === 'on' ? 'Connecté' : 'Coupé'
            }
            isWarning={entity => entity.state !== 'on'}
          />
          <UpdatesInfo />
          <BackupInfo systemConfig={systemConfig} />
          <TabletInfo systemConfig={systemConfig} />
        </Stack>
      </Stack>
    </Modal>
  );
}
