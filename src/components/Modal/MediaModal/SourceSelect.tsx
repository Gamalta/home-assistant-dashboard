import type {HassEntityWithService} from '@hakit/core';
import {supportsFeatureFromAttributes} from '@hakit/core';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import {MediaPlayerFeature} from '../../../utils/entity/media';

type SourceSelectProps = {
  player: HassEntityWithService<'media_player'>;
};

export function SourceSelect(props: SourceSelectProps) {
  const {player} = props;
  const {source, source_list} = player.attributes;

  if (
    !source_list?.length ||
    !supportsFeatureFromAttributes(
      player.attributes,
      MediaPlayerFeature.SELECT_SOURCE,
    )
  )
    return null;
  return (
    <TextField
      select
      size="small"
      label="Source"
      value={source ?? ''}
      onChange={event =>
        player.service.selectSource({serviceData: {source: event.target.value}})
      }
    >
      {source_list.map(item => (
        <MenuItem key={item} value={item}>
          {item}
        </MenuItem>
      ))}
    </TextField>
  );
}
