import type {HassEntities} from 'home-assistant-js-websocket';
import {createClimate} from './createClimate';
import {createCover} from './createCover';
import {createLight} from './createLight';
import {createPerson} from './createPerson';
import {createWeather} from './createWeather';
// fixtures
import openWeatherFixture from './fixtures/open-weather';
import {createSensor} from './createSensor';
import { createBinarySensor } from './createBinarySensor';

export const entities: HassEntities = {
  ...createWeather('weather.home', openWeatherFixture),
  ...createSensor('sensor.system_monitor_last_boot'),
  ...createBinarySensor('binary_sensor.rpi_power_status'),
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
  ...createCover('cover.office_shutter'),
  ...createCover('cover.bedroom_shutter'),
  ...createCover('cover.bedroom_2_shutter'),

  ...createLight('light.salon_light', {
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
  ...createLight('light.office_switch', {
    state: 'off',
    attributes: {
      icon: 'hue:bulb-sultan',
      color_mode: 'hs',
      hs_color: [28, 64],
    },
  }),
  ...createLight('light.office_hue_iris', {
    attributes: {icon: 'hue:iris', color_mode: 'hs', hs_color: [350, 80]},
  }),
  ...createLight('light.bedroom_light', {
    attributes: {icon: 'hue:bulb-sultan', color_mode: 'hs', hs_color: [28, 64]},
  }),
  ...createLight('light.bedroom_2_light', {
    state: 'off',
    attributes: {icon: 'hue:bulb-sultan', color_mode: 'hs', hs_color: [28, 64]},
  }),

  ...createClimate('climate.salon'),
  ...createSensor('sensor.salon_temperature', {
    state: '21',
    attributes: {
      unit_of_measurement: '°C',
    },
  }),
  ...createSensor('sensor.salon_humidity'),
  ...createClimate('climate.office'),
  ...createSensor('sensor.office_temperature', {
    state: '21',
    attributes: {
      unit_of_measurement: '°C',
    },
  }),
  ...createSensor('sensor.office_humidity', {
    state: '55',
    attributes: {
      unit_of_measurement: '%',
    },
  }),
  ...createClimate('climate.bedroom'),
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

  ...createPerson('person.john_doe'),
  ...createPerson('person.jane_doe', {
    state: 'not_home',
    attributes: {
      friendly_name: 'Jane',
      latitude: 48.85837,
      longitude: 2.294481,
    },
  }),
} as const;
