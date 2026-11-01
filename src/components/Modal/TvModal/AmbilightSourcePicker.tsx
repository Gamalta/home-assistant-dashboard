import {HassEntityWithService} from '@hakit/core';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import {useState} from 'react';
import {
  AmbilightSource,
  SOLID_EFFECT,
  VIDEO_EFFECT,
  ambilightEffects,
  ambilightSource,
} from '../../../utils/entity/ambilight';
import {EffectList} from '../LightModal/components/EffectList';

const COLORS: {label: string; rgb: [number, number, number]}[] = [
  {label: 'Blanc chaud', rgb: [255, 180, 107]},
  {label: 'Blanc', rgb: [255, 255, 255]},
  {label: 'Rouge', rgb: [255, 0, 0]},
  {label: 'Orange', rgb: [255, 110, 0]},
  {label: 'Vert', rgb: [0, 255, 0]},
  {label: 'Cyan', rgb: [0, 255, 255]},
  {label: 'Bleu', rgb: [0, 40, 255]},
  {label: 'Violet', rgb: [150, 0, 255]},
];

type AmbilightSourcePickerProps = {
  light: HassEntityWithService<'light'>;
};

export function AmbilightSourcePicker(props: AmbilightSourcePickerProps) {
  const {light} = props;
  // « Couleur » et « Effet » ouvrent d'abord un choix : la source ne change qu'après.
  const [view, setView] = useState<AmbilightSource>();
  const shown = view ?? ambilightSource(light.attributes.effect);

  return (
    <Stack spacing={2}>
      <ToggleButtonGroup
        exclusive
        fullWidth
        value={shown}
        onChange={(_, source: AmbilightSource | null) => {
          if (!source) return;
          setView(source);
          if (source === 'video') {
            light.service.turnOn({serviceData: {effect: VIDEO_EFFECT}});
          }
        }}
      >
        <ToggleButton value="video">Vidéo</ToggleButton>
        <ToggleButton value="color">Couleur</ToggleButton>
        <ToggleButton value="effect">Effet</ToggleButton>
      </ToggleButtonGroup>
      {shown === 'color' && (
        <Stack direction="row" sx={{justifyContent: 'space-between'}}>
          {COLORS.map(({label, rgb}) => (
            <Box
              key={label}
              component="button"
              aria-label={label}
              onClick={() =>
                light.service.turnOn({
                  serviceData: {effect: SOLID_EFFECT, rgb_color: rgb},
                })
              }
              sx={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '2px solid',
                borderColor: 'divider',
                cursor: 'pointer',
                bgcolor: `rgb(${rgb.join(',')})`,
              }}
            />
          ))}
        </Stack>
      )}
      {shown === 'effect' && (
        <Box sx={{maxHeight: '240px', overflowY: 'auto'}}>
          <EffectList
            effects={ambilightEffects(light.attributes.effect_list ?? [])}
            activeEffects={[light.attributes.effect]}
            onSelect={effect => light.service.turnOn({serviceData: {effect}})}
          />
        </Box>
      )}
    </Stack>
  );
}
