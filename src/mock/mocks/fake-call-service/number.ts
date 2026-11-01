import type {ServiceArgs} from './types';

export function numberUpdates({
  now,
  target,
  service,
  serviceData,
  setEntities,
}: ServiceArgs<'number', 'setValue'>) {
  if (typeof target !== 'string' || service !== 'setValue') return true;
  return setEntities(entities => ({
    ...entities,
    [target]: {
      ...entities[target],
      last_changed: now,
      last_updated: now,
      state: String(serviceData.value),
    },
  }));
}
