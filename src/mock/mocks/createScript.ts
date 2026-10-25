import {HassEntity} from 'home-assistant-js-websocket';
import {createEntity} from './createEntity';

const now = new Date();

const defaults = {
  attributes: {
    friendly_name: 'Script',
    icon: 'mdi:script-text-outline',
  },
  state: 'off',
  entity_id: 'script.fake_script',
  last_changed: now.toISOString(),
  last_updated: now.toISOString(),
  context: {
    id: '',
    user_id: null,
    parent_id: null,
  },
} satisfies HassEntity;

export const createScript = (
  entity_id: string,
  overrides: Partial<HassEntity> = {},
) => {
  return createEntity(entity_id, defaults, overrides);
};
