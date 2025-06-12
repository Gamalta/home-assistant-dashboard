import {useEntity} from '@hakit/core';
import type {LightConfigType} from '../../../configs/house';
import Box from '@mui/material/Box';

type RoomLightImage = {
  lightConfig: LightConfigType;
};

export function RoomLightImage(props: RoomLightImage) {
  const {lightConfig} = props;
  const light = useEntity(lightConfig.lightEntityId, {
    returnNullIfNotFound: true,
  });

  if (!light) return;
  return (['red', 'green', 'blue'] as const).map((color, index) => {
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
              ? ((light.attributes.rgb_color?.[index] ?? 0) / 255) *
                ((light.attributes.brightness ?? 255) / 255)
              : 0,
        }}
      />
    );
  });
}
