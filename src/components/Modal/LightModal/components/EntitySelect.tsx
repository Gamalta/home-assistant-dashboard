import {HassEntityWithService} from '@hakit/core';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

type EntitySelectProps = {
  entity: HassEntityWithService<'select'>;
  label: string;
};

export function EntitySelect(props: EntitySelectProps) {
  const {entity, label} = props;
  const options = entity.attributes.options ?? [];

  return (
    <TextField
      select
      size="small"
      label={label}
      // WLED vaut « unknown » quand aucun préréglage n'est actif.
      value={options.includes(entity.state) ? entity.state : ''}
      onChange={event =>
        entity.service.selectOption({serviceData: {option: event.target.value}})
      }
      sx={{flex: 1, minWidth: 0}}
    >
      {options.map(option => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </TextField>
  );
}
