import type {HassEntities, HassEntity} from 'home-assistant-js-websocket';
import type {AlertsConfigType} from '../configs/sidebar';
import {isUnplugged} from './tablet';

export type HouseAlert = {
  entityId: string;
  severity: 'critical' | 'warning';
  label: string;
};

const name = (entity: HassEntity) =>
  entity.attributes.friendly_name ?? entity.entity_id;

// Alertes des entités configurées, les critiques en premier.
export function getHouseAlerts(
  entities: HassEntities,
  config: AlertsConfigType,
): HouseAlert[] {
  const {batteryThreshold = 20} = config;
  const alerts: HouseAlert[] = [];

  // Une entité absente ou indisponible est signalée, quelle que soit sa règle.
  const check = (
    entityId: string | undefined,
    test: (entity: HassEntity) => boolean,
    label: (entity: HassEntity) => string,
    severity: HouseAlert['severity'] = 'warning',
  ) => {
    if (!entityId) return;
    const entity = entities[entityId];
    if (!entity || entity.state === 'unavailable') {
      alerts.push({
        entityId,
        severity: 'warning',
        label: `Indisponible : ${entity ? name(entity) : entityId}`,
      });
    } else if (test(entity)) {
      alerts.push({entityId, severity, label: label(entity)});
    }
  };
  const isOn = (entity: HassEntity) => entity.state === 'on';
  const isOff = (entity: HassEntity) => entity.state === 'off';

  config.smokeEntityIds?.forEach(id =>
    check(
      id,
      isOn,
      entity =>
        `${entity.attributes.device_class === 'heat' ? 'Chaleur' : 'Fumée'} détectée : ${name(entity)}`,
      'critical',
    ),
  );
  config.batteryLowEntityIds?.forEach(id =>
    check(id, isOn, entity => `Pile faible : ${name(entity)}`),
  );
  config.batteryLevelEntityIds?.forEach(id =>
    check(
      id,
      entity => Number(entity.state) < batteryThreshold,
      entity => `Pile faible : ${name(entity)} (${entity.state} %)`,
    ),
  );
  check(config.internetEntityId, isOff, () => 'Internet coupé');
  check(config.zigbeeEntityId, isOff, () => 'Pont Zigbee déconnecté');
  check(
    config.tabletBatteryStateEntityId,
    entity => isUnplugged(entity.state),
    () => 'La tablette murale ne charge pas',
  );

  // Tri stable : à gravité égale, l'ordre de la config est gardé.
  return alerts.sort(
    (a, b) =>
      Number(b.severity === 'critical') - Number(a.severity === 'critical'),
  );
}
