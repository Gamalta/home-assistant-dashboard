import {FilterByDomain, EntityName} from '@hakit/core';

type SideBarConfigType = {
  weatherEntityId: FilterByDomain<EntityName, 'weather'>;
  persons: [PersonConfigType, PersonConfigType];
  pets?: [string, string];
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
