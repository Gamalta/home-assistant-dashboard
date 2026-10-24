import {FilterByDomain, EntityName} from '@hakit/core';

type SideBarConfigType = {
  weatherEntityId: FilterByDomain<EntityName, 'weather'>;
  persons: [PersonConfigType, PersonConfigType];
  pets?: [string, string];
  alerts?: AlertsConfigType;
  system?: {
    uptimeEntityId?: FilterByDomain<EntityName, 'sensor'>;
    powerStatusEntityId?: FilterByDomain<EntityName, 'binary_sensor'>;
    graphs: SystemGraphConfigType[];
  };
};

type SystemGraphConfigType = {
  color: string;
  label: string;
  sensorEntityId: FilterByDomain<EntityName, 'sensor'>;
};

type PersonConfigType = {
  name: string;
  avatar: string;
  personEntityId: string;
  homeZoneEntityId?: FilterByDomain<EntityName, 'zone'>;
  homeDistanceEntityId?: FilterByDomain<EntityName, 'sensor'>;
  workZoneEntityId?: FilterByDomain<EntityName, 'zone'>;
  focusEntityId?: FilterByDomain<EntityName, 'binary_sensor'>;
  batteryLevelEntityId?: FilterByDomain<EntityName, 'sensor'>;
  batteryStateEntityId?: FilterByDomain<EntityName, 'sensor'>;
};

type AlertsConfigType = {
  /** Détecteurs de fumée et de chaleur : `on` est une alerte critique. */
  smokeEntityIds?: FilterByDomain<EntityName, 'binary_sensor'>[];
  /** Piles faibles signalées par un `binary_sensor` à `on`. */
  batteryLowEntityIds?: FilterByDomain<EntityName, 'binary_sensor'>[];
  /** Niveaux de pile en %, signalés sous `batteryThreshold` (20 par défaut). */
  batteryLevelEntityIds?: FilterByDomain<EntityName, 'sensor'>[];
  batteryThreshold?: number;
  /** Connexion WAN de la box : `off` est une coupure. */
  internetEntityId?: FilterByDomain<EntityName, 'binary_sensor'>;
  /** Connexion du pont Zigbee : `off` est une déconnexion. */
  zigbeeEntityId?: FilterByDomain<EntityName, 'binary_sensor'>;
  /** État de charge de la tablette murale (application Companion Android). */
  tabletBatteryStateEntityId?: FilterByDomain<EntityName, 'sensor'>;
};
