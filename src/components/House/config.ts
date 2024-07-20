import {FilterByDomain, EntityName} from '@hakit/core';

export const HouseConfig: HouseConfig = {
  floor_plan: `${import.meta.env.BASE_URL}/base_night.png`,
  rooms: [
    {
      id: 'Salon',
      name: 'Séjour',
      main_light: {
        entity_id: 'light.salon_main',
        layer: `${import.meta.env.BASE_URL}/layout/light/salon_layer.png`,
        position: {x: 54, y: 35},
      },
      temperature: 'sensor.temperature_salon',
    },
    {
      id: 'Office',
      name: 'Bureau',
      main_light: {
        entity_id: 'light.office_main',
        layer: `${import.meta.env.BASE_URL}/layout/light/office_layer.png`,
        position: {x: 24, y: 77},
      },
      temperature: 'sensor.temperature_office',
    },
    {
      id: 'Bedroom',
      name: 'Chambre',
      main_light: {
        entity_id: 'light.bedroom_main',
        layer: `${import.meta.env.BASE_URL}/layout/light/bedroom_layer.png`,
        position: {x: 72, y: 75},
      },
      temperature: 'sensor.temperature_bedroom',
    },
    {
      id: 'Bedroom_2',
      name: 'Chambre 2',
      main_light: {
        entity_id: 'light.bedroom_2_main',
        layer: `${import.meta.env.BASE_URL}/layout/light/bedroom2_layer.png`,
        position: {x: 75, y: 30},
      },
    },
  ],
};

export type HouseConfig = {
  floor_plan: string;
  rooms: {
    id: string;
    name: string;
    temperature?: FilterByDomain<EntityName, 'sensor'>;
    main_light?: LightConfig;
    lights?: LightConfig[];
  }[];
};

type LightConfig = {
  entity_id: FilterByDomain<EntityName, 'light'>;
  layer: string;
  position: {x: number; y: number};
};
