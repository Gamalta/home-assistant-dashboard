import {HouseConfigType} from '../house';
import {SideBarConfigType} from '../sidebar';
import Demo from './Demo.glb?url';
import baseDay from './assets/base_day.webp';
import baseNight from './assets/base_night.webp';
import salonRed from './assets/light/salon_red.webp';
import salonGreen from './assets/light/salon_green.webp';
import salonBlue from './assets/light/salon_blue.webp';
import salonPlayRed from './assets/light/salon_play_red.webp';
import salonPlayGreen from './assets/light/salon_play_green.webp';
import salonPlayBlue from './assets/light/salon_play_blue.webp';
import kitchenRed from './assets/light/kitchen_red.webp';
import kitchenGreen from './assets/light/kitchen_green.webp';
import kitchenBlue from './assets/light/kitchen_blue.webp';
import cellarRed from './assets/light/cellar_red.webp';
import cellarGreen from './assets/light/cellar_green.webp';
import cellarBlue from './assets/light/cellar_blue.webp';
import diningRed from './assets/light/dining_red.webp';
import diningGreen from './assets/light/dining_green.webp';
import diningBlue from './assets/light/dining_blue.webp';
import bedroomRed from './assets/light/bedroom_red.webp';
import bedroomGreen from './assets/light/bedroom_green.webp';
import bedroomBlue from './assets/light/bedroom_blue.webp';
import bedroomDressingRed from './assets/light/bedroom_dressing_red.webp';
import bedroomDressingGreen from './assets/light/bedroom_dressing_green.webp';
import bedroomDressingBlue from './assets/light/bedroom_dressing_blue.webp';
import bedroomBathroomRed from './assets/light/bedroom_bathroom_red.webp';
import bedroomBathroomGreen from './assets/light/bedroom_bathroom_green.webp';
import bedroomBathroomBlue from './assets/light/bedroom_bathroom_blue.webp';
import bathroomRed from './assets/light/bathroom_red.webp';
import bathroomGreen from './assets/light/bathroom_green.webp';
import bathroomBlue from './assets/light/bathroom_blue.webp';
import bedroom2Red from './assets/light/bedroom_2_red.webp';
import bedroom2Green from './assets/light/bedroom_2_green.webp';
import bedroom2Blue from './assets/light/bedroom_2_blue.webp';
import bedroom3Red from './assets/light/bedroom_3_red.webp';
import bedroom3Green from './assets/light/bedroom_3_green.webp';
import bedroom3Blue from './assets/light/bedroom_3_blue.webp';
import corridorRed from './assets/light/corridor_red.webp';
import corridorGreen from './assets/light/corridor_green.webp';
import corridorBlue from './assets/light/corridor_blue.webp';
import toiletRed from './assets/light/toilet_red.webp';
import toiletGreen from './assets/light/toilet_green.webp';
import toiletBlue from './assets/light/toilet_blue.webp';

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
  model: Demo,
  floorPlan: {
    day: baseDay,
    night: baseNight,
  },
  rooms: [
    {
      id: 'Salon',
      name: 'Séjour',
      position: {x: -0.8, y: 2.5, z: 2.8},
      floorPosition: {x: 44, y: 73},
      items: [
        {
          type: 'light',
          roomDisplay: true,
          lightEntityId: 'light.salon_light',
          layer: {
            red: salonRed,
            green: salonGreen,
            blue: salonBlue,
          },
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
          layer: {
            red: salonPlayRed,
            green: salonPlayGreen,
            blue: salonPlayBlue,
          },
          position: {x: -3.2, y: 0.3, z: 3.1},
          floorPosition: {x: 31, y: 72},
        },
        {
          type: 'shutter',
          shutterEntityId: 'cover.salon_shutter',
          position: {x: -0.8, y: 1.3, z: 5.8},
          floorPosition: {x: 43.25, y: 91},
        },
      ],
    },
    {
      id: 'Kitchen',
      name: 'Cuisine',
      position: {x: -0.5, y: 2.5, z: -5.3},
      floorPosition: {x: 45, y: 18},
      items: [
        {
          type: 'light',
          roomDisplay: true,
          lightEntityId: 'light.kitchen_light',
          layer: {
            red: kitchenRed,
            green: kitchenGreen,
            blue: kitchenBlue,
          },
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
          position: {x: -0.6, y: 1.5, z: -7.2},
          floorPosition: {x: 44, y: 8},
        },
        {
          type: 'shutter',
          shutterEntityId: 'cover.kitchen_shutter_2',
          position: {x: -2.5, y: 1.3, z: -4.2},
          floorPosition: {x: 33.5, y: 27.5},
        },
      ],
    },
    {
      id: 'Dining',
      name: 'Salle à manger',
      position: {x: 0.5, y: 2.5, z: -2.45},
      floorPosition: {x: 50, y: 39.25},
      items: [
        {
          type: 'light',
          roomDisplay: true,
          lightEntityId: 'light.dining_light',
          layer: {
            red: diningRed,
            green: diningGreen,
            blue: diningBlue,
          },
        },
      ],
    },
    {
      id: 'Bedroom',
      name: 'Chambre',
      position: {x: -5.25, y: 2.5, z: 2.15},
      floorPosition: {x: 20, y: 65},
      items: [
        {
          type: 'light',
          roomDisplay: true,
          lightEntityId: 'light.bedroom_light',
          layer: {
            red: bedroomRed,
            green: bedroomGreen,
            blue: bedroomBlue,
          },
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
          position: {x: -5.6, y: 1.3, z: 4},
          floorPosition: {x: 18, y: 80.5},
        },
      ],
    },
    {
      id: 'Bedroom_dressing',
      name: 'Dressing',
      position: {x: -5.7, y: 2.5, z: -0.4},
      floorPosition: {x: 14, y: 52},
      items: [
        {
          type: 'light',
          roomDisplay: true,
          lightEntityId: 'light.bedroom_dressing_light',
          layer: {
            red: bedroomDressingRed,
            green: bedroomDressingGreen,
            blue: bedroomDressingBlue,
          },
        },
      ],
    },
    {
      id: 'Bedroom_bathroom',
      name: 'Sale de bain',
      position: {x: -5.7, y: 2.5, z: -2.5},
      floorPosition: {x: 17, y: 39},
      items: [
        {
          type: 'light',
          roomDisplay: true,
          lightEntityId: 'light.bedroom_bathroom_light',
          layer: {
            red: bedroomBathroomRed,
            green: bedroomBathroomGreen,
            blue: bedroomBathroomBlue,
          },
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
      position: {x: 5.1, y: 2.5, z: -3.5},
      floorPosition: {x: 78, y: 31.5},
      items: [
        {
          type: 'light',
          roomDisplay: true,
          lightEntityId: 'light.bedroom_2_light',
          layer: {
            red: bedroom2Red,
            green: bedroom2Green,
            blue: bedroom2Blue,
          },
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
          position: {x: 4.2, y: 1.3, z: -5},
          floorPosition: {x: 70, y: 23},
        },
      ],
    },
    {
      id: 'Bedroom_3',
      name: 'Chambre 3',
      position: {x: 6, y: 2.5, z: 2},
      floorPosition: {x: 83, y: 68},
      items: [
        {
          type: 'light',
          roomDisplay: true,
          lightEntityId: 'light.bedroom_3_light',
          layer: {
            red: bedroom3Red,
            green: bedroom3Green,
            blue: bedroom3Blue,
          },
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
          position: {x: 6.5, y: 1.3, z: 4.2},
          floorPosition: {x: 83, y: 80},
        },
      ],
    },
    {
      id: 'Cellar',
      name: 'Cellier',
      position: {x: -2.5, y: 2.5, z: -2.5},
      floorPosition: {x: 33, y: 40},
      items: [
        {
          type: 'light',
          roomDisplay: true,
          lightEntityId: 'light.cellar_light',
          layer: {
            red: cellarRed,
            green: cellarGreen,
            blue: cellarBlue,
          },
        },
      ],
    },
    {
      id: 'Bathroom',
      name: 'Sale de bain',
      position: {x: 6, y: 2.5, z: -1.2},
      floorPosition: {x: 83, y: 47},
      items: [
        {
          type: 'light',
          roomDisplay: true,
          lightEntityId: 'light.bathroom_light',
          layer: {
            red: bathroomRed,
            green: bathroomGreen,
            blue: bathroomBlue,
          },
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
      position: {x: 2.9, y: 2.5, z: 0.4},
      floorPosition: {x: 65, y: 57},
      items: [
        {
          type: 'light',
          roomDisplay: true,
          lightEntityId: 'light.corridor_light',
          layer: {
            red: corridorRed,
            green: corridorGreen,
            blue: corridorBlue,
          },
        },
      ],
    },
    {
      id: 'Toilet',
      name: 'Toilette',
      position: {x: 3.8, y: 2.5, z: 2.6},
      floorPosition: {x: 69, y: 72},
      items: [
        {
          type: 'light',
          roomDisplay: true,
          lightEntityId: 'light.toilet_light',
          layer: {
            red: toiletRed,
            green: toiletGreen,
            blue: toiletBlue,
          },
        },
      ],
    },
  ],
};
