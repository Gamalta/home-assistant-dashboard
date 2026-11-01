import type {HassEntities} from 'home-assistant-js-websocket';
import {vacuumEntityIds} from '../../../utils/entity/vacuum';
import type {ServiceArgs} from './types';

let dockingTimeout: NodeJS.Timeout;

// État de l'entité et état détaillé (`vacuum_state`) après chaque service.
const VACUUM_STATES: Record<string, [state: string, vacuumState: string]> = {
  start: ['cleaning', 'sweeping_and_mopping'],
  vacuum_clean_segment: ['cleaning', 'sweeping_and_mopping'],
  pause: ['paused', 'paused'],
  stop: ['idle', 'idle'],
  returnToBase: ['returning', 'returning'],
};

// Reçoit aussi `dreame_vacuum.vacuum_clean_segment`, absent des types de @hakit/core.
export function vacuumUpdates({
  now,
  target,
  service,
  serviceData,
  setEntities,
}: ServiceArgs<'vacuum'>) {
  const states = VACUUM_STATES[service as string];
  if (typeof target !== 'string' || !states) return true;

  const {map} = vacuumEntityIds(target.replace('vacuum.', ''));
  const dates = {last_changed: now, last_updated: now};
  const update = (
    entities: HassEntities,
    [state, vacuumState]: [string, string],
  ) => ({
    ...entities,
    [target]: {
      ...entities[target],
      ...dates,
      state,
      attributes: {
        ...entities[target].attributes,
        vacuum_state: vacuumState,
        charging: state === 'docked',
      },
    },
  });

  clearTimeout(dockingTimeout);
  if (service === 'returnToBase')
    dockingTimeout = setTimeout(
      () => setEntities(entities => update(entities, ['docked', 'charging'])),
      5000,
    );
  if (service !== ('vacuum_clean_segment' as string))
    return setEntities(entities => update(entities, states));

  const {segments} = serviceData as {segments: number[]};
  return setEntities(entities => {
    const cleaning = update(entities, states);
    return {
      ...cleaning,
      [target]: {
        ...cleaning[target],
        attributes: {
          ...cleaning[target].attributes,
          cleaning_progress: 0,
          cleaned_area: 0,
          cleaning_time: 0,
          current_segment: segments[0],
        },
      },
      [map]: {
        ...entities[map],
        ...dates,
        attributes: {
          ...entities[map].attributes,
          active_segments: segments,
          completed_segments: [],
        },
      },
    };
  });
}
