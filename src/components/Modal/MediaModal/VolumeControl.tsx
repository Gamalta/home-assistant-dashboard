import type {HassEntityWithService} from '@hakit/core';
import {supportsFeatureFromAttributes} from '@hakit/core';
import VolumeOffIcon from '@mui/icons-material/VolumeOffRounded';
import VolumeUpIcon from '@mui/icons-material/VolumeUpRounded';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import {useState} from 'react';
import {MediaPlayerFeature} from '../../../utils/entity/media';

type VolumeControlProps = {
  player: HassEntityWithService<'media_player'>;
};

export function VolumeControl(props: VolumeControlProps) {
  const {player} = props;
  const {attributes, service} = player;
  // Le volume n'est envoyé qu'au relâchement : en attendant, le curseur suit le doigt.
  const [dragVolume, setDragVolume] = useState<number | null>(null);
  const muted = attributes.is_volume_muted;

  return (
    <Stack direction="row" spacing={1} sx={{alignItems: 'center'}}>
      {supportsFeatureFromAttributes(
        attributes,
        MediaPlayerFeature.VOLUME_MUTE,
      ) && (
        <IconButton
          aria-label={muted ? 'Rétablir le son' : 'Couper le son'}
          onClick={() =>
            service.volumeMute({serviceData: {is_volume_muted: !muted}})
          }
        >
          {muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
        </IconButton>
      )}
      {supportsFeatureFromAttributes(
        attributes,
        MediaPlayerFeature.VOLUME_SET,
      ) && (
        <Slider
          aria-label="Volume"
          value={dragVolume ?? Math.round((attributes.volume_level ?? 0) * 100)}
          onChange={(_, value) => setDragVolume(value as number)}
          onChangeCommitted={(_, value) => {
            service.volumeSet({
              serviceData: {volume_level: (value as number) / 100},
            });
            setDragVolume(null);
          }}
        />
      )}
    </Stack>
  );
}
