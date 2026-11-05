import {FilterByDomain, EntityName} from '@hakit/core';

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
  scenarios?: FilterByDomain<EntityName, 'script'>[];
  energy?: EnergyConfigType;
  mortgages?: FilterByDomain<EntityName, 'sensor'>[];
  shoppingListEntityId?: `todo.${string}`;
  shortcuts?: ShortcutConfigType[];
};

type ShortcutConfigType = MediaShortcutConfigType | TrainsShortcutConfigType;

type MediaShortcutConfigType = {
  type: 'media';
  mediaPlayerEntityId: FilterByDomain<EntityName, 'media_player'>;
};

type EnergyConfigType = {
  powerEntityId: FilterByDomain<EntityName, 'sensor'>;
  tariffPeriodEntityId: FilterByDomain<EntityName, 'sensor'>;
  peakIndexEntityId: FilterByDomain<EntityName, 'sensor'>;
  offPeakIndexEntityId: FilterByDomain<EntityName, 'sensor'>;
  subscribedCurrentEntityId?: FilterByDomain<EntityName, 'sensor'>;
  prices: {peak: number; offPeak: number};
  highSeasonPrices?: {peak: number; offPeak: number};
};

type TrainsShortcutConfigType = {
  type: 'trains';
  label: string;
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
  smokeEntityIds?: FilterByDomain<EntityName, 'binary_sensor'>[];
  batteryLowEntityIds?: FilterByDomain<EntityName, 'binary_sensor'>[];
  batteryLevelEntityIds?: FilterByDomain<EntityName, 'sensor'>[];
  batteryThreshold?: number;
  internetEntityId?: FilterByDomain<EntityName, 'binary_sensor'>;
  zigbeeEntityId?: FilterByDomain<EntityName, 'binary_sensor'>;
  tabletBatteryStateEntityId?: FilterByDomain<EntityName, 'sensor'>;
};
