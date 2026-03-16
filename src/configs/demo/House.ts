import {HouseConfigType} from '../house';
import baseDay from './assets/base_day.png';
import baseNight from './assets/base_night.png';
import salonRed from './assets/light/salon_red.png'
import salonGreen from './assets/light/salon_green.png'
import salonBlue from './assets/light/salon_blue.png'
import salonPlayRed from './assets/light/salon_play_red.png'
import salonPlayGreen from './assets/light/salon_play_green.png'
import salonPlayBlue from './assets/light/salon_play_blue.png'
import kitchenRed from './assets/light/kitchen_red.png'
import kitchenGreen from './assets/light/kitchen_green.png'
import kitchenBlue from './assets/light/kitchen_blue.png'
import cellarRed from './assets/light/cellar_red.png'
import cellarGreen from './assets/light/cellar_green.png'
import cellarBlue from './assets/light/cellar_blue.png'
import diningRed from './assets/light/dining_red.png'
import diningGreen from './assets/light/dining_green.png'
import diningBlue from './assets/light/dining_blue.png'
import bedroomRed from './assets/light/bedroom_red.png'
import bedroomGreen from './assets/light/bedroom_green.png'
import bedroomBlue from './assets/light/bedroom_blue.png'
import bedroomDressingRed from './assets/light/bedroom_dressing_red.png'
import bedroomDressingGreen from './assets/light/bedroom_dressing_green.png'
import bedroomDressingBlue from './assets/light/bedroom_dressing_blue.png'
import bedroomBathroomRed from './assets/light/bedroom_bathroom_red.png'
import bedroomBathroomGreen from './assets/light/bedroom_bathroom_green.png'
import bedroomBathroomBlue from './assets/light/bedroom_bathroom_blue.png'
import bathroomRed from './assets/light/bathroom_red.png'
import bathroomGreen from './assets/light/bathroom_green.png'
import bathroomBlue from './assets/light/bathroom_blue.png'
import bedroom2Red from './assets/light/bedroom_2_red.png'
import bedroom2Green from './assets/light/bedroom_2_green.png'
import bedroom2Blue from './assets/light/bedroom_2_blue.png'
import bedroom3Red from './assets/light/bedroom_3_red.png'
import bedroom3Green from './assets/light/bedroom_3_green.png'
import bedroom3Blue from './assets/light/bedroom_3_blue.png'
import corridorRed from './assets/light/corridor_red.png'
import corridorGreen from './assets/light/corridor_green.png'
import corridorBlue from './assets/light/corridor_blue.png'
import toiletRed from './assets/light/toilet_red.png'
import toiletGreen from './assets/light/toilet_green.png'
import toiletBlue from './assets/light/toilet_blue.png'
import {SideBarConfigType} from '../sidebar';

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
  nightFloorPlan: baseNight,
  dayFloorPlan: baseDay,
  rooms: [
    {
      id: 'Salon',
      name: 'Séjour',
      position: {x: 44, y: 73},
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
          position: {x: 31, y: 72},
        },
        {
          type: 'shutter',
          shutterEntityId: 'cover.salon_shutter',
          position: {x: 43.25, y: 91},
        },
      ],
    },
    {
      id: 'Kitchen',
      name: 'Cuisine',
      position: {x: 45, y: 18},
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
          position: {x: 44, y: 8},
        },
        {
          type: 'shutter',
          shutterEntityId: 'cover.kitchen_shutter_2',
          position: {x: 33.5, y: 27.5},
        },
      ],
    },
    {
      id: 'Dining',
      name: 'Salle à manger',
      position: {x: 50, y: 39.25},
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
      position: {x: 20, y: 65},
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
          position: {x: 18, y: 80.5},
        },
      ],
    },
    {
      id: 'Bedroom_dressing',
      name: 'Dressing',
      position: {x: 14, y: 52},
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
      position: {x: 17, y: 39},
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
          humidityEntityId: 'sensor.bedroom_bathroom_humidity'
        }
      ],
    },
    {
      id: 'Bedroom_2',
      name: 'Chambre 2',
      position: {x: 78, y: 31.5},
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
          position: {x: 70, y: 23},
        },
      ],
    },
    {
      id: 'Bedroom_3',
      name: 'Chambre 3',
      position: {x: 83, y: 68},
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
          position: {x: 83, y: 80},
        },
      ],
    },
    {
      id: 'Cellar',
      name: 'Cellier',
      position: {x: 33, y: 40},
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
      position: {x: 83, y: 47},
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
          humidityEntityId: 'sensor.bathroom_humidity'
        }
      ],
    },
    {
      id: 'Corridor',
      name: 'Couloir',
      position: {x: 65, y: 57},
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
      position: {x: 69, y: 72},
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
