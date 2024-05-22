import {FilterByDomain, EntityName} from '@hakit/core';

export const HouseConfig: HouseConfig = {
  model: 'model.glb',
  camera: 'Camera_Default',
  rooms: [
    {
      id: 'Salon',
      name: 'Séjour',
      camera: 'Camera_Salon',
      light: 'light.salon_main',
      //temperature: 'sensor.temperature_salon',
    },
    {
      id: 'Office',
      name: 'Bureau',
      camera: 'Camera_Office',
      light: 'light.desktop_main',
      //temperature: 'sensor.temperature_office',
    },
    {
      id: 'Bedroom',
      name: 'Chambre',
      camera: 'Camera_Bedroom',
      light: 'light.bedroom_main',
      //temperature: 'sensor.temperature_bedroom',
    },
    {
      id: 'Bedroom_2',
      name: 'Chambre 2',
      camera: 'Camera_Bedroom_2',
      light: 'light.bedroom_2_main',
    },
  ],
};

export type HouseConfig = {
  model: string;
  camera: string;
  rooms: {
    id: string;
    name: string;
    camera: `Camera_${string}`;
    temperature?: FilterByDomain<EntityName, 'sensor'>;
    light?: FilterByDomain<EntityName, 'light'>;
    lights?: {
      entity: FilterByDomain<EntityName, 'light'>;
      position: [number, number, number];
    }[];
  }[];
};
