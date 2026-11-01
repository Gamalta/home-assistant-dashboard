import {FilterByDomain, EntityName} from '@hakit/core';

type Position3dType = {x: number; y: number; z: number};

type HouseConfigType = {
  model?: string;
  /** Cartes de lumière du modèle, écrites par `pnpm bake-lighting`. */
  lightMaps?: {sky: string; sun: string};
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
  | VacuumConfigType
  | BatteryConfigType
  | SmokeConfigType;

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

type VacuumConfigType = BaseItemConfigType & {
  type: 'vacuum';
  // Préfixe des entités dreame-vacuum, sans domaine : le nom de l'appareil.
  prefix: string;
  mapAlignment?: MapAlignmentType;
};

// Origine du plan du robot dans la scène, et rotation du plan autour de la
// verticale en degrés, comme `rotation.y` de three.
type MapAlignmentType = {x: number; z: number; rotation: number};

type BatteryConfigType = BaseItemConfigType & {
  type: 'battery';
  name: string;
  batteryEntityId: FilterByDomain<EntityName, 'sensor'>;
};

type SmokeConfigType = BaseItemConfigType & {
  type: 'smoke';
  smokeEntityId: FilterByDomain<EntityName, 'binary_sensor'>;
  heatEntityId?: FilterByDomain<EntityName, 'binary_sensor'>;
  batteryEntityId?: FilterByDomain<EntityName, 'sensor'>;
  batteryLowEntityId?: FilterByDomain<EntityName, 'binary_sensor'>;
  tamperEntityId?: FilterByDomain<EntityName, 'binary_sensor'>;
  testEntityId?: FilterByDomain<EntityName, 'button'>;
};
