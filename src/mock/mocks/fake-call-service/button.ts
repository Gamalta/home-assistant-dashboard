import {printer3dEntityIds} from '../../../utils/entity/printer3d';
import type {ServiceArgs} from './types';

// État et étape de l'imprimante 3D après chacun de ses boutons. Un arrêt
// remonte en `failed` chez ha-bambulab.
const PRINTER3D_BUTTONS: Record<string, [status: string, stage: string]> = {
  pause: ['pause', 'paused_user'],
  resume: ['running', 'printing'],
  stop: ['failed', 'idle'],
};

export function buttonUpdates({
  now,
  target,
  setEntities,
}: ServiceArgs<'button'>) {
  const match =
    typeof target === 'string' &&
    target.match(/^button\.(.+)_(pause|resume|stop)$/);
  if (!match) return true;

  const {status, stage} = printer3dEntityIds(match[1]);
  const [statusState, stageState] = PRINTER3D_BUTTONS[match[2]];
  const dates = {last_changed: now, last_updated: now};
  return setEntities(entities => {
    if (!entities[status]) return entities;
    return {
      ...entities,
      [status]: {...entities[status], ...dates, state: statusState},
      [stage]: {...entities[stage], ...dates, state: stageState},
    };
  });
}
