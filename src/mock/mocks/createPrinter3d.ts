import type {HassEntities} from 'home-assistant-js-websocket';
import {printer3dEntityIds} from '../../utils/entity/printer3d';

const now = new Date();
const remainingHours = 1.25;

function entity(entity_id: string, state: string, attributes = {}) {
  return {
    [entity_id]: {
      entity_id,
      state,
      attributes,
      context: {id: '', parent_id: null, user_id: null},
      last_changed: now.toISOString(),
      last_updated: now.toISOString(),
    },
  };
}

// Imprimante ha-bambulab fictive, sans AMS, au milieu d'une impression.
export function createPrinter3d(prefix: string): HassEntities {
  const ids = printer3dEntityIds(prefix);
  const endTime = new Date(now.getTime() + remainingHours * 3_600_000);
  const celsius = {unit_of_measurement: '°C'};

  return {
    ...entity(ids.chamberLight, 'on'),
    ...entity(ids.progress, '42', {unit_of_measurement: '%'}),
    ...entity(ids.status, 'running'),
    ...entity(ids.stage, 'printing'),
    ...entity(ids.remainingTime, String(remainingHours), {
      unit_of_measurement: 'h',
    }),
    ...entity(ids.endTime, endTime.toISOString()),
    ...entity(ids.currentLayer, '126'),
    ...entity(ids.totalLayers, '300'),
    ...entity(ids.taskName, 'Support de téléphone'),
    ...entity(ids.nozzleTemperature, '219', celsius),
    ...entity(ids.nozzleTargetTemperature, '220', celsius),
    ...entity(ids.bedTemperature, '55', celsius),
    ...entity(ids.bedTargetTemperature, '55', celsius),
    ...entity(ids.wifiSignal, '-52', {unit_of_measurement: 'dBm'}),
    ...entity(ids.externalSpool, 'Generic PLA', {
      type: 'PLA',
      color: '#F2A93BFF',
      empty: false,
    }),
    ...entity(ids.printingSpeed, 'standard', {
      options: ['silent', 'standard', 'sport', 'ludicrous'],
    }),
    ...entity(ids.pause, 'unknown'),
    ...entity(ids.resume, 'unknown'),
    ...entity(ids.stop, 'unknown'),
    ...entity(ids.coverImage, now.toISOString(), {
      entity_picture: 'printer3d/demo_cover.svg',
    }),
    ...entity(ids.online, 'on'),
    ...entity(ids.hmsErrors, 'off'),
    ...entity(ids.printError, 'off'),
  };
}
