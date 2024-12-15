import {useEntity} from '@hakit/core';
import type {LightConfigType} from '../../../configs/house';
import Box from '@mui/material/Box';

type RoomLightImage = {
  lightConfig: LightConfigType | Omit<LightConfigType, 'type'>;
};

export function RoomLightImage(props: RoomLightImage) {
  const {lightConfig} = props;
  const light = useEntity(lightConfig.entity_id, {returnNullIfNotFound: true});

  if (!light) return;
  return ['red', 'green', 'blue'].map((color, index) => (
    <Box
      component="img"
      key={color}
      src={lightConfig?.layer[color as 'red' | 'green' | 'blue']}
      sx={{
        mixBlendMode: 'lighten',
        opacity:
          light.state === 'on'
            ? ((light.attributes.rgb_color?.[index] ?? 0) / 255) *
              ((light.attributes.brightness ?? 255) / 255)
            : 0,
      }}
    />
  ));
}
