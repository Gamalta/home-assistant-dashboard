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
  /** Scripts Home Assistant lancés d'un appui, en colonne contre la barre latérale. */
  scenarios?: FilterByDomain<EntityName, 'script'>[];
  /** Prêts ouverts par les entrées « Crédit » du menu des scénarios. */
  mortgages?: MortgageConfigType[];
  /** Cartes du carrousel, sous les personnes. */
  shortcuts?: ShortcutConfigType[];
};

type ShortcutConfigType = MediaShortcutConfigType;

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

type MortgageConfigType = Mortgage & {
  /** Libellé de l'entrée du menu, pour distinguer plusieurs prêts. */
  label?: string;
};
