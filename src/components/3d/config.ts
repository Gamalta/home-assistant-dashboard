import {EntityName, FilterByDomain} from '@hakit/core';

export const HouseConfig: HouseConfig = {
  model: process.env.PUBLIC_URL + 'model.glb',
  room: [
    {
      name: 'Séjour',
      camera: {
        position: [-1, 5, -2.2],
        lookAt: [0.5, 0, -2.2],
      },
      position: [0.05, 2.6, -1.7],
      size: [4.1, 5.25],
      temperature: 'sensor.temperature_salon',
      light: 'light.salon',
      lights: [
        {
          entity: 'light.salon_strip',
          position: [-1.5, 2.6, -2.2],
        },
        {
          entity: 'light.hue_play',
          position: [-1.5, 2.6, -2.2],
        },
      ],
    },
    {
      name: 'Cuisine',
      camera: {
        position: [-0.07, 5, 1.6],
        lookAt: [-0.07, 0, 2.6],
      },
      position: [-0.07, 2.6, 2.6],
      size: [2.6, 3.35],
      light: 'light.kitchen',
    },
    {
      name: 'Bureau',
      camera: {
        position: [-4.06, 4.5, 2.7],
        lookAt: [-5.06, 0, 2.7],
      },
      position: [-4.06, 2.6, 2.7],
      size: [1.6, 3.2],
      temperature: 'sensor.temperature_office',
      light: 'light.office',
    },
    {
      name: 'Chambre',
      camera: {
        position: [3.06, 5, 1.6],
        lookAt: [3.06, 0, 2.6],
      },
      position: [3.06, 2.6, 2.6],
      size: [3.6, 3.35],
      temperature: 'sensor.temperature_bedroom',
      light: 'light.bedroom',
    },
    {
      name: 'Chambre 2',
      camera: {
        position: [2.47, 5, -2.15],
        lookAt: [3.47, 0, -2.15],
      },
      position: [3.47, 2.6, -2.15],
      size: [2.77, 4.3],
      light: 'light.bedroom_2',
    },
  ],
};

export type HouseConfig = {
  model: string;
  room: RoomConfig[];
};

export type RoomConfig = {
  name: string;
  camera: CameraConfig;
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

export type CameraConfig = {
  position: [number, number, number];
  lookAt: [number, number, number];
};
