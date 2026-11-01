import type {HassEntities, HassEntity} from 'home-assistant-js-websocket';
import {describe, expect, it} from 'vitest';
import type {AlertsConfigType} from '../configs/sidebar';
import {getHouseAlerts} from './alerts';

const entity = (
  entity_id: string,
  state: string,
  attributes: HassEntity['attributes'] = {},
) => ({[entity_id]: {entity_id, state, attributes} as HassEntity});

const entities: HassEntities = {
  ...entity('binary_sensor.smoke', 'off', {
    friendly_name: 'Détecteur du couloir',
    device_class: 'smoke',
  }),
  ...entity('binary_sensor.heat', 'off', {
    friendly_name: 'Détecteur du couloir',
    device_class: 'heat',
  }),
  ...entity('binary_sensor.remote_battery_low', 'off', {
    friendly_name: 'Télécommande',
  }),
  ...entity('sensor.button_battery', '12', {friendly_name: 'Bouton'}),
  ...entity('sensor.thermometer_battery', '20', {
    friendly_name: 'Thermomètre',
  }),
  ...entity('binary_sensor.wan', 'on'),
  ...entity('binary_sensor.zigbee', 'on'),
  ...entity('sensor.tablet_battery_state', 'charging'),
};

// Remplace l'état d'une entité, comme le ferait Home Assistant.
const set = (entityId: string, state: string): HassEntities => ({
  ...entities,
  [entityId]: {...entities[entityId], state},
});

const labels = (all: HassEntities, config: AlertsConfigType) =>
  getHouseAlerts(all, config).map(alert => alert.label);

describe('getHouseAlerts', () => {
  it('ne signale rien quand tout va bien', () => {
    expect(
      getHouseAlerts(set('sensor.button_battery', '80'), {
        smokeEntityIds: ['binary_sensor.smoke', 'binary_sensor.heat'],
        batteryLowEntityIds: ['binary_sensor.remote_battery_low'],
        batteryLevelEntityIds: ['sensor.button_battery'],
        internetEntityId: 'binary_sensor.wan',
        zigbeeEntityId: 'binary_sensor.zigbee',
        tabletBatteryStateEntityId: 'sensor.tablet_battery_state',
      }),
    ).toEqual([]);
  });

  it('signale la fumée et la chaleur en critique', () => {
    const config: AlertsConfigType = {
      smokeEntityIds: ['binary_sensor.smoke', 'binary_sensor.heat'],
    };

    expect(getHouseAlerts(set('binary_sensor.smoke', 'on'), config)).toEqual([
      {
        entityId: 'binary_sensor.smoke',
        severity: 'critical',
        label: 'Fumée détectée : Détecteur du couloir',
      },
    ]);
    expect(labels(set('binary_sensor.heat', 'on'), config)).toEqual([
      'Chaleur détectée : Détecteur du couloir',
    ]);
  });

  it('signale une pile faible par un binary_sensor à on', () => {
    expect(
      labels(set('binary_sensor.remote_battery_low', 'on'), {
        batteryLowEntityIds: ['binary_sensor.remote_battery_low'],
      }),
    ).toEqual(['Pile faible : Télécommande']);
  });

  it('signale une pile sous le seuil, 20 % par défaut', () => {
    const config: AlertsConfigType = {
      batteryLevelEntityIds: [
        'sensor.button_battery',
        'sensor.thermometer_battery',
      ],
    };

    expect(labels(entities, config)).toEqual(['Pile faible : Bouton (12 %)']);
    expect(labels(entities, {...config, batteryThreshold: 25})).toEqual([
      'Pile faible : Bouton (12 %)',
      'Pile faible : Thermomètre (20 %)',
    ]);
  });

  it('ignore un niveau de pile inconnu', () => {
    expect(
      labels(set('sensor.button_battery', 'unknown'), {
        batteryLevelEntityIds: ['sensor.button_battery'],
      }),
    ).toEqual([]);
  });

  it('signale internet coupé, le pont Zigbee déconnecté et la tablette qui ne charge pas', () => {
    const all = {
      ...entities,
      ...entity('binary_sensor.wan', 'off'),
      ...entity('binary_sensor.zigbee', 'off'),
      ...entity('sensor.tablet_battery_state', 'discharging'),
    };

    expect(
      labels(all, {
        internetEntityId: 'binary_sensor.wan',
        zigbeeEntityId: 'binary_sensor.zigbee',
        tabletBatteryStateEntityId: 'sensor.tablet_battery_state',
      }),
    ).toEqual([
      'Internet coupé',
      'Pont Zigbee déconnecté',
      'La tablette murale ne charge pas',
    ]);
  });

  it('signale une entité indisponible ou absente', () => {
    expect(
      labels(set('sensor.button_battery', 'unavailable'), {
        batteryLevelEntityIds: ['sensor.button_battery'],
        zigbeeEntityId: 'binary_sensor.missing',
      }),
    ).toEqual([
      'Indisponible : Bouton',
      'Indisponible : binary_sensor.missing',
    ]);
  });

  it('trie les alertes critiques en premier', () => {
    const alerts = getHouseAlerts(set('binary_sensor.smoke', 'on'), {
      batteryLevelEntityIds: ['sensor.button_battery'],
      smokeEntityIds: ['binary_sensor.smoke'],
    });

    expect(alerts.map(alert => alert.severity)).toEqual([
      'critical',
      'warning',
    ]);
  });
});
