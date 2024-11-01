import {HouseConfigType, SideBarConfigType} from '../house';
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

export const ConfigName = 'Démo';

export const SideBarConfig: SideBarConfigType = {
  weather: 'weather.home',
  persons: [
    {
      name: 'Elise',
      entity: 'person.elise',
      avatar: 'person/Elise.png',
      home_zone: 'zone.home',
      home_distance: 'sensor.home_iphone_de_elise_distance',
      work_zone: 'zone.elio_work',
      focus: 'binary_sensor.iphone_de_elise_focus',
      battery_level: 'sensor.iphone_de_elise_battery_level',
      battery_state: 'sensor.iphone_de_elise_battery_state',
    },
    {
      name: 'Elio',
      entity: 'person.home',
      avatar: 'person/Elio.png',
      home_zone: 'zone.home',
      home_distance: 'sensor.home_3eur_la_minute_distance',
      work_zone: 'zone.elio_work',
      focus: 'binary_sensor.3eur_la_minute_focus',
      battery_level: 'sensor.3eur_la_minute_battery_level',
      battery_state: 'sensor.3eur_la_minute_battery_state',
    },
  ],
};

export const HouseConfig: HouseConfigType = {
  night_floor_plan: baseNight,
  day_floor_plan: baseDay,
  rooms: [
    {
      id: 'Salon',
      name: 'Séjour',
      main_light: {
        entity_id: 'light.salon_main',
        layer: {
          red: salonRed,
          green: salonGreen,
          blue: salonBlue,
        },
        position: {x: 54, y: 35},
      },
      temperature: {
        entity: 'sensor.temperature_salon',
        humidity: 'sensor.humidity_salon',
        battery: 'sensor.battery_level_atc_salon',
        signal: 'sensor.signal_atc_salon',
      },
      lights: [
        {
          entity_id: 'light.salon_hue_play',
          layer: {
            red: salonPlayRed,
            green: salonPlayGreen,
            blue: salonPlayBlue,
          },
          position: {x: 61, y: 22},
        },
      ],
    },
    {
      id: 'Office',
      name: 'Bureau',
      main_light: {
        entity_id: 'light.office_main',
        layer: {
          red: officeRed,
          green: officeGreen,
          blue: officeBlue,
        },
        position: {x: 24, y: 77},
      },
      temperature: {
        entity: 'sensor.temperature_office',
        humidity: 'sensor.humidity_office',
        battery: 'sensor.battery_level_atc_office',
        signal: 'sensor.signal_atc_office',
      },
      lights: [
        {
          entity_id: 'light.office_hue_iris',
          layer: {
            red: officeIrisRed,
            green: officeIrisGreen,
            blue: officeIrisBlue,
          },
          position: {x: 21, y: 67},
        },
      ],
    },
    {
      id: 'Bedroom',
      name: 'Chambre',
      main_light: {
        entity_id: 'light.bedroom_main',
        layer: {
          red: bedroomRed,
          green: bedroomGreen,
          blue: bedroomBlue,
        },
        position: {x: 72, y: 75},
      },
      temperature: {
        entity: 'sensor.temperature_bedroom',
        humidity: 'sensor.humidity_bedroom',
        battery: 'sensor.battery_level_atc_bedroom',
        signal: 'sensor.signal_atc_bedroom',
      },
    },
    {
      id: 'Bedroom_2',
      name: 'Chambre 2',
      main_light: {
        entity_id: 'light.bedroom_2_main',
        layer: {
          red: bedroom2Red,
          green: bedroom2Green,
          blue: bedroom2Blue,
        },
        position: {x: 75, y: 30},
      },
      temperature: {
        entity: 'sensor.temperature_bedroom2',
        humidity: 'sensor.humidity_bedroom2',
        battery: 'sensor.battery_level_atc_bedroom2',
        signal: 'sensor.signal_atc_bedroom2',
      },
    },
  ],
};
