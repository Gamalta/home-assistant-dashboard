import {FilterByDomain, EntityName} from '@hakit/core';

type Position3dType = {x: number; y: number; z: number};

type HouseConfigType = {
  model?: string;
  camera?: string;
  /** Azimut vers lequel pointe l'axe -Z du modèle, en degrés (0 : le nord). */
  orientation?: number;
  rooms: {
    id: string;
    name: string;
    position: Position3dType;
    items?: RoomItemConfigType[];
  }[];
};

type RoomItemConfigType =
  | LightConfigType
  | ClimateConfigType
  | TemperatureConfigType
  | ShutterConfigType
  | DestkopConfigType
  | Printer3dConfigType
  | PlugConfigType
  | MediaConfigType
  | AmbilightConfigType;

type BaseItemConfigType =
  | {
      type: string;
      roomDisplay: true;
    }
  | {
      type: string;
      roomDisplay?: false;
      position: Position3dType;
    };

type LightConfigType = BaseItemConfigType & {
  type: 'light';
  lightEntityId: FilterByDomain<EntityName, 'light'>;
  intensity?: number;
};

type ClimateConfigType = BaseItemConfigType & {
  type: 'climate';
  climateEntityId: FilterByDomain<EntityName, 'climate'>;
  temperatureEntityId?: FilterByDomain<EntityName, 'sensor'>;
  humidityEntityId?: FilterByDomain<EntityName, 'sensor'>;
};

type TemperatureConfigType = BaseItemConfigType & {
  type: 'temperature';
  temperatureEntityId: FilterByDomain<EntityName, 'sensor'>;
  humidityEntityId?: FilterByDomain<EntityName, 'sensor'>;
  batteryEntityId?: FilterByDomain<EntityName, 'sensor'>;
  signalEntityId?: FilterByDomain<EntityName, 'sensor'>;
};

type ShutterConfigType = BaseItemConfigType & {
  type: 'shutter';
  shutterEntityId: FilterByDomain<EntityName, 'cover'>;
};

type DestkopConfigType = BaseItemConfigType & {
  type: 'desktop';
  options: {
    icon?: string;
    label?: string;
    color?: string;
    scriptEntityId: FilterByDomain<EntityName, 'script'>;
    hide?: boolean;
  }[];
};

type Printer3dConfigType = BaseItemConfigType & {
  type: 'printer3d';
  // Préfixe des entités ha-bambulab, sans domaine : `p1s_<numéro de série>`.
  prefix: string;
};

type PlugConfigType = BaseItemConfigType & {
  type: 'plug';
  switchEntityId: FilterByDomain<EntityName, 'switch'>;
  powerEntityId?: FilterByDomain<EntityName, 'sensor'>;
  // En W : sous ce seuil, la prise allumée est « en veille » (5 W par défaut).
  standbyThreshold?: number;
};

type MediaConfigType = BaseItemConfigType & {
  type: 'media';
  mediaPlayerEntityId: FilterByDomain<EntityName, 'media_player'>;
  // Pavé directionnel, avec les commandes de l'Apple TV (ADR 0028).
  remoteEntityId?: FilterByDomain<EntityName, 'remote'>;
};

type AmbilightConfigType = BaseItemConfigType & {
  type: 'ambilight';
  lightEntityId: FilterByDomain<EntityName, 'light'>;
};
