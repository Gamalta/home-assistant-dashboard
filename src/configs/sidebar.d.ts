import {FilterByDomain, EntityName} from '@hakit/core';

type SideBarConfigType = {
  weatherEntityId: FilterByDomain<EntityName, 'weather'>;
  persons: [PersonConfigType, PersonConfigType];
  pets?: [string, string];
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

type ShortcutConfigType =
  | MediaShortcutConfigType
  | ShoppingListShortcutConfigType;

type MediaShortcutConfigType = {
  type: 'media';
  mediaPlayerEntityId: FilterByDomain<EntityName, 'media_player'>;
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

type ShoppingListShortcutConfigType = {
  type: 'shoppingList';
  todoEntityId: `todo.${string}`;
  /** Libellé de la tuile, `Courses` par défaut. */
  label?: string;
};
