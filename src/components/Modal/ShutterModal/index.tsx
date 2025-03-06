import {Modal, ModalProps} from '..';
import {ShutterConfigType} from '../../../configs/house';
import {useEffect, useState} from 'react';
import {ShutterSlider} from './ShutterSlider';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpwardRounded';
import StopIcon from '@mui/icons-material/StopRounded';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownwardRounded';
import Divider from '@mui/material/Divider';
import {useEntity} from '@hakit/core';

type DesktopModalProps = Omit<ModalProps, 'children'> & {
  shutterConfig: ShutterConfigType;
};

export function ShutterModal(props: DesktopModalProps) {
  const {shutterConfig, onClose, ...modalProps} = props;

  const entity = useEntity(shutterConfig.shutterEntityId, {
    returnNullIfNotFound: true,
  });

  const [position, setPosition] = useState(
    entity?.attributes.current_position ?? 0
  );

  useEffect(() => {
    setPosition(entity?.attributes.current_position ?? 0);
  }, [entity?.attributes.current_position]);

  return (
    <Modal {...modalProps} onClose={onClose}>
      <Stack spacing={2}>
        <ShutterSlider
          value={position}
          onChange={(_, newPosition) => setPosition(newPosition as number)}
          onChangeCommitted={(_, newPosition) =>
            entity?.service.setCoverPosition({position: newPosition as number})
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
