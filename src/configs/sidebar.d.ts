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
  | MortgageShortcutConfigType
  | ShoppingListShortcutConfigType
  | TrainsShortcutConfigType;

type AllLightsOffShortcutConfigType = {
  type: 'allLightsOff';
  /** Script Home Assistant à lancer à la place de l'extinction des lumières de la maison. */
  scriptEntityId?: FilterByDomain<EntityName, 'script'>;
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
