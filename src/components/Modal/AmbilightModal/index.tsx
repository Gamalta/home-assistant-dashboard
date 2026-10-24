import {HassEntityWithService} from '@hakit/core';
import FormControlLabel from '@mui/material/FormControlLabel';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import {Modal, ModalProps} from '..';
import {BrightnessIcon} from '../../Icons/BrightnessIcon';
import {ambilightEntityIds} from '../../../utils/entity/ambilight';
import {AmbilightPreview} from './AmbilightPreview';
import {AmbilightSourcePicker} from './AmbilightSourcePicker';

type AmbilightModalProps = Omit<ModalProps, 'children'> & {
  light: HassEntityWithService<'light'>;
};

export function AmbilightModal(props: AmbilightModalProps) {
  const {light, ...modalProps} = props;
  const lightOn = light.state === 'on';
  const brightness = Math.round(
    ((light.attributes.brightness ?? 255) * 100) / 255,
  );

  return (
    <Modal {...modalProps}>
      <Stack spacing={2} sx={{width: '440px', maxWidth: '100%'}}>
        <Stack direction="row" spacing={2} sx={{alignItems: 'center'}}>
          <FormControlLabel
            label="Allumé"
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
        <AmbilightPreview
          cameraEntityId={ambilightEntityIds(light.entity_id).gradient}
        />
        <AmbilightSourcePicker light={light} />
      </Stack>
    </Modal>
  );
}
