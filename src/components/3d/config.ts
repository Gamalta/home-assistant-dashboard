import {FilterByDomain, EntityName} from '@hakit/core';

export const HouseConfig: HouseConfig = {
  model: 'model.glb',
  camera: 'Camera_Default',
  rooms: [
    {
      id: 'Salon',
      name: 'Séjour',
      camera: 'Camera_Salon',
      main_light: 'light.salon_main',
      lights: ['light.salon_hue_play'],
      //temperature: 'sensor.temperature_salon',
    },
    {
      id: 'Office',
      name: 'Bureau',
      camera: 'Camera_Office',
      main_light: 'light.office_main',
      lights: ['light.office_hue_iris'],
      //temperature: 'sensor.temperature_office',
    },
    {
      id: 'Bedroom',
      name: 'Chambre',
      camera: 'Camera_Bedroom',
      main_light: 'light.bedroom_main',
      //temperature: 'sensor.temperature_bedroom',
    },
    {
      id: 'Bedroom_2',
      name: 'Chambre 2',
      camera: 'Camera_Bedroom_2',
      main_light: 'light.bedroom_2_main',
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
    main_light?: FilterByDomain<EntityName, 'light'>;
    lights?: FilterByDomain<EntityName, 'light'>[];
  }[];
};
