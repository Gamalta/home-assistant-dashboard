import {HassEntity} from 'home-assistant-js-websocket';
import {createEntity} from './createEntity';

const now = new Date();

const defaults = {
  entity_id: 'update.home_assistant_core_update',
  state: 'off',
  attributes: {
    friendly_name: 'Home Assistant Core',
    installed_version: '2026.10.1',
    latest_version: '2026.10.1',
  },
  context: {
    id: '01H4JAXGF1RTA2MJGGPGAGM7VD',
    parent_id: null,
    user_id: null,
  },
  last_changed: now.toISOString(),
  last_updated: now.toISOString(),
} satisfies HassEntity;

export const createUpdate = (
  entity_id: string,
  overrides: Partial<HassEntity> = {},
) => {
  return createEntity(entity_id, defaults, overrides);
};
