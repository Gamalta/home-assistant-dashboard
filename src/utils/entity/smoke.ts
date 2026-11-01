import type {Led} from '../../theme/Leds';
import {batteryLevel, isBatteryLow} from './battery';

export type SmokeStatus = 'smoke' | 'heat' | 'unavailable' | 'warning' | 'ok';

type SmokeStates = {
  smoke?: string;
  heat?: string;
  battery?: string;
  batteryLow?: string;
  tamper?: string;
};

export const SMOKE_STATUSES: Record<SmokeStatus, {label: string; led: Led}> = {
  smoke: {label: 'Fumée détectée !', led: 'red'},
  heat: {label: 'Chaleur détectée !', led: 'red'},
  unavailable: {label: 'Détecteur indisponible', led: 'off'},
  warning: {label: 'Aucune fumée', led: 'orange'},
  ok: {label: 'Aucune fumée', led: 'green'},
};

// Du plus grave au moins grave : une alarme passe avant tout le reste.
export function smokeStatus(states: SmokeStates): SmokeStatus {
  if (states.smoke === 'on') return 'smoke';
  if (states.heat === 'on') return 'heat';
  if (states.smoke !== 'off') return 'unavailable';
  if (
    states.batteryLow === 'on' ||
    states.tamper === 'on' ||
    isBatteryLow(batteryLevel(states.battery))
  )
    return 'warning';
  return 'ok';
}
