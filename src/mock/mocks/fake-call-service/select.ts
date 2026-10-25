import type {ServiceArgs} from './types';

export function selectUpdates({
  now,
  target,
  service,
  serviceData,
  setEntities,
}: ServiceArgs<'select', 'selectOption'>) {
  if (typeof target !== 'string' || service !== 'selectOption') return true;
  return setEntities(entities => ({
    ...entities,
    [target]: {
      ...entities[target],
      last_changed: now,
      last_updated: now,
      state: String(serviceData.option),
    },
  }));
}
