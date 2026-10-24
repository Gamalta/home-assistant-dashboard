import type {
  EntityName,
  FilterByDomain,
  HassEntityWithService,
} from '@hakit/core';
import {supportsFeatureFromAttributes} from '@hakit/core';
import PowerIcon from '@mui/icons-material/PowerSettingsNewRounded';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {Modal, ModalProps} from '..';
import {isMediaOn, MediaPlayerFeature} from '../../../utils/entity/media';
import {MediaControls} from './MediaControls';
import {NowPlaying} from './NowPlaying';
import {RemotePad} from './RemotePad';
import {SourceSelect} from './SourceSelect';
import {VolumeControl} from './VolumeControl';

type MediaModalProps = Omit<ModalProps, 'children'> & {
  player: HassEntityWithService<'media_player'>;
  remoteEntityId?: FilterByDomain<EntityName, 'remote'>;
};

export function MediaModal(props: MediaModalProps) {
  const {player, remoteEntityId, ...modalProps} = props;
  const on = isMediaOn(player.state);
  const canSwitch = supportsFeatureFromAttributes(
    player.attributes,
    on ? MediaPlayerFeature.TURN_OFF : MediaPlayerFeature.TURN_ON,
  );

  return (
    <Modal
      {...modalProps}
      action={
        canSwitch && (
          <IconButton
            aria-label={on ? 'Éteindre' : 'Allumer'}
            sx={{color: on ? 'primary.main' : undefined}}
            onClick={() =>
              on ? player.service.turnOff() : player.service.turnOn()
            }
          >
            <PowerIcon />
          </IconButton>
        )
      }
    >
      {on ? (
        <Stack direction="row" spacing={3}>
          <Stack spacing={2} sx={{width: 300}}>
            <NowPlaying player={player} />
            <MediaControls player={player} />
            <VolumeControl player={player} />
            <SourceSelect player={player} />
          </Stack>
          {remoteEntityId && <RemotePad entityId={remoteEntityId} />}
        </Stack>
      ) : (
        <Typography color="textSecondary">Éteint</Typography>
      )}
    </Modal>
  );
}
