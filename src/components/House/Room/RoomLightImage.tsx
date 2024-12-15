import {useEntity} from '@hakit/core';
import type {LightConfigType} from '../../../configs/house';

type RoomLightImage = {
  lightConfig: Omit<LightConfigType, 'type'>;
};

export function RoomLightImage(props: RoomLightImage) {
  const {lightConfig} = props;
  const light = useEntity(lightConfig.entity_id, {returnNullIfNotFound: true});

  if (!light || light.state !== 'on') return;
  return ['red', 'green', 'blue'].map((color, index) => (
    <img
      key={color}
      src={lightConfig?.layer[color as 'red' | 'green' | 'blue']}
      style={{
        mixBlendMode: 'lighten',
        opacity:
          ((light.attributes.rgb_color?.[index] ?? 0) / 255) *
          ((light.attributes.brightness ?? 255) / 255),
      }}
    />
  ));
}
