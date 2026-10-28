import type {HassEntities} from 'home-assistant-js-websocket';
import {
  EXTERNAL_SOURCES,
  SOLID_EFFECT,
  VIDEO_EFFECT,
  ambilightEntityIds,
} from '../../utils/entity/ambilight';
import {createCamera} from './createCamera';
import {createLight} from './createLight';

// Instance HyperHDR fictive, en capture vidéo, et ses caméras de l'image et des LED.
export function createAmbilight(lightEntityId: string): HassEntities {
  const ids = ambilightEntityIds(lightEntityId);

  return {
    ...createLight(lightEntityId, {
      state: 'off',
      attributes: {
        friendly_name: 'Ambilight',
        supported_color_modes: ['hs'],
        color_mode: 'hs',
        hs_color: [0, 0],
        rgb_color: [255, 255, 255],
        supported_features: 4,
        effect: VIDEO_EFFECT,
        effect_list: [
          SOLID_EFFECT,
          ...EXTERNAL_SOURCES,
          'Atomic swirl',
          'Breath',
          'Candle',
          'Fire',
          'Knight rider',
          'Plasma',
          'Rainbow swirl',
          'Sea waves',
        ],
      },
    }),
    ...createCamera(ids.image, {
      attributes: {
        friendly_name: 'Ambilight LED Colors',
        entity_picture: '/ambilight/demo-tv-image.svg',
      },
    }),
    ...createCamera(ids.leds, {
      attributes: {
        friendly_name: 'Ambilight LED Gradient',
        entity_picture: '/ambilight/demo-led-gradient.svg',
      },
    }),
  };
}
