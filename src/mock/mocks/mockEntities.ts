import type {HassEntities} from 'home-assistant-js-websocket';
import {createClimate} from './createClimate';
import {createCover} from './createCover';
import {createLight} from './createLight';
import {createPerson} from './createPerson';
import {createWeather} from './createWeather';
// fixtures
import openWeatherFixture from './fixtures/open-weather';

export const entities: HassEntities = {
  ...createWeather('weather.home', openWeatherFixture),

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
  ...createClimate('climate.office'),
  ...createClimate('climate.bedroom'),
  ...createClimate('climate.bedroom_2'),

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
