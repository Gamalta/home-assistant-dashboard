import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import {useState} from 'react';
import {Modal, ModalProps} from '../..';
import {DestkopConfigType} from '../../../../configs/house';
import {OptionButton} from './OptionButton';

type DesktopModalProps = Omit<ModalProps, 'children'> & {
  desktopConfig: DestkopConfigType;
};

export function DesktopModal(props: DesktopModalProps) {
  const {desktopConfig, onClose, ...modalProps} = props;
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <Modal
      {...modalProps}
      onClose={onClose}
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
                <OptionButton
                  key={`option-hide-${option.label}-${option.script}`}
                  option={option}
                  onClose={() => (onClose(), setAnchorEl(null))}
                />
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
              <OptionButton
                key={`option-${option.label}-${option.script}`}
                option={option}
                onClose={() => onClose()}
              />
            ))}
        </Stack>
      </Stack>
    </Modal>
  );
}
