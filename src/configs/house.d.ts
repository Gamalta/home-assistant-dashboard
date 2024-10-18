import {FilterByDomain, EntityName} from '@hakit/core';

type SideBarConfigType = {
  weather: FilterByDomain<EntityName, 'weather'>;
  persons: [PersonConfigType, PersonConfigType];
};

type PersonConfigType = {
  name: string;
  avatar: string;
  entity: string;
  home_zone?: FilterByDomain<EntityName, 'zone'>;
  home_distance?: FilterByDomain<EntityName, 'sensor'>;
  work_zone?: FilterByDomain<EntityName, 'zone'>;
  focus?: FilterByDomain<EntityName, 'binary_sensor'>;
  battery_level?: FilterByDomain<EntityName, 'sensor'>;
  battery_state?: FilterByDomain<EntityName, 'sensor'>;
};

type HouseConfigType = {
  night_floor_plan: string;
  day_floor_plan: string;
  rooms: {
    id: string;
    name: string;
    temperature?: {
      entity: FilterByDomain<EntityName, 'sensor'>;
      humidity?: FilterByDomain<EntityName, 'sensor'>;
      battery?: FilterByDomain<EntityName, 'sensor'>;
      signal?: FilterByDomain<EntityName, 'sensor'>;
    };
    main_light?: LightConfigType;
    lights?: LightConfigType[];
  }[];
};

type LightConfigType = {
  entity_id: FilterByDomain<EntityName, 'light'>;
  layer: {
    red: string;
    green: string;
    blue: string;
  };
  position: {x: number; y: number};
};
