import {FilterByDomain, EntityName} from '@hakit/core';

type HouseConfigType = {
  nightFloorPlan: string;
  dayFloorPlan: string;
  rooms: {
    id: string;
    name: string;
    position: {x: number; y: number};
    items?: RoomItemConfigType[];
  }[];
};

type RoomItemConfigType =
  | LightConfigType
  | ClimateConfigType
  | TemperatureConfigType
  | ShutterConfigType
  | DestkopConfigType;

type BaseItemConfigType =
  | {
      type: string;
      roomDisplay: true;
    }
  | {
      type: string;
      roomDisplay?: false;
      position: {x: number; y: number};
    };

type LightConfigType = BaseItemConfigType & {
  type: 'light';
  lightEntityId: FilterByDomain<EntityName, 'light'>;
  layer?: {
    red: string;
    green: string;
    blue: string;
  };
};

type ClimateConfigType = BaseItemConfigType & {
  type: 'climate';
  climateEntityId: FilterByDomain<EntityName, 'climate'>;
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
