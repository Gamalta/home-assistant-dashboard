import {FilterByDomain, EntityName} from '@hakit/core';
import type {Mortgage} from '../utils/mortgage';

type SideBarConfigType = {
  weatherEntityId: FilterByDomain<EntityName, 'weather'>;
  persons: [PersonConfigType, PersonConfigType];
  pets?: [string, string];
  system?: {
    uptimeEntityId?: FilterByDomain<EntityName, 'sensor'>;
    powerStatusEntityId?: FilterByDomain<EntityName, 'binary_sensor'>;
    graphs: SystemGraphConfigType[];
  };
  shortcuts?: ShortcutConfigType[];
};

type ShortcutConfigType =
  | AllLightsOffShortcutConfigType
  | MortgageShortcutConfigType;

type AllLightsOffShortcutConfigType = {
  type: 'allLightsOff';
  /** Script Home Assistant à lancer à la place de l'extinction des lumières de la maison. */
  scriptEntityId?: FilterByDomain<EntityName, 'script'>;
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

type MortgageShortcutConfigType = Mortgage & {
  type: 'mortgage';
  /** Libellé de la tuile, pour distinguer plusieurs prêts. */
  label?: string;
};
