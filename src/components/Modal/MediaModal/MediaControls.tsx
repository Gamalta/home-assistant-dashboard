import type {HassEntityWithService} from '@hakit/core';
import {supportsFeatureFromAttributes} from '@hakit/core';
import PauseIcon from '@mui/icons-material/PauseRounded';
import PlayIcon from '@mui/icons-material/PlayArrowRounded';
import NextIcon from '@mui/icons-material/SkipNextRounded';
import PreviousIcon from '@mui/icons-material/SkipPreviousRounded';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import {MediaPlayerFeature} from '../../../utils/entity/media';

type MediaControlsProps = {
  player: HassEntityWithService<'media_player'>;
};

export function MediaControls(props: MediaControlsProps) {
  const {player} = props;
  const {attributes, service} = player;
  const playing = player.state === 'playing';
  const supports = (feature: MediaPlayerFeature) =>
    supportsFeatureFromAttributes(attributes, feature);

  return (
    <Stack direction="row" sx={{justifyContent: 'center'}}>
      {supports(MediaPlayerFeature.PREVIOUS_TRACK) && (
        <IconButton
          aria-label="Précédent"
          onClick={() => service.mediaPreviousTrack()}
        >
          <PreviousIcon />
        </IconButton>
      )}
      {supports(
        playing ? MediaPlayerFeature.PAUSE : MediaPlayerFeature.PLAY,
      ) && (
        <IconButton
          aria-label={playing ? 'Pause' : 'Lecture'}
          onClick={() => (playing ? service.mediaPause() : service.mediaPlay())}
        >
          {playing ? (
            <PauseIcon fontSize="large" />
          ) : (
            <PlayIcon fontSize="large" />
          )}
        </IconButton>
      )}
      {supports(MediaPlayerFeature.NEXT_TRACK) && (
        <IconButton
          aria-label="Suivant"
          onClick={() => service.mediaNextTrack()}
        >
          <NextIcon />
        </IconButton>
      )}
    </Stack>
  );
}
