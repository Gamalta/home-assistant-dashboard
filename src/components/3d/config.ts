import {FilterByDomain, EntityName} from '@hakit/core';

export const HouseConfig: HouseConfig = {
  model: 'model.glb',
  camera: 'Default',
  room: [
    {
      debug: true,
      name: 'Séjour',
      camera: 'Salon',
      position: [0.7, 2.6, -1.7],
      size: [3.4, 3.7],
      //temperature: 'sensor.temperature_salon',
      light: 'light.salon_main',
      lights: [
        {
          entity: 'light.salon_hue_play',
          position: [-1.5, -1, 0],
        },
        {
          entity: 'light.desktop_hue_iris',
          position: [1.5, -1.4, -1.5],
        },
      ],
    },
    /*{
      name: 'Cuisine',
      camera: {
        position: [-0.07, 5, 1.6],
        lookAt: [-0.07, 0, 2.6],
      },
      position: [-0.07, 2.6, 2.6],
      size: [2.6, 3.35],
      light: 'light.kitchen',
    },*/
    {
      name: 'Bureau',
      camera: 'Desktop',
      position: [-3.5, 2.4, 2.7],
      size: [2.4, 2.6],
      //temperature: 'sensor.temperature_office',
      light: 'light.desktop_main',
    },
    {
      debug: true,
      name: 'Chambre',
      camera: 'Bedroom',
      position: [3.06, 2.6, 2.6],
      size: [3.6, 3.35],
      //temperature: 'sensor.temperature_bedroom',
      light: 'light.bedroom_main',
    },
    {
      debug: true,
      name: 'Chambre 2',
      camera: 'Bedroom_2',
      position: [3.47, 2.6, -2.15],
      size: [2.77, 4.3],
      light: 'light.bedroom_2_main',
    },
  ],
};

export type HouseConfig = {
  model: string;
  camera: string;
  room: RoomConfig[];
};

export type RoomConfig = {
  name: string;
  camera: string;
  position: [number, number, number];
  size: [number, number];
  temperature?: FilterByDomain<EntityName, 'sensor'>;
  light?: FilterByDomain<EntityName, 'light'>;
  lights?: {
    entity: FilterByDomain<EntityName, 'light'>;
    position: [number, number, number];
  }[];
  debug?: boolean;
};
