import type {HassEntities} from 'home-assistant-js-websocket';
import {createClimate} from './createClimate';
import {createCover} from './createCover';
import {createLight} from './createLight';
import {createPerson} from './createPerson';
import {createWeather} from './createWeather';
// fixtures
import openWeatherFixture from './fixtures/open-weather';
import {createSensor} from './createSensor';
import {createBinarySensor} from './createBinarySensor';

export const entities: HassEntities = {
  ...createWeather('weather.home', openWeatherFixture),

  ...createPerson('person.juliette', {
    state: 'not_home',
    attributes: {
      friendly_name: 'Juliette',
      latitude: 48.85837,
      longitude: 2.294481,
    },
  }),
  ...createSensor('sensor.juliette_phone_battery_level', {
    state: '43',
    attributes: {
      unit_of_measurement: '%',
    },
  }),
  ...createSensor('sensor.juliette_phone_battery_state', {
    state: 'Not Charging',
  }),
  ...createBinarySensor('binary_sensor.juliette_phone_focus', {
    state: 'on',
  }),
  ...createSensor('sensor.home_juliette_phone_distance', {
    state: '46200',
  }),

  ...createPerson('person.romeo'),
  ...createSensor('sensor.romeo_phone_battery_level', {
    state: '75',
    attributes: {
      unit_of_measurement: '%',
    },
  }),
  ...createSensor('sensor.romeo_phone_battery_state', {
    state: 'Charging',
  }),
  ...createBinarySensor('binary_sensor.romeo_phone_focus'),
  ...createSensor('sensor.home_romeo_phone_distance', {
    state: '0',
  }),

  ...createSensor('sensor.system_monitor_last_boot', {
    last_updated: new Date(0).toISOString(),
  }),
  ...createBinarySensor('binary_sensor.rpi_power_status'),
  ...createBinarySensor('binary_sensor.router_wan_status', {
    state: 'on',
    attributes: {friendly_name: 'Connexion internet'},
  }),
  ...createSensor('sensor.wall_tablet_battery_level', {
    state: '64',
    attributes: {
      friendly_name: 'Batterie de la tablette murale',
      unit_of_measurement: '%',
    },
  }),
  ...createSensor('sensor.wall_tablet_battery_state', {
    state: 'charging',
    attributes: {friendly_name: 'Charge de la tablette murale'},
  }),
  ...createSensor('sensor.wall_tablet_charger_type', {
    state: 'ac',
    attributes: {friendly_name: 'Chargeur de la tablette murale'},
  }),
  ...createSensor('sensor.system_monitor_memory_usage', {
    state: '50',
    attributes: {
      unit_of_measurement: '%',
    },
  }),
  ...createSensor('sensor.system_monitor_processor_temperature', {
    state: '21',
    attributes: {
      unit_of_measurement: '°C',
    },
  }),
  ...createSensor('sensor.system_monitor_processor_use', {
    state: '50',
    attributes: {
      unit_of_measurement: '%',
    },
  }),

  ...createCover('cover.salon_shutter'),
  ...createCover('cover.kitchen_shutter'),
  ...createCover('cover.kitchen_shutter_2'),
  ...createCover('cover.bedroom_shutter'),
  ...createCover('cover.bedroom_2_shutter'),
  ...createCover('cover.bedroom_3_shutter'),

  ...createLight('light.salon_light', {
    state: 'off',
    attributes: {
      icon: 'hue:bulb-sultan',
      color_mode: 'hs',
      hs_color: [28, 64],
    },
  }),
  ...createLight('light.salon_hue_play', {
    attributes: {
      icon: 'hue:play-bar-v',
      color_mode: 'hs',
      hs_color: [240, 100],
    },
  }),
  ...createLight('light.kitchen_light', {
    state: 'off',
    attributes: {
      icon: 'hue:bulb-sultan',
      color_mode: 'hs',
      hs_color: [28, 64],
    },
  }),
  ...createLight('light.dining_light', {
    attributes: {
      icon: 'hue:bulb-sultan',
      color_mode: 'hs',
      hs_color: [28, 64],
    },
  }),
  ...createLight('light.bedroom_light', {
    attributes: {icon: 'hue:bulb-sultan', color_mode: 'hs', hs_color: [28, 64]},
  }),
  ...createLight('light.bedroom_dressing_light', {
    state: 'off',
    attributes: {
      icon: 'hue:bulb-spot-hung',
      color_mode: 'hs',
      hs_color: [28, 64],
    },
  }),
  ...createLight('light.bedroom_bathroom_light', {
    state: 'off',
    attributes: {icon: 'hue:bulb-sultan', color_mode: 'hs', hs_color: [28, 64]},
  }),
  ...createLight('light.bathroom_light', {
    state: 'off',
    attributes: {icon: 'hue:bulb-sultan', color_mode: 'hs', hs_color: [28, 64]},
  }),
  ...createLight('light.bedroom_2_light', {
    state: 'off',
    attributes: {icon: 'hue:bulb-sultan', color_mode: 'hs', hs_color: [28, 64]},
  }),
  ...createLight('light.bedroom_3_light', {
    attributes: {icon: 'hue:bulb-sultan', color_mode: 'hs', hs_color: [28, 64]},
  }),
  ...createLight('light.cellar_light', {
    state: 'off',
    attributes: {icon: 'hue:bulb-sultan', color_mode: 'hs', hs_color: [28, 64]},
  }),
  ...createLight('light.toilet_light', {
    state: 'off',
    attributes: {icon: 'hue:bulb-candle', color_mode: 'hs', hs_color: [28, 64]},
  }),
  ...createLight('light.corridor_light', {
    state: 'off',
    attributes: {
      icon: 'hue:bulb-spot-hung',
      color_mode: 'hs',
      hs_color: [28, 64],
    },
  }),

  ...createClimate('climate.salon'),
  ...createClimate('climate.kitchen', {
    attributes: {
      current_temperature: 20,
    },
  }),
  ...createSensor('sensor.kitchen_humidity', {
    state: '55',
    attributes: {
      unit_of_measurement: '%',
    },
  }),
  ...createSensor('sensor.kitchen_temperature', {
    state: '20',
    attributes: {
      unit_of_measurement: '°C',
    },
  }),
  ...createSensor('sensor.salon_temperature', {
    state: '21',
    attributes: {
      unit_of_measurement: '°C',
    },
  }),
  ...createSensor('sensor.salon_humidity', {
    state: '55',
    attributes: {
      unit_of_measurement: '%',
    },
  }),
  ...createClimate('climate.bedroom'),
  ...createClimate('climate.bathroom', {
    attributes: {
      current_temperature: 19,
    },
  }),
  ...createClimate('climate.bedroom_bathroom', {
    attributes: {
      current_temperature: 19,
    },
  }),
  ...createSensor('sensor.bedroom_temperature', {
    state: '21',
    attributes: {
      unit_of_measurement: '°C',
    },
  }),
  ...createSensor('sensor.bedroom_humidity', {
    state: '55',
    attributes: {
      unit_of_measurement: '%',
    },
  }),
  ...createSensor('sensor.bedroom_bathroom_humidity', {
    state: '55',
    attributes: {
      unit_of_measurement: '%',
    },
  }),
  ...createSensor('sensor.bedroom_bathroom_temperature', {
    state: '19',
    attributes: {
      unit_of_measurement: '°C',
    },
  }),
  ...createSensor('sensor.bathroom_humidity', {
    state: '55',
    attributes: {
      unit_of_measurement: '%',
    },
  }),
  ...createSensor('sensor.bathroom_temperature', {
    state: '19',
    attributes: {
      unit_of_measurement: '°C',
    },
  }),
  ...createClimate('climate.bedroom_2'),
  ...createSensor('sensor.bedroom_2_temperature', {
    state: '21',
    attributes: {
      unit_of_measurement: '°C',
    },
  }),
  ...createSensor('sensor.bedroom_2_humidity', {
    state: '55',
    attributes: {
      unit_of_measurement: '%',
    },
  }),
  ...createClimate('climate.bedroom_3'),
  ...createSensor('sensor.bedroom_3_temperature', {
    state: '21',
    attributes: {
      unit_of_measurement: '°C',
    },
  }),
  ...createSensor('sensor.bedroom_3_humidity', {
    state: '55',
    attributes: {
      unit_of_measurement: '%',
    },
  }),

  // Alertes de la démo : une pile faible et un capteur indisponible.
  ...createBinarySensor('binary_sensor.hallway_smoke_detector_smoke', {
    attributes: {friendly_name: 'Détecteur du couloir', device_class: 'smoke'},
  }),
  ...createBinarySensor('binary_sensor.hallway_smoke_detector_heat', {
    attributes: {friendly_name: 'Détecteur du couloir', device_class: 'heat'},
  }),
  ...createBinarySensor('binary_sensor.hallway_smoke_detector_battery_low', {
    attributes: {friendly_name: 'Pile du détecteur du couloir'},
  }),
  ...createSensor('sensor.kitchen_button_battery', {
    state: '12',
    attributes: {
      friendly_name: 'Bouton de la cuisine',
      unit_of_measurement: '%',
      device_class: 'battery',
    },
  }),
  ...createSensor('sensor.bedroom_button_battery', {
    state: '85',
    attributes: {
      friendly_name: 'Bouton de la chambre',
      unit_of_measurement: '%',
      device_class: 'battery',
    },
  }),
  ...createSensor('sensor.cellar_sensor_battery', {
    state: 'unavailable',
    attributes: {
      friendly_name: 'Capteur de la cave',
      unit_of_measurement: '%',
      device_class: 'battery',
    },
  }),
  ...createBinarySensor('binary_sensor.zigbee_bridge_connection_state', {
    state: 'on',
    attributes: {friendly_name: 'Pont Zigbee'},
  }),
} as const;
