import {HassEntity} from 'home-assistant-js-websocket';
import {createEntity} from './createEntity';

const now = new Date();

const defaults = {
  attributes: {
    friendly_name: 'Remote',
  },
  state: 'on',
  entity_id: 'remote.fake_remote',
  last_changed: now.toISOString(),
  last_updated: now.toISOString(),
  context: {
    id: '',
    user_id: null,
    parent_id: null,
  },
} satisfies HassEntity;

export const createRemote = (
  entity_id: string,
  overrides: Partial<HassEntity> = {},
) => {
  return createEntity(entity_id, defaults, overrides);
};
