import {useEntity, useHass} from '@hakit/core';
import CastIcon from '@mui/icons-material/CastRounded';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {useState} from 'react';
import type {MediaShortcutConfigType} from '../../../configs/sidebar';
import {isMediaOn, mediaTitle} from '../../../utils/entity/media';
import {MediaModal} from '../../Modal/MediaModal';
import {MediaControls} from '../../Modal/MediaModal/MediaControls';
import {ShortcutCard} from './ShortcutCard';

type MediaShortcutProps = {
  id: string;
  shortcutConfig: MediaShortcutConfigType;
};

export function MediaShortcut(props: MediaShortcutProps) {
  const {id, shortcutConfig} = props;
  const [open, setOpen] = useState(false);
  const joinHassUrl = useHass(state => state.helpers.joinHassUrl);
  const player = useEntity(shortcutConfig.mediaPlayerEntityId, {
    returnNullIfNotFound: true,
  });
  const active = player && isMediaOn(player.state) ? player : null;
  const label = player?.attributes.friendly_name ?? 'Média';
  const picture = active?.attributes.entity_picture;

  return (
    <>
      <ShortcutCard
        id={id}
        icon={<CastIcon />}
        label={label}
        controls={active && <MediaControls player={active} />}
        onClick={() => setOpen(true)}
      >
        {active ? (
          <Stack direction="row" spacing={1.5} sx={{alignItems: 'center'}}>
            {picture && (
              <Box
                component="img"
                src={joinHassUrl(picture)}
                alt=""
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 1,
                  objectFit: 'cover',
                }}
              />
            )}
            <Stack sx={{minWidth: 0}}>
              <Typography variant="h6" component="span" noWrap>
                {mediaTitle(active.attributes) ?? 'Aucun média'}
              </Typography>
              <Typography
                component="span"
                noWrap
                sx={{color: 'text.secondary'}}
              >
                {active.attributes.media_artist ??
                  active.attributes.media_series_title}
              </Typography>
            </Stack>
          </Stack>
        ) : (
          <Typography component="span" sx={{color: 'text.secondary'}}>
            Éteint
          </Typography>
        )}
      </ShortcutCard>
      {player && (
        <MediaModal
          id={id}
          open={open}
          onClose={() => setOpen(false)}
          title={label}
          player={player}
        />
      )}
    </>
  );
}
