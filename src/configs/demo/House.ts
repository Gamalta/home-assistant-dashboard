import {HouseConfigType} from '../house';
import baseDay from './assets/base_day.png';
import baseNight from './assets/base_night.png';
import salonRed from './assets/light/salon_red.png';
import salonGreen from './assets/light/salon_green.png';
import salonBlue from './assets/light/salon_blue.png';
import salonPlayRed from './assets/light/salon_play_red.png';
import salonPlayGreen from './assets/light/salon_play_green.png';
import salonPlayBlue from './assets/light/salon_play_blue.png';
import bedroomRed from './assets/light/bedroom_red.png';
import bedroomGreen from './assets/light/bedroom_green.png';
import bedroomBlue from './assets/light/bedroom_blue.png';
import bedroom2Red from './assets/light/bedroom2_red.png';
import bedroom2Green from './assets/light/bedroom2_green.png';
import bedroom2Blue from './assets/light/bedroom2_blue.png';
import officeRed from './assets/light/office_red.png';
import officeGreen from './assets/light/office_green.png';
import officeBlue from './assets/light/office_blue.png';
import officeIrisRed from './assets/light/office_iris_red.png';
import officeIrisGreen from './assets/light/office_iris_green.png';
import officeIrisBlue from './assets/light/office_iris_blue.png';
import {SideBarConfigType} from '../sidebar';

export const ConfigName = 'Démo';

export const SideBarConfig: SideBarConfigType = {
  weatherEntityId: 'weather.home',
  persons: [
    {
      name: 'Elise',
      personEntityId: 'person.elise',
      avatar: 'person/Elise.png',
      homeZoneEntityId: 'zone.home',
      homeDistanceEntityId: 'sensor.home_iphone_de_elise_distance',
      workZoneEntityId: 'zone.elio_work',
      focusEntityId: 'binary_sensor.iphone_de_elise_focus',
      batteryLevelEntityId: 'sensor.iphone_de_elise_battery_level',
      batteryStateEntityId: 'sensor.iphone_de_elise_battery_state',
    },
    {
      name: 'Elio',
      personEntityId: 'person.home',
      avatar: 'person/Elio.png',
      homeZoneEntityId: 'zone.home',
      homeDistanceEntityId: 'sensor.home_3eur_la_minute_distance',
      workZoneEntityId: 'zone.elio_work',
      focusEntityId: 'binary_sensor.3eur_la_minute_focus',
      batteryLevelEntityId: 'sensor.3eur_la_minute_battery_level',
      batteryStateEntityId: 'sensor.3eur_la_minute_battery_state',
    },
  ],
  system: {
    uptimeEntityId: 'sensor.system_monitor_last_boot',
    powerStatusEntityId: 'binary_sensor.rpi_power_status',
    graphs: [
      {
        color: 'red',
        label: 'Mémoir:',
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
      position: {x: 54, y: 35},
      items: [
        {
          type: 'light',
          roomDisplay: true,
          lightEntityId: 'light.salon_main',
          layer: {
            red: salonRed,
            green: salonGreen,
            blue: salonBlue,
          },
        },
        {
          type: 'temperature',
          roomDisplay: true,
          temperatureEntityId: 'sensor.temperature_salon',
          humidityEntityId: 'sensor.humidity_salon',
          batteryEntityId: 'sensor.battery_level_atc_salon',
          signalEntityId: 'sensor.signal_atc_salon',
        },
        {
          type: 'light',
          lightEntityId: 'light.salon_hue_play',
          layer: {
            red: salonPlayRed,
            green: salonPlayGreen,
            blue: salonPlayBlue,
          },
          position: {x: 61, y: 22},
        },
        {
          type: 'shutter',
          shutterEntityId: 'cover.salon',
          position: {x: 55, y: 17},
        },
      ],
    },
    {
      id: 'Office',
      name: 'Bureau',
      position: {x: 24, y: 77},
      items: [
        {
          type: 'light',
          roomDisplay: true,
          lightEntityId: 'light.office_main',
          layer: {
            red: officeRed,
            green: officeGreen,
            blue: officeBlue,
          },
        },
        {
          type: 'temperature',
          roomDisplay: true,
          temperatureEntityId: 'sensor.temperature_office',
          humidityEntityId: 'sensor.humidity_office',
          batteryEntityId: 'sensor.battery_level_atc_office',
          signalEntityId: 'sensor.signal_atc_office',
        },
        {
          type: 'light',
          lightEntityId: 'light.office_hue_iris',
          layer: {
            red: officeIrisRed,
            green: officeIrisGreen,
            blue: officeIrisBlue,
          },
          position: {x: 21, y: 67},
        },
        {
          type: 'desktop',
          position: {x: 29.5, y: 83},
          options: [
            {
              icon: 'windows',
              label: 'Windows',
              color: '#357EC7',
              scriptEntityId: 'script.start_windows_desktop',
            },
            {
              icon: 'power',
              scriptEntityId: 'script.start_default_desktop',
            },
            {
              icon: 'ubuntu',
              label: 'Ubuntu',
              color: '#E95420',
              scriptEntityId: 'script.start_ubuntu_desktop',
            },
            {
              label: 'bios',
              scriptEntityId: 'script.start_bios_desktop',
              hide: true,
            },
          ],
        },
        {
          type: 'shutter',
          shutterEntityId: 'cover.office',
          position: {x: 25.5, y: 90},
        },
      ],
    },
    {
      id: 'Bedroom',
      name: 'Chambre',
      position: {x: 72, y: 75},
      items: [
        {
          type: 'light',
          roomDisplay: true,
          lightEntityId: 'light.bedroom_main',
          layer: {
            red: bedroomRed,
            green: bedroomGreen,
            blue: bedroomBlue,
          },
        },
        {
          type: 'temperature',
          roomDisplay: true,
          temperatureEntityId: 'sensor.temperature_bedroom',
          humidityEntityId: 'sensor.humidity_bedroom',
          batteryEntityId: 'sensor.battery_level_atc_bedroom',
          signalEntityId: 'sensor.signal_atc_bedroom',
        },
        {
          type: 'shutter',
          shutterEntityId: 'cover.bedroom',
          position: {x: 81.5, y: 72},
        },
      ],
    },
    {
      id: 'Bedroom_2',
      name: 'Chambre 2',
      position: {x: 75, y: 30},
      items: [
        {
          type: 'light',
          roomDisplay: true,
          lightEntityId: 'light.bedroom_2_main',
          layer: {
            red: bedroom2Red,
            green: bedroom2Green,
            blue: bedroom2Blue,
          },
        },
        {
          type: 'temperature',
          roomDisplay: true,
          temperatureEntityId: 'sensor.temperature_bedroom2',
          humidityEntityId: 'sensor.humidity_bedroom2',
          batteryEntityId: 'sensor.battery_level_atc_bedroom2',
          signalEntityId: 'sensor.signal_atc_bedroom2',
        },
        {
          type: 'shutter',
          shutterEntityId: 'cover.bedroom2',
          position: {x: 73, y: 17},
        },
      ],
    },
  ],
};
