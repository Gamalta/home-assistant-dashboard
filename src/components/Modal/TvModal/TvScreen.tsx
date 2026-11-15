import {HassEntityWithService} from '@hakit/core';
import Box from '@mui/material/Box';
import type {LedLayoutType} from '../../../configs/house';
import {
  ambilightEntityIds,
  ambilightSource,
} from '../../../utils/entity/ambilight';
import {CameraStream} from './CameraStream';
import {LedGlow} from './LedGlow';

type TvScreenProps = {
  light: HassEntityWithService<'light'>;
  ledLayout: LedLayoutType;
};

// La TV sur son mur, que le halo des LED éclaire. HyperHDR ne diffuse aucune
// image pendant une couleur fixe : le flux resterait figé sur la dernière.
export function TvScreen(props: TvScreenProps) {
  const {light, ledLayout} = props;
  const cameras = ambilightEntityIds(light.entity_id);
  const lightOn = light.state === 'on';
  const color =
    lightOn && ambilightSource(light.attributes.effect) === 'color'
      ? (light.attributes.rgb_color ?? undefined)
      : undefined;

  return (
    <Box
      sx={{
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: 'common.black',
        px: '9%',
        py: '7%',
      }}
    >
      <Box sx={{position: 'relative', aspectRatio: '16 / 9'}}>
        {lightOn && (
          <LedGlow
            cameraEntityId={cameras.leds}
            ledLayout={ledLayout}
            color={color}
          />
        )}
        <Box
          sx={{
            position: 'relative',
            height: '100%',
            borderRadius: '4px',
            overflow: 'hidden',
            bgcolor: 'common.black',
            outline: '1px solid',
            outlineColor: 'grey.900',
          }}
        >
          {!color && (
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
          )}
        </Box>
      </Box>
    </Box>
  );
}
