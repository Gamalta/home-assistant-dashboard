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
  /** Boutons ronds de l'en-tête, à côté de l'heure. */
  actions?: ActionConfigType[];
  /** Cartes du carrousel, sous les personnes. */
  shortcuts?: ShortcutConfigType[];
};

type ActionConfigType = AllLightsOffActionConfigType;

type AllLightsOffActionConfigType = {
  type: 'allLightsOff';
  /** Script Home Assistant à lancer à la place de l'extinction des lumières de la maison. */
  scriptEntityId?: FilterByDomain<EntityName, 'script'>;
};

type ShortcutConfigType = MediaShortcutConfigType | TrainsShortcutConfigType;

type MediaShortcutConfigType = {
  type: 'media';
  mediaPlayerEntityId: FilterByDomain<EntityName, 'media_player'>;
};

type TrainsShortcutConfigType = {
  type: 'trains';
  label: string;
  /** Début des capteurs sncf_trains du trajet : `sncf_paris_lyon` pour `sensor.sncf_paris_lyon_train_1`. */
  prefix: string;
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
