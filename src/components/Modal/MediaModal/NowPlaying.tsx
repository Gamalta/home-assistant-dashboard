import type {HassEntityWithService} from '@hakit/core';
import {useHass} from '@hakit/core';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {mediaTitle} from '../../../utils/entity/media';

type NowPlayingProps = {
  player: HassEntityWithService<'media_player'>;
};

export function NowPlaying(props: NowPlayingProps) {
  const {player} = props;
  const joinHassUrl = useHass(state => state.helpers.joinHassUrl);
  const {entity_picture, media_artist, media_series_title} = player.attributes;

  return (
    <Stack direction="row" spacing={2} sx={{alignItems: 'center'}}>
      {entity_picture && (
        <Box
          component="img"
          src={joinHassUrl(entity_picture)}
          alt="Visuel du média"
          sx={{width: 96, height: 96, borderRadius: 1, objectFit: 'cover'}}
        />
      )}
      <Stack sx={{minWidth: 0}}>
        <Typography variant="h6" noWrap>
          {mediaTitle(player.attributes) ?? 'Aucun média'}
        </Typography>
        <Typography color="textSecondary" noWrap>
          {media_artist ?? media_series_title}
        </Typography>
      </Stack>
    </Stack>
  );
}
