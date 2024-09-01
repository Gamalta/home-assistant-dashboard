import {FilterByDomain, EntityName} from '@hakit/core';

export const SideBarConfig: SideBarConfig = {
  weather: 'weather.weather',
  persons: [
    {
      name: 'Elise',
      entity: 'person.elise',
      avatar: 'person/Elise.png',
      home_zone: 'zone.home',
      home_distance: 'sensor.home_iphone_de_elise_distance',
      work_zone: 'zone.elio_work',
      focus: 'binary_sensor.iphone_de_elise_focus',
      battery_level: 'sensor.iphone_de_elise_battery_level',
      battery_state: 'sensor.iphone_de_elise_battery_state',
    },
    {
      name: 'Elio',
      entity: 'person.home',
      avatar: 'person/Elio.png',
      home_zone: 'zone.home',
      home_distance: 'sensor.home_3eur_la_minute_distance',
      work_zone: 'zone.elio_work',
      focus: 'binary_sensor.3eur_la_minute_focus',
      battery_level: 'sensor.3eur_la_minute_battery_level',
      battery_state: 'sensor.3eur_la_minute_battery_state',
    },
  ],
};

export const HouseConfig: HouseConfig = {
  night_floor_plan: `${import.meta.env.BASE_URL}/base_night.png`,
  day_floor_plan: `${import.meta.env.BASE_URL}/base_day.png`,
  rooms: [
    {
      id: 'Salon',
      name: 'Séjour',
      main_light: {
        entity_id: 'light.salon_main',
        layer: {
          red: `${import.meta.env.BASE_URL}/light/salon_red.png`,
          green: `${import.meta.env.BASE_URL}/light/salon_green.png`,
          blue: `${import.meta.env.BASE_URL}/light/salon_blue.png`,
        },
        position: {x: 54, y: 35},
      },
      temperature: {
        entity: 'sensor.temperature_salon',
        humidity: 'sensor.humidity_salon',
        battery: 'sensor.battery_level_atc_salon',
        signal: 'sensor.signal_atc_salon',
      },
      lights: [
        {
          entity_id: 'light.salon_hue_play',
          layer: {
            red: `${import.meta.env.BASE_URL}/light/salon_play_red.png`,
            green: `${import.meta.env.BASE_URL}/light/salon_play_green.png`,
            blue: `${import.meta.env.BASE_URL}/light/salon_play_blue.png`,
          },
          position: {x: 61, y: 22},
        },
      ],
    },
    {
      id: 'Office',
      name: 'Bureau',
      main_light: {
        entity_id: 'light.office_main',
        layer: {
          red: `${import.meta.env.BASE_URL}/light/office_red.png`,
          green: `${import.meta.env.BASE_URL}/light/office_green.png`,
          blue: `${import.meta.env.BASE_URL}/light/office_blue.png`,
        },
        position: {x: 24, y: 77},
      },
      temperature: {
        entity: 'sensor.temperature_office',
        humidity: 'sensor.humidity_office',
        battery: 'sensor.battery_level_atc_office',
        signal: 'sensor.signal_atc_office',
      },
      lights: [
        {
          entity_id: 'light.office_hue_iris',
          layer: {
            red: `${import.meta.env.BASE_URL}/light/office_iris_red.png`,
            green: `${import.meta.env.BASE_URL}/light/office_iris_green.png`,
            blue: `${import.meta.env.BASE_URL}/light/office_iris_blue.png`,
          },
          position: {x: 21, y: 67},
        },
      ],
    },
    {
      id: 'Bedroom',
      name: 'Chambre',
      main_light: {
        entity_id: 'light.bedroom_main',
        layer: {
          red: `${import.meta.env.BASE_URL}/light/bedroom_red.png`,
          green: `${import.meta.env.BASE_URL}/light/bedroom_green.png`,
          blue: `${import.meta.env.BASE_URL}/light/bedroom_blue.png`,
        },
        position: {x: 72, y: 75},
      },
      temperature: {
        entity: 'sensor.temperature_bedroom',
        humidity: 'sensor.humidity_bedroom',
        battery: 'sensor.battery_level_atc_bedroom',
        signal: 'sensor.signal_atc_bedroom',
      },
    },
    {
      id: 'Bedroom_2',
      name: 'Chambre 2',
      main_light: {
        entity_id: 'light.bedroom_2_main',
        layer: {
          red: `${import.meta.env.BASE_URL}/light/bedroom_2_red.png`,
          green: `${import.meta.env.BASE_URL}/light/bedroom_2_green.png`,
          blue: `${import.meta.env.BASE_URL}/light/bedroom_2_blue.png`,
        },
        position: {x: 75, y: 30},
      },
      temperature: {
        entity: 'sensor.temperature_bedroom2',
        humidity: 'sensor.humidity_bedroom2',
        battery: 'sensor.battery_level_atc_bedroom2',
        signal: 'sensor.signal_atc_bedroom2',
      },
    },
  ],
};

export type SideBarConfig = {
  weather: FilterByDomain<EntityName, 'weather'>;
  persons: [PersonConfig, PersonConfig];
};

export type PersonConfig = {
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

export type HouseConfig = {
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
    main_light?: LightConfig;
    lights?: LightConfig[];
  }[];
};

export type LightConfig = {
  entity_id: FilterByDomain<EntityName, 'light'>;
  layer: {
    red: string;
    green: string;
    blue: string;
  };
  position: {x: number; y: number};
};
