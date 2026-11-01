import type {HassEntities} from 'home-assistant-js-websocket';
import {vacuumEntityIds} from '../../utils/entity/vacuum';

const now = new Date().toISOString();

function entity(entity_id: string, state: string, attributes = {}) {
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

// Pièces de `public/vacuum/demo_map.svg`, centres en millimètres.
const rooms = {
  1: {room_id: 1, name: 'Séjour', x: -1300, y: -2600},
  2: {room_id: 2, name: 'Salle à manger', x: 300, y: 2100},
  3: {room_id: 3, name: 'Cuisine', x: -500, y: 5400},
  4: {room_id: 4, name: 'Couloir', x: 3300, y: 300},
  5: {room_id: 5, name: 'Chambre', x: -5300, y: -3200},
  6: {room_id: 6, name: 'Chambre 2', x: 5400, y: 4100},
  7: {room_id: 7, name: 'Chambre 3', x: 6000, y: -2100},
  8: {room_id: 8, name: 'Entrée', x: 1500, y: -3700},
};

// Aspirateur dreame-vacuum fictif, qui lave le séjour après la cuisine.
export function createVacuum(prefix: string): HassEntities {
  const ids = vacuumEntityIds(prefix);

  return {
    ...entity(ids.vacuum, 'cleaning', {
      friendly_name: 'Aspirateur',
      vacuum_state: 'sweeping_and_mopping',
      battery: 64,
      charging: false,
      cleaning_progress: 45,
      cleaned_area: 12,
      cleaning_time: 18,
      current_segment: 1,
      main_brush_left: 78,
      side_brush_left: 64,
      filter_left: 52,
      mop_pad_left: 12,
      sensor_dirty_left: 90,
    }),
    ...entity(ids.map, now, {
      entity_picture: 'vacuum/demo_map.svg',
      calibration_points: [
        {vacuum: {x: 0, y: 0}, map: {x: 310, y: 300}},
        {vacuum: {x: 1000, y: 0}, map: {x: 350, y: 300}},
        {vacuum: {x: 0, y: 1000}, map: {x: 310, y: 260}},
      ],
      rooms,
      active_segments: [3, 1, 2, 4],
      completed_segments: [3],
    }),
    ...entity(ids.cleaningMode, 'sweeping_and_mopping', {
      options: [
        'sweeping',
        'mopping',
        'sweeping_and_mopping',
        'mopping_after_sweeping',
      ],
    }),
    ...entity(ids.suctionLevel, 'standard', {
      options: ['quiet', 'standard', 'strong', 'turbo'],
    }),
    ...entity(ids.error, 'no_error', {description: 'Aucune erreur'}),
  };
}
