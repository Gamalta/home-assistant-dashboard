import {Modal, ModalProps} from '..';
import Stack from '@mui/material/Stack';
import {SystemInfoDisplay} from './SystemInfoDisplay';
import {SystemGraphDisplay} from './SystemGraphDisplay';
import {SideBarConfigType} from '../../../configs/sidebar';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import {useAppContext} from '../../../contexts/AppContext';
import * as THREE from 'three';

type SystemModalProps = Omit<ModalProps, 'children'> & {
  systemConfig: SideBarConfigType['system'];
};

export function SystemModal(props: SystemModalProps) {
  const {systemConfig, ...modalProps} = props;
  const {configuration, setConfiguration, triangle} = useAppContext();
  const renderer = new THREE.WebGLRenderer();

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
          <Stack
            direction="row"
            sx={{justifyContent: 'space-between', alignItems: 'center'}}
          >
            <Typography>Debug</Typography>
            <Switch
              checked={configuration.debug}
              onChange={e => setConfiguration({...configuration, debug: e.target.checked})}
            />
          </Stack>
          <Stack
            direction="row"
            sx={{justifyContent: 'space-between', alignItems: 'center'}}
          >
            <Typography>Max Textures</Typography>
            <Typography>{renderer.capabilities.maxTextures}</Typography>
          </Stack>
          <Stack
            direction="row"
            sx={{justifyContent: 'space-between', alignItems: 'center'}}
          >
            <Typography>Triangles</Typography>
            <Typography>{triangle}</Typography>
          </Stack>
          <Stack
            direction="row"
            sx={{justifyContent: 'space-between', alignItems: 'center'}}
          >
            <Typography>Web GPU</Typography>
            <Typography>
              {navigator.gpu ? 'Supporté' : 'Non supporté'}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Modal>
  );
}
