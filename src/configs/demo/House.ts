import {HouseConfigType} from '../house';
import {SideBarConfigType} from '../sidebar';
import Appartement from './Appartement.glb?url';

export const ConfigName = 'Démo';

export const SideBarConfig: SideBarConfigType = {
  weatherEntityId: 'weather.home',
  pets: ['Tom', 'Jerry'],
  persons: [
    {
      name: 'Juliette',
      personEntityId: 'person.juliette',
      avatar: 'person/Elise.png',
      homeZoneEntityId: 'zone.home',
      homeDistanceEntityId: 'sensor.home_juliette_phone_distance',
      workZoneEntityId: 'zone.juliette_work',
      focusEntityId: 'binary_sensor.juliette_phone_focus',
      batteryLevelEntityId: 'sensor.juliette_phone_battery_level',
      batteryStateEntityId: 'sensor.juliette_phone_battery_state',
    },
    {
      name: 'Roméo',
      personEntityId: 'person.romeo',
      avatar: 'person/Elio.png',
      homeZoneEntityId: 'zone.home',
      homeDistanceEntityId: 'sensor.home_romeo_phone_distance',
      workZoneEntityId: 'zone.remeo_work',
      focusEntityId: 'binary_sensor.romeo_phone_focus',
      batteryLevelEntityId: 'sensor.romeo_phone_battery_level',
      batteryStateEntityId: 'sensor.romeo_phone_battery_state',
    },
  ],
  system: {
    uptimeEntityId: 'sensor.system_monitor_last_boot',
    powerStatusEntityId: 'binary_sensor.rpi_power_status',
    graphs: [
      {
        color: 'red',
        label: 'Mémoire:',
        sensorEntityId: 'sensor.system_monitor_memory_usage',
      },
      {
        color: 'orange',
        label: 'Température:',
        sensorEntityId: 'sensor.system_monitor_processor_temperature',
      },
      {
        color: 'cyan',
        label: 'Processeur:',
        sensorEntityId: 'sensor.system_monitor_processor_use',
      },
    ],
  },
};

export const HouseConfig: HouseConfigType = {
  model: Appartement,
  rooms: [
    {
      id: 'Salon',
      name: 'Séjour',
      position: {x: 44, y: 73, z: 0},
      items: [
        {
          type: 'light',
          roomDisplay: true,
          lightEntityId: 'light.salon_light',
        },
        {
          type: 'climate',
          roomDisplay: true,
          climateEntityId: 'climate.salon',
          temperatureEntityId: 'sensor.salon_temperature',
          humidityEntityId: 'sensor.salon_humidity',
        },
        {
          type: 'light',
          lightEntityId: 'light.salon_hue_play',
          position: {x: 31, y: 72, z: 0},
        },
        {
          type: 'shutter',
          shutterEntityId: 'cover.salon_shutter',
          position: {x: 43.25, y: 91, z: 0},
        },
      ],
    },
    {
      id: 'Kitchen',
      name: 'Cuisine',
      position: {x: 45, y: 18, z: 0},
      items: [
        {
          type: 'light',
          roomDisplay: true,
          lightEntityId: 'light.kitchen_light',
        },
        {
          type: 'climate',
          roomDisplay: true,
          climateEntityId: 'climate.kitchen',
          temperatureEntityId: 'sensor.kitchen_temperature',
          humidityEntityId: 'sensor.kitchen_humidity',
        },
        {
          type: 'shutter',
          shutterEntityId: 'cover.kitchen_shutter',
          position: {x: 44, y: 8, z: 0},
        },
        {
          type: 'shutter',
          shutterEntityId: 'cover.kitchen_shutter_2',
          position: {x: 33.5, y: 27.5, z: 0},
        },
      ],
    },
    {
      id: 'Dining',
      name: 'Salle à manger',
      position: {x: 50, y: 39.25, z: 0},
      items: [
        {
          type: 'light',
          roomDisplay: true,
          lightEntityId: 'light.dining_light',
        },
      ],
    },
    {
      id: 'Bedroom',
      name: 'Chambre',
      position: {x: 20, y: 65, z: 0},
      items: [
        {
          type: 'light',
          roomDisplay: true,
          lightEntityId: 'light.bedroom_light',
        },
        {
          type: 'climate',
          roomDisplay: true,
          climateEntityId: 'climate.bedroom',
          temperatureEntityId: 'sensor.bedroom_temperature',
          humidityEntityId: 'sensor.bedroom_humidity',
        },
        {
          type: 'shutter',
          shutterEntityId: 'cover.bedroom_shutter',
          position: {x: 18, y: 80.5, z: 0},
        },
      ],
    },
    {
      id: 'Bedroom_dressing',
      name: 'Dressing',
      position: {x: 14, y: 52, z: 0},
      items: [
        {
          type: 'light',
          roomDisplay: true,
          lightEntityId: 'light.bedroom_dressing_light',
        },
      ],
    },
    {
      id: 'Bedroom_bathroom',
      name: 'Sale de bain',
      position: {x: 17, y: 39, z: 0},
      items: [
        {
          type: 'light',
          roomDisplay: true,
          lightEntityId: 'light.bedroom_bathroom_light',
        },
        {
          type: 'climate',
          roomDisplay: true,
          climateEntityId: 'climate.bedroom_bathroom',
          temperatureEntityId: 'sensor.bedroom_bathroom_temperature',
          humidityEntityId: 'sensor.bedroom_bathroom_humidity',
        },
      ],
    },
    {
      id: 'Bedroom_2',
      name: 'Chambre 2',
      position: {x: 78, y: 31.5, z: 0},
      items: [
        {
          type: 'light',
          roomDisplay: true,
          lightEntityId: 'light.bedroom_2_light',
        },
        {
          type: 'climate',
          roomDisplay: true,
          climateEntityId: 'climate.bedroom_2',
          temperatureEntityId: 'sensor.bedroom_2_temperature',
          humidityEntityId: 'sensor.bedroom_2_humidity',
        },
        {
          type: 'shutter',
          shutterEntityId: 'cover.bedroom_2_shutter',
          position: {x: 70, y: 23, z: 0},
        },
      ],
    },
    {
      id: 'Bedroom_3',
      name: 'Chambre 3',
      position: {x: 83, y: 68, z: 0},
      items: [
        {
          type: 'light',
          roomDisplay: true,
          lightEntityId: 'light.bedroom_3_light',
        },
        {
          type: 'climate',
          roomDisplay: true,
          climateEntityId: 'climate.bedroom_3',
          temperatureEntityId: 'sensor.bedroom_3_temperature',
          humidityEntityId: 'sensor.bedroom_3_humidity',
        },
        {
          type: 'shutter',
          shutterEntityId: 'cover.bedroom_3_shutter',
          position: {x: 83, y: 80, z: 0},
        },
      ],
    },
    {
      id: 'Cellar',
      name: 'Cellier',
      position: {x: 33, y: 40, z: 0},
      items: [
        {
          type: 'light',
          roomDisplay: true,
          lightEntityId: 'light.cellar_light',
        },
      ],
    },
    {
      id: 'Bathroom',
      name: 'Sale de bain',
      position: {x: 83, y: 47, z: 0},
      items: [
        {
          type: 'light',
          roomDisplay: true,
          lightEntityId: 'light.bathroom_light',
        },
        {
          type: 'climate',
          roomDisplay: true,
          climateEntityId: 'climate.bathroom',
          temperatureEntityId: 'sensor.bathroom_temperature',
          humidityEntityId: 'sensor.bathroom_humidity',
        },
      ],
    },
    {
      id: 'Corridor',
      name: 'Couloir',
      position: {x: 65, y: 57, z: 0},
      items: [
        {
          type: 'light',
          roomDisplay: true,
          lightEntityId: 'light.corridor_light',
        },
      ],
    },
    {
      id: 'Toilet',
      name: 'Toilette',
      position: {x: 69, y: 72, z: 0},
      items: [
        {
          type: 'light',
          roomDisplay: true,
          lightEntityId: 'light.toilet_light',
        },
      ],
    },
  ],
};
