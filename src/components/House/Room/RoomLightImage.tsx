import {HassEntityWithService} from '@hakit/core';
import type {LightConfigType} from '../../../configs/house';
import Box from '@mui/material/Box';
import { useEffect, useState } from 'react';

type RoomLightImage = {
  lightConfig: LightConfigType;
  light: HassEntityWithService<'light'> | null;
};

export function RoomLightImage(props: RoomLightImage) {
  const {lightConfig, light} = props;
  const [loaded, setLoaded] = useState(false);

  const colors = ['red', 'green', 'blue'] as const;

    useEffect(() => {
    if (!colors.length) return;
    let loadedCount = 0;
    colors.forEach((color) => {
      const src = lightConfig?.layer?.[color];
      if (!src) {
        loadedCount++;
        return;
      }
      const img = new Image();
      img.src = src!;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === colors.length) {
          setLoaded(true);
        }
      };
    });
  }, [lightConfig]);

  if (!light || light.state !== 'on' || !loaded) return;
  return colors.map((color, index) => {
    if (!lightConfig?.layer?.[color]) return;
    return (
      <Box
        component="img"
        key={color}
        src={lightConfig?.layer[color]}
        sx={{
          zIndex: 10,
          mixBlendMode: 'lighten',
          opacity:
            light.state === 'on'
              ? ((light.custom.color?.[index] ?? 0) / 255) *
                ((light.custom.brightnessValue ?? 100) / 100)
              : 0,
        }}
      />
    );
  });
}
