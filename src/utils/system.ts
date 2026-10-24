import {timeAgo} from '@hakit/core';
import type {HassEntities} from 'home-assistant-js-websocket';

// Une entité `update` passe à `on` quand une nouvelle version est disponible.
export function getPendingUpdates(entities: HassEntities) {
  return Object.values(entities).filter(
    entity => entity.entity_id.startsWith('update.') && entity.state === 'on',
  );
}

// Application Companion Android : `discharging` veut dire débranchée.
// `not_charging` (branchée, charge en pause) est normal sur une tablette murale.
export const isUnplugged = (batteryState: string) =>
  batteryState === 'discharging';

// État d'un capteur `timestamp` en relatif : « il y a 3 jours », « demain ».
export function formatRelative(state: string) {
  const date = new Date(state);
  // timeAgo écrit une erreur console sur une date invalide (`unknown`).
  return isNaN(date.getTime()) ? undefined : timeAgo(date, 'fr');
}

// Même règle que l'interface de Home Assistant : la dernière tentative est
// plus récente que la dernière réussite. Une tentative en cours ne compte pas.
export function hasBackupFailed(
  lastSuccess = '',
  lastAttempt = '',
  managerState?: string,
) {
  const attempt = Date.parse(lastAttempt);
  if (isNaN(attempt) || managerState === 'create_backup') return false;
  const success = Date.parse(lastSuccess);
  return isNaN(success) || attempt > success;
}
