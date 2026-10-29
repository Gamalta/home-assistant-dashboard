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
  /** Scripts Home Assistant lancés d'un appui depuis le menu rapide. */
  scenarios?: FilterByDomain<EntityName, 'script'>[];
  /**
   * Prêts réunis dans l'entrée « Crédit » du menu rapide : des entités dont
   * l'attribut `amortization` donne le tableau d'amortissement.
   */
  mortgages?: FilterByDomain<EntityName, 'sensor'>[];
  /** Liste `todo` ouverte par l'entrée « Courses » du menu rapide. */
  shoppingListEntityId?: `todo.${string}`;
  /** Cartes du carrousel, sous les personnes. */
  shortcuts?: ShortcutConfigType[];
};

type ShortcutConfigType = MediaShortcutConfigType | EnergyShortcutConfigType;

type MediaShortcutConfigType = {
  type: 'media';
  mediaPlayerEntityId: FilterByDomain<EntityName, 'media_player'>;
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
