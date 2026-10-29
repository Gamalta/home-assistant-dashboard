import type {HassEntities} from 'home-assistant-js-websocket';
import {lightExtraEntityIds} from '../../utils/entity/light';
import {createLight} from './createLight';

const now = new Date().toISOString();

function entity(entity_id: string, state: string, attributes: object) {
  return {
    [entity_id]: {
      entity_id,
      state,
      attributes,
      context: {id: '', parent_id: null, user_id: null},
      last_changed: now,
      last_updated: now,
    },
  };
}

// Bandeau WLED fictif, avec les réglages que l'intégration crée à côté de la lumière.
export function createWledStrip(lightEntityId: string): HassEntities {
  const ids = lightExtraEntityIds(lightEntityId);
  const range = {min: 0, max: 255, step: 1, mode: 'slider'};

  return {
    ...createLight(lightEntityId, {
      state: 'off',
      attributes: {
        friendly_name: 'Bandeau LED',
        icon: 'hue:lightstrip',
        supported_color_modes: ['rgb'],
        color_mode: 'rgb',
        rgb_color: [255, 160, 0],
        hs_color: [38, 100],
        effect: 'Solid',
        effect_list: [
          'Solid',
          'Blink',
          'Breathe',
          'Chase',
          'Colorloop',
          'Fire 2012',
          'Fireworks',
          'Lake',
          'Meteor',
          'Pacifica',
          'Rainbow',
          'Twinkle',
        ],
      },
    }),
    ...entity(ids.preset, 'unknown', {
      options: ['Cinéma', 'Lecture', 'Soirée'],
    }),
    ...entity(ids.playlist, 'unknown', {options: ['Ambiance', 'Fête']}),
    ...entity(ids.palette, 'Default', {
      options: ['Default', 'Forest', 'Lava', 'Ocean', 'Party', 'Rainbow'],
    }),
    ...entity(ids.speed, '128', range),
    ...entity(ids.intensity, '128', range),
  };
}
