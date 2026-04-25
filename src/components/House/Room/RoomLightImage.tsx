import {HassEntityWithService} from '@hakit/core';
import type {LightConfigType} from '../../../configs/house';
import Box from '@mui/material/Box';
import {useState} from 'react';

type RoomLightImage = {
  lightConfig: LightConfigType;
  light: HassEntityWithService<'light'> | null;
};

export function RoomLightImage(props: RoomLightImage) {
  const {lightConfig, light} = props;
  const [imageLoaded, setimageLoaded] = useState(0);

  if (!light) return;
  return (['red', 'green', 'blue'] as const).map((color, index) => {
    if (!lightConfig?.layer?.[color]) return;
    return (
      <Box
        component="img"
        key={color}
        src={lightConfig?.layer[color]}
        onLoad={() => setimageLoaded(prev => prev + 1)}
        sx={{
          zIndex: 10,
          mixBlendMode: 'lighten',
          opacity:
            light.state === 'on' && imageLoaded === 3
              ? ((light.custom.color?.[index] ?? 0) / 255) *
                ((light.custom.brightnessValue ?? 100) / 100)
              : 0,
        }}
      />
    );
  });
}
