import Stack from '@mui/material/Stack';
import {Modal, ModalProps} from '..';
import {ShutterConfigType} from '../../../configs/house';
import Slider from '@mui/material/Slider';
import {useState} from 'react';
import Box from '@mui/material/Box';

type DesktopModalProps = Omit<ModalProps, 'children'> & {
  shutterConfig: ShutterConfigType;
};

export function ShutterModal(props: DesktopModalProps) {
  const {shutterConfig, onClose, ...modalProps} = props;

  const [value, setValue] = useState(30);

  const handleChange = (event: Event, newValue: number | number[]) => {
    setValue(newValue as number);
  };

  return (
    <Modal {...modalProps} onClose={onClose}>
      <Stack position="relative" alignItems="center" mt={-2}>
        <img
          src="shutter/shutter_base.png"
          style={{
            width: '200px',
            height: '197px',
            objectFit: 'contain',
          }}
        />
        <Slider value={value} onChange={handleChange} />
        <Stack
          position="absolute"
          top={0}
          pl="11px"
          pr="11.5px"
          pt="22.5px"
          pb="9px"
          width="200px"
          height="197px"
          overflow="hidden"
        >
          <img
            src="shutter/shutter_blind.png"
            height={`${value}%`}
            width="100%"
            style={{objectFit: 'cover', objectPosition: 'bottom'}}
          />
          <Box
            height={`min(15px, ${value}%)`}
            left="11px"
            right="11.5px"
            position="absolute"
            sx={{
              background:
                'linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.0))',
            }}
          />
        </Stack>
      </Stack>
    </Modal>
  );
}
