import {FilterByDomain, EntityName} from '@hakit/core';

type Position3dType = {x: number; y: number; z: number};

type HouseConfigType = {
  model?: string;
  camera?: string;
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
  | OutletConfigType
  | Printer3dConfigType
  | TvConfigType;

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

type OutletConfigType = BaseItemConfigType & {
  type: 'outlet';
  switchEntityId: FilterByDomain<EntityName, 'switch'>;
  powerEntityId?: FilterByDomain<EntityName, 'sensor'>;
};

type Printer3dConfigType = BaseItemConfigType & {
  type: 'printer3d';
  // Préfixe des entités ha-bambulab, sans domaine : `p1s_<numéro de série>`.
  prefix: string;
};

type TvConfigType = BaseItemConfigType & {
  type: 'tv';
  // Lumière principale de l'instance HyperHDR de l'ambilight.
  lightEntityId: FilterByDomain<EntityName, 'light'>;
  ledLayout: LedLayoutType;
};

// Disposition « classique » des LED dans HyperHDR : nombre de LED par côté,
// « Position d'entrée » et « Direction inverse ».
type LedLayoutType = {
  top: number;
  right: number;
  bottom: number;
  left: number;
  position?: number;
  reverse?: boolean;
};
