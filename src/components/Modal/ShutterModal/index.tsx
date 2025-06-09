import {Modal, ModalProps} from '..';
import {ShutterConfigType} from '../../../configs/house';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpwardRounded';
import StopIcon from '@mui/icons-material/StopRounded';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownwardRounded';
import Divider from '@mui/material/Divider';
import {useEntity} from '@hakit/core';
import {ShutterSlider} from './ShutterSlider';

type DesktopModalProps = Omit<ModalProps, 'children'> & {
  shutterConfig: ShutterConfigType;
};

export function ShutterModal(props: DesktopModalProps) {
  const {shutterConfig, onClose, ...modalProps} = props;

  const entity = useEntity(shutterConfig.shutterEntityId, {
    returnNullIfNotFound: true,
  });

  return (
    <Modal {...modalProps} onClose={onClose}>
      <Stack spacing={2}>
        <ShutterSlider
          value={entity?.attributes.current_position ?? 0}
          onChange={newPosition =>
            entity?.service.setCoverPosition({position: newPosition})
          }
        />
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          bgcolor="background.tertiary"
          borderRadius={1}
          spacing={1}
        >
          <IconButton
            sx={{borderRadius: 1}}
            onClick={() => entity?.service.openCover()}
          >
            <ArrowUpwardIcon />
          </IconButton>
          <Divider orientation="vertical" sx={{height: '25px'}} />
          <IconButton
            sx={{borderRadius: 1}}
            onClick={() => entity?.service.stopCover()}
          >
            <StopIcon />
          </IconButton>
          <Divider orientation="vertical" sx={{height: '25px'}} />
          <IconButton
            sx={{borderRadius: 1}}
            onClick={() => entity?.service.closeCover()}
          >
            <ArrowDownwardIcon />
          </IconButton>
        </Stack>
      </Stack>
    </Modal>
  );
}
