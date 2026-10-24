import {FilterByDomain, EntityName} from '@hakit/core';
import type {Mortgage} from '../utils/mortgage';

type SideBarConfigType = {
  weatherEntityId: FilterByDomain<EntityName, 'weather'>;
  persons: [PersonConfigType, PersonConfigType];
  pets?: [string, string];
  alerts?: AlertsConfigType;
  system?: {
    uptimeEntityId?: FilterByDomain<EntityName, 'sensor'>;
    powerStatusEntityId?: FilterByDomain<EntityName, 'binary_sensor'>;
    internetEntityId?: FilterByDomain<EntityName, 'binary_sensor'>;
    lastBackupEntityId?: FilterByDomain<EntityName, 'sensor'>;
    lastBackupAttemptEntityId?: FilterByDomain<EntityName, 'sensor'>;
    nextBackupEntityId?: FilterByDomain<EntityName, 'sensor'>;
    backupStateEntityId?: FilterByDomain<EntityName, 'sensor'>;
    tabletBatteryLevelEntityId?: FilterByDomain<EntityName, 'sensor'>;
    tabletBatteryStateEntityId?: FilterByDomain<EntityName, 'sensor'>;
    tabletChargerTypeEntityId?: FilterByDomain<EntityName, 'sensor'>;
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

type ShortcutConfigType =
  | MediaShortcutConfigType
  | MortgageShortcutConfigType
  | ShoppingListShortcutConfigType
  | TrainsShortcutConfigType
  | EnergyShortcutConfigType;

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

type EnergyShortcutConfigType = {
  type: 'energy';
  /** Puissance instantanée, en VA (PAPP du Linky) ou en W. */
  powerEntityId: FilterByDomain<EntityName, 'sensor'>;
  /** Période tarifaire en cours (PTEC du Linky : « HP.. », « HC.. »). */
  tariffPeriodEntityId: FilterByDomain<EntityName, 'sensor'>;
  /** Index heures pleines et heures creuses, avec statistiques à long terme (`state_class: total_increasing`). */
  peakIndexEntityId: FilterByDomain<EntityName, 'sensor'>;
  offPeakIndexEntityId: FilterByDomain<EntityName, 'sensor'>;
  /** Intensité souscrite en A (ISOUSC du Linky), pour afficher la charge en cours. */
  subscribedCurrentEntityId?: FilterByDomain<EntityName, 'sensor'>;
  /** Prix du kWh en euros, en heures pleines et en heures creuses. */
  prices: {peak: number; offPeak: number};
};

type SystemGraphConfigType = {
  /** Couleur de la palette (`'warning'`, `'info'`…) ou couleur CSS. */
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

type MortgageShortcutConfigType = Mortgage & {
  type: 'mortgage';
  /** Libellé de la tuile, pour distinguer plusieurs prêts. */
  label?: string;
};

type ShoppingListShortcutConfigType = {
  type: 'shoppingList';
  todoEntityId: `todo.${string}`;
  /** Libellé de la tuile, `Courses` par défaut. */
  label?: string;
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
