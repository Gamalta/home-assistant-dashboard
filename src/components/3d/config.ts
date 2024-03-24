import {EntityName, FilterByDomain} from '@hakit/core';

export const HouseConfig: HouseConfig = {
  model: process.env.PUBLIC_URL + 'model.glb',
  room: [
    {
      name: 'Séjour',
      camera: {
        position: [0.05, 6, -1.7],
        lookAt: [1.05, 0, -1.7],
      },
      position: [0.05, 2.6, -1.7],
      size: [4.1, 5.25],
      temperature: 'sensor.temperature_salon',
      light: 'light.salon',
    },
    {
      name: 'Bureau',
      camera: {
        position: [-4.06, 6, 2.7],
        lookAt: [-5.06, 0, 2.7],
      },
      position: [-4.06, 2.6, 2.7],
      size: [1.6, 3.2],
      temperature: 'sensor.temperature_desktop',
      light: 'light.desktop',
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
  debug?: boolean;
};

export type CameraConfig = {
  position: [number, number, number];
  lookAt: [number, number, number];
};
