import {HassEntityWithService} from '@hakit/core';
import {LightConfig} from '../config';

type RoomLightImage = {
  parameters: {
    light: HassEntityWithService<'light'> | null;
    config?: LightConfig;
  };
};

export function RoomLightImage(props: RoomLightImage) {
  const {
    parameters: {light, config},
  } = props;

  if (!light || light.state !== 'on') return;

  return ['red', 'green', 'blue'].map((color, index) => (
    <img
      key={color}
      src={config?.layer[color as 'red' | 'green' | 'blue']}
      style={{
        mixBlendMode: 'lighten',
        opacity:
          ((light.attributes.rgb_color?.[index] ?? 0) / 255) *
          ((light.attributes.brightness ?? 255) / 255),
      }}
    />
  ));
}
