import type {HassEntityWithService} from '@hakit/core';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {Modal, ModalProps} from '..';
import {isMediaOn} from '../../../utils/entity/media';
import {MediaControls} from './MediaControls';
import {NowPlaying} from './NowPlaying';

type MediaModalProps = Omit<ModalProps, 'children'> & {
  player: HassEntityWithService<'media_player'>;
};

export function MediaModal(props: MediaModalProps) {
  const {player, ...modalProps} = props;

  return (
    <Modal {...modalProps}>
      {isMediaOn(player.state) ? (
        <Stack spacing={2} sx={{width: 300}}>
          <NowPlaying player={player} />
          <MediaControls player={player} />
        </Stack>
      ) : (
        <Typography color="textSecondary">Éteint</Typography>
      )}
    </Modal>
  );
}
