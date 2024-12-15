import MoreVertIcon from '@mui/icons-material/MoreVert';
import PowerIcon from '@mui/icons-material/PowerSettingsNew';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import {useState} from 'react';
import {Modal, ModalProps} from '../..';
import {DestkopConfigType} from '../../../../configs/house';
import {UbuntuIcon} from '../../../Icons/UbuntuIcon';
import {WindowsIcon} from '../../../Icons/WindowsIcon';
import {useEntity} from '@hakit/core';

type DesktopModalProps = Omit<ModalProps, 'children'> & {
  desktopConfig: DestkopConfigType;
};

function getIcon(icon?: string) {
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

export function DesktopModal(props: DesktopModalProps) {
  const {desktopConfig, ...modalProps} = props;
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const entity = useEntity(desktopConfig.options[0].script);
  console.log('entity', entity);
  // TODO handle state on
  // TODO put entity on button

  return (
    <Modal
      {...modalProps}
      action={
        <>
          <IconButton onClick={event => setAnchorEl(event.currentTarget)}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={!!anchorEl}
            onClose={() => setAnchorEl(null)}
          >
            {desktopConfig.options
              .filter(option => option.hide)
              .map(option => (
                <MenuItem
                  onClick={() => setAnchorEl(null)}
                  key={`option-hide-${option.label}-${option.script}`}
                >
                  <ListItemIcon>{getIcon(option.icon)}</ListItemIcon>
                  <ListItemText>{option.label}</ListItemText>
                </MenuItem>
              ))}
          </Menu>
        </>
      }
    >
      <Stack spacing={2} alignItems="center" mt={-2}>
        <img
          src="icon/pc.png"
          style={{
            height: '160px',
            width: '160px',
            objectFit: 'contain',
          }}
        />
        <Stack direction="row" spacing={2}>
          {desktopConfig.options
            .filter(option => !option.hide)
            .map(option => (
              <>
                {option.label ? (
                  <Button
                    key={`option-${option.label}-${option.script}`}
                    variant="contained"
                    sx={theme => ({
                      bgcolor: option.color ?? 'background.tertiary',
                      color: theme.palette.getContrastText(
                        option.color ?? theme.palette.background.tertiary
                      ),
                    })}
                    startIcon={getIcon(option.icon)}
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
                  >
                    {getIcon(option.icon)}
                  </IconButton>
                )}
              </>
            ))}
        </Stack>
      </Stack>
    </Modal>
  );
}
