import {FilterByDomain, EntityName} from '@hakit/core';

type Position3dType = {x: number; y: number; z: number};

type HouseConfigType = {
  model?: string;
  lightMaps?: {sky: string; sun: string};
  camera?: string;
  rooms: {
    id: string;
    name: string;
    position: Position3dType;
    /** Terrasse, balcon : la carte des températures y pose celle de la météo. */
    outdoor?: boolean;
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
  | TvConfigType
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
  prefix: string;
};

type TvConfigType = BaseItemConfigType & {
  type: 'tv';
  lightEntityId: FilterByDomain<EntityName, 'light'>;
  ledLayout: LedLayoutType;
};

type LedLayoutType = {
  top: number;
  right: number;
  bottom: number;
  left: number;
  position?: number;
  reverse?: boolean;
};

type VacuumConfigType = BaseItemConfigType & {
  type: 'vacuum';
  prefix: string;
  mapAlignment?: MapAlignmentType;
};

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
