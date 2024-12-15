import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import {DestkopConfigType} from '../../../configs/house';
import {UbuntuIcon} from '../../Icons/UbuntuIcon';
import {WindowsIcon} from '../../Icons/WindowsIcon';
import PowerIcon from '@mui/icons-material/PowerSettingsNew';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import {HassEntityWithService, useEntity} from '@hakit/core';
import {CircularProgress} from '@mui/material';

type OptionButtonProps = {
  option: DestkopConfigType['options'][0];
  onClose: () => void;
};

function getIcon(entity: HassEntityWithService<'script'>, icon?: string) {
  if (entity.state === 'on') {
    return <CircularProgress size="20px" />;
  }

  switch (icon) {
    case 'windows':
      return <WindowsIcon />;
    case 'ubuntu':
      return <UbuntuIcon />;
    case 'power':
    default:
      return <PowerIcon fontSize="small" />;
  }
}

export function OptionButton(props: OptionButtonProps) {
  const {option, onClose} = props;

  const entity = useEntity(option.script);

  if (option.hide) {
    return (
      <MenuItem onClick={() => (entity.service.turnOn(), onClose())}>
        <ListItemIcon>{getIcon(entity, option.icon)}</ListItemIcon>
        <ListItemText>{option.label}</ListItemText>
      </MenuItem>
    );
  }

  return (
    <>
      {option.label ? (
        <Button
          variant="contained"
          sx={theme => ({
            bgcolor: option.color ?? 'background.tertiary',
            color: theme.palette.getContrastText(
              option.color ?? theme.palette.background.tertiary
            ),
          })}
          startIcon={getIcon(entity, option.icon)}
          onClick={() => (entity.service.turnOn(), onClose())}
        >
          {option.label}
        </Button>
      ) : (
        <IconButton
          sx={theme => ({
            bgcolor: option.color ?? 'background.tertiary',
            color: theme.palette.getContrastText(
              option.color ?? theme.palette.background.tertiary
            ),
          })}
          onClick={() => (entity.service.turnOn(), onClose())}
        >
          {getIcon(entity, option.icon)}
        </IconButton>
      )}
    </>
  );
}
