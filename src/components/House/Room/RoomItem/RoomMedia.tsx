import {useEntity} from '@hakit/core';
import PauseIcon from '@mui/icons-material/PauseRounded';
import PlayIcon from '@mui/icons-material/PlayArrowRounded';
import TvIcon from '@mui/icons-material/TvRounded';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {motion} from 'framer-motion';
import {useState} from 'react';
import type {MediaConfigType} from '../../../../configs/house';
import {isMediaOn, mediaTitle} from '../../../../utils/entity/media';
import {MediaModal} from '../../../Modal/MediaModal';

type RoomMediaProps = {
  id: string;
  mediaConfig: MediaConfigType;
};

export function RoomMedia(props: RoomMediaProps) {
  const {id, mediaConfig} = props;
  const [mediaModal, setMediaModal] = useState(false);

  const player = useEntity(mediaConfig.mediaPlayerEntityId, {
    returnNullIfNotFound: true,
  });

  if (!player) return <></>;
  const playing = player.state === 'playing';
  const paused = player.state === 'paused';
  const name = player.attributes.friendly_name ?? 'Média';

  return (
    <>
      <motion.div layoutId={`${id}-media`}>
        <Button
          variant="contained"
          color="secondary"
          aria-label={name}
          sx={{
            height: '100%',
            minWidth: 0,
            px: '6px',
            gap: 0.5,
            ...(isMediaOn(player.state) && {color: 'primary.main'}),
          }}
          onClick={() => setMediaModal(true)}
        >
          {playing ? <PlayIcon /> : paused ? <PauseIcon /> : <TvIcon />}
          {(playing || paused) && (
            <Typography variant="inherit" noWrap sx={{maxWidth: 120}}>
              {mediaTitle(player.attributes)}
            </Typography>
          )}
        </Button>
      </motion.div>
      <MediaModal
        id={`${id}-media`}
        open={mediaModal}
        onClose={() => setMediaModal(false)}
        title={name}
        player={player}
        remoteEntityId={mediaConfig.remoteEntityId}
      />
    </>
  );
}
