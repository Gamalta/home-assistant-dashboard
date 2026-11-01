import {HassEntityWithService} from '@hakit/core';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import {Modal, ModalProps} from '..';
import {BrightnessIcon} from '../../Icons/BrightnessIcon';
import type {LedLayoutType} from '../../../configs/house';
import {ambilightEntityIds} from '../../../utils/entity/ambilight';
import {AmbilightSourcePicker} from './AmbilightSourcePicker';
import {CameraStream} from './CameraStream';
import {LedGlow} from './LedGlow';

type TvModalProps = Omit<ModalProps, 'children'> & {
  light: HassEntityWithService<'light'>;
  ledLayout: LedLayoutType;
};

export function TvModal(props: TvModalProps) {
  const {light, ledLayout, ...modalProps} = props;
  const lightOn = light.state === 'on';
  const brightness = Math.round(
    ((light.attributes.brightness ?? 255) * 100) / 255,
  );
  const cameras = ambilightEntityIds(light.entity_id);

  return (
    <Modal {...modalProps}>
      <Stack spacing={2} sx={{width: '440px', maxWidth: '100%'}}>
        {/* Les marges laissent la place au halo des LED. */}
        <Box sx={{position: 'relative', aspectRatio: '16 / 9', mx: 3, my: 2}}>
          {lightOn && (
            <LedGlow cameraEntityId={cameras.leds} ledLayout={ledLayout} />
          )}
          <Box
            sx={{
              position: 'relative',
              height: '100%',
              borderRadius: 1,
              overflow: 'hidden',
              bgcolor: 'common.black',
            }}
          >
            <CameraStream
              cameraEntityId={cameras.image}
              alt="Image de la TV"
              sx={{
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </Box>
        </Box>
        <Stack direction="row" spacing={2} sx={{alignItems: 'center'}}>
          <FormControlLabel
            label="Ambilight"
            control={
              <Switch
                checked={lightOn}
                onChange={() =>
                  lightOn ? light.service.turnOff() : light.service.turnOn()
                }
              />
            }
          />
          <BrightnessIcon />
          <Slider
            // Remonté à chaque nouvel état : il suit Home Assistant sans bouger pendant le geste.
            key={brightness}
            aria-label="Luminosité"
            defaultValue={brightness}
            min={1}
            valueLabelDisplay="auto"
            sx={{mr: 1}}
            onChangeCommitted={(_, value) =>
              light.service.turnOn({serviceData: {brightness_pct: value}})
            }
          />
        </Stack>
        <AmbilightSourcePicker light={light} />
      </Stack>
    </Modal>
  );
}
