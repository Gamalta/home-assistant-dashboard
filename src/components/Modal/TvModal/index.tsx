import {HassEntityWithService} from '@hakit/core';
import FormControlLabel from '@mui/material/FormControlLabel';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import {Modal, ModalProps} from '..';
import {BrightnessIcon} from '../../Icons/BrightnessIcon';
import type {LedLayoutType} from '../../../configs/house';
import {AmbilightSourcePicker} from './AmbilightSourcePicker';
import {TvScreen} from './TvScreen';

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

  return (
    <Modal {...modalProps}>
      <Stack
        direction={{xs: 'column', md: 'row'}}
        spacing={3}
        sx={{width: {xs: '440px', md: '820px'}, maxWidth: '100%'}}
      >
        <Stack sx={{flex: 1, minWidth: 0}}>
          <TvScreen light={light} ledLayout={ledLayout} />
        </Stack>
        <Stack spacing={2} sx={{width: {md: '280px'}, flexShrink: 0}}>
          <Stack direction="row" spacing={2} sx={{alignItems: 'center', pr: 1}}>
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
              onChangeCommitted={(_, value) =>
                light.service.turnOn({serviceData: {brightness_pct: value}})
              }
            />
          </Stack>
          <AmbilightSourcePicker light={light} />
        </Stack>
      </Stack>
    </Modal>
  );
}
