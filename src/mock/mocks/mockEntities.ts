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
import {createSwitch} from './createSwitch';
import {createPrinter3d} from './createPrinter3d';
import {createMediaPlayer} from './createMediaPlayer';
import {MediaPlayerFeature} from '../../utils/entity/media';
import {createScript} from './createScript';
import {createUpdate} from './createUpdate';

const DAY = 24 * 60 * 60 * 1000;

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
  // Sauvegarde quotidienne : réussie il y a 3 jours, échouée hier.
  ...createSensor('sensor.backup_last_successful', {
    state: new Date(Date.now() - 3.1 * DAY).toISOString(),
  }),
  ...createSensor('sensor.backup_last_attempted', {
    state: new Date(Date.now() - 1.1 * DAY).toISOString(),
  }),
  ...createSensor('sensor.backup_next_scheduled', {
    state: new Date(Date.now() + 0.9 * DAY).toISOString(),
  }),
  ...createSensor('sensor.backup_manager_state', {state: 'idle'}),
  ...createUpdate('update.home_assistant_core_update', {
    state: 'on',
    attributes: {latest_version: '2026.10.2'},
  }),
  ...createUpdate('update.zigbee_bridge_update', {
    state: 'on',
    attributes: {
      friendly_name: 'Pont Zigbee',
      installed_version: '2.6.0',
      latest_version: '2.7.0',
    },
  }),
  ...createUpdate('update.home_assistant_operating_system_update', {
    attributes: {
      friendly_name: 'Home Assistant Operating System',
      installed_version: '16.2',
      latest_version: '16.2',
    },
  }),

  ...createCover('cover.living_room_shutter'),
  ...createCover('cover.kitchen_shutter'),
  ...createCover('cover.kitchen_shutter_2'),
  ...createCover('cover.bedroom_shutter'),
  ...createCover('cover.bedroom_2_shutter'),
  ...createCover('cover.bedroom_3_shutter'),

  ...createLight('light.living_room_light', {
    state: 'off',
    attributes: {
      friendly_name: 'Plafonnier du séjour',
      icon: 'hue:bulb-sultan',
      color_mode: 'hs',
      hs_color: [28, 64],
    },
  }),
  ...createLight('light.living_room_hue_play', {
    attributes: {
      friendly_name: 'Hue Play du séjour',
      icon: 'hue:play-bar-v',
      color_mode: 'hs',
      hs_color: [240, 100],
    },
  }),
  ...createLight('light.kitchen_light', {
    state: 'off',
    attributes: {
      friendly_name: 'Cuisine',
      icon: 'hue:bulb-sultan',
      color_mode: 'hs',
      hs_color: [28, 64],
    },
  }),
  ...createLight('light.dining_light', {
    attributes: {
      friendly_name: 'Salle à manger',
      icon: 'hue:bulb-sultan',
      color_mode: 'hs',
      hs_color: [28, 64],
    },
  }),
  ...createLight('light.bedroom_light', {
    attributes: {
      friendly_name: 'Chambre',
      icon: 'hue:bulb-sultan',
      color_mode: 'hs',
      hs_color: [28, 64],
    },
  }),
  ...createLight('light.bedroom_dressing_light', {
    state: 'off',
    attributes: {
      friendly_name: 'Dressing',
      icon: 'hue:bulb-spot-hung',
      color_mode: 'hs',
      hs_color: [28, 64],
    },
  }),
  ...createLight('light.bedroom_bathroom_light', {
    state: 'off',
    attributes: {
      friendly_name: 'Salle de bain de la chambre',
      icon: 'hue:bulb-sultan',
      color_mode: 'hs',
      hs_color: [28, 64],
    },
  }),
  ...createLight('light.bathroom_light', {
    state: 'off',
    attributes: {
      friendly_name: 'Salle de bain',
      icon: 'hue:bulb-sultan',
      color_mode: 'hs',
      hs_color: [28, 64],
    },
  }),
  ...createLight('light.bedroom_2_light', {
    state: 'off',
    attributes: {
      friendly_name: 'Chambre 2',
      icon: 'hue:bulb-sultan',
      color_mode: 'hs',
      hs_color: [28, 64],
    },
  }),
  ...createLight('light.bedroom_3_light', {
    attributes: {
      friendly_name: 'Chambre 3',
      icon: 'hue:bulb-sultan',
      color_mode: 'hs',
      hs_color: [28, 64],
    },
  }),
  ...createLight('light.cellar_light', {
    state: 'off',
    attributes: {
      friendly_name: 'Cellier',
      icon: 'hue:bulb-sultan',
      color_mode: 'hs',
      hs_color: [28, 64],
    },
  }),
  ...createLight('light.toilet_light', {
    state: 'off',
    attributes: {
      friendly_name: 'Toilettes',
      icon: 'hue:bulb-candle',
      color_mode: 'hs',
      hs_color: [28, 64],
    },
  }),
  ...createLight('light.corridor_light', {
    state: 'off',
    attributes: {
      friendly_name: 'Couloir',
      icon: 'hue:bulb-spot-hung',
      color_mode: 'hs',
      hs_color: [28, 64],
    },
  }),
  ...createLight('light.hallway_dimmer', {
    state: 'off',
    attributes: {
      friendly_name: 'Variateur de l’entrée',
      icon: 'hue:bulb-sultan',
      color_mode: 'brightness',
      supported_color_modes: ['brightness'],
      supported_features: 0,
      brightness: 128,
      hs_color: undefined,
      rgb_color: undefined,
      xy_color: undefined,
      color_temp_kelvin: undefined,
    },
  }),
  ...createLight('light.storage_switch', {
    attributes: {
      friendly_name: 'Interrupteur du débarras',
      icon: 'hue:bulb-candle',
      color_mode: 'onoff',
      supported_color_modes: ['onoff'],
      supported_features: 0,
      brightness: undefined,
      hs_color: undefined,
      rgb_color: undefined,
      xy_color: undefined,
      color_temp_kelvin: undefined,
    },
  }),

  ...createClimate('climate.living_room'),
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
  ...createSensor('sensor.living_room_temperature', {
    state: '21',
    attributes: {
      unit_of_measurement: '°C',
    },
  }),
  ...createSensor('sensor.living_room_humidity', {
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

  ...createSwitch('switch.desk_outlet', {
    state: 'on',
    attributes: {friendly_name: 'Prise bureau'},
  }),
  ...createSensor('sensor.desk_outlet_power', {
    state: '85.4',
    attributes: {unit_of_measurement: 'W', device_class: 'power'},
  }),
  // TV éteinte à la télécommande : la prise reste allumée et consomme peu.
  ...createSwitch('switch.tv_outlet', {
    state: 'on',
    attributes: {friendly_name: 'Prise TV'},
  }),
  ...createSensor('sensor.tv_outlet_power', {
    state: '0.8',
    attributes: {unit_of_measurement: 'W', device_class: 'power'},
  }),
  ...createPrinter3d('p1s_demo'),
  ...createMediaPlayer('media_player.living_room_tv', {
    state: 'playing',
    attributes: {
      friendly_name: 'TV du séjour',
      supported_features:
        MediaPlayerFeature.PAUSE |
        MediaPlayerFeature.PLAY |
        MediaPlayerFeature.PREVIOUS_TRACK |
        MediaPlayerFeature.NEXT_TRACK |
        MediaPlayerFeature.VOLUME_SET |
        MediaPlayerFeature.VOLUME_MUTE |
        MediaPlayerFeature.TURN_ON |
        MediaPlayerFeature.TURN_OFF |
        MediaPlayerFeature.SELECT_SOURCE,
      volume_level: 0.3,
      is_volume_muted: false,
      media_title: 'My Way',
      media_artist: 'Calvin Harris',
      app_name: 'YouTube Music',
      entity_picture: 'media/demo_cover.svg',
      source: 'Apple TV',
      source_list: ['Apple TV', 'Freebox', 'Console'],
    },
  }),
  ...createMediaPlayer('media_player.bedroom_speaker', {
    state: 'paused',
    attributes: {
      friendly_name: 'Enceinte de la chambre',
      supported_features:
        MediaPlayerFeature.PAUSE |
        MediaPlayerFeature.PLAY |
        MediaPlayerFeature.NEXT_TRACK,
      media_title: 'Human',
      media_artist: "Rag'n'Bone Man",
      app_name: 'Spotify',
      entity_picture: 'media/demo_cover.svg',
    },
  }),

  ...createScript('script.depart', {
    attributes: {friendly_name: 'Départ', icon: 'mdi:exit-run'},
  }),
  ...createScript('script.temperature', {
    attributes: {friendly_name: 'Température', icon: 'mdi:thermometer'},
  }),
  ...createScript('script.energie', {
    attributes: {friendly_name: 'Énergie', icon: 'mdi:lightning-bolt'},
  }),
} as const;
