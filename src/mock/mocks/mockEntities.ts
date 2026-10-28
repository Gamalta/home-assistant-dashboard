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
import {createTrain} from './createTrain';
import {createMediaPlayer} from './createMediaPlayer';
import {MediaPlayerFeature} from '../../utils/entity/media';
import {createScript} from './createScript';
import {createLoan} from './createLoan';

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

  ...createCover('cover.living_room_shutter', {
    attributes: {friendly_name: 'Volet du séjour'},
  }),
  ...createCover('cover.kitchen_shutter', {
    attributes: {friendly_name: 'Fenêtre de la cuisine'},
  }),
  ...createCover('cover.kitchen_shutter_2', {
    attributes: {friendly_name: 'Porte-fenêtre de la cuisine'},
  }),
  ...createCover('cover.bedroom_shutter', {
    attributes: {friendly_name: 'Volet de la chambre'},
  }),
  ...createCover('cover.bedroom_2_shutter', {
    attributes: {friendly_name: 'Volet de la chambre 2'},
  }),
  ...createCover('cover.bedroom_3_shutter', {
    attributes: {friendly_name: 'Volet de la chambre 3'},
  }),

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
  ...createTrain('sensor.sncf_paris_lyon_train_1', {
    departureIn: 6,
    trainNum: '6601',
    platform: 'B',
  }),
  ...createTrain('sensor.sncf_paris_lyon_train_2', {
    departureIn: 21,
    trainNum: '6603',
    delay: 5,
  }),
  ...createTrain('sensor.sncf_paris_lyon_train_3', {
    departureIn: 36,
    trainNum: '6605',
    cancelled: true,
  }),
  ...createTrain('sensor.sncf_paris_lyon_train_4', {
    departureIn: 51,
    trainNum: '6607',
  }),
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

  ...createScript('script.leave_home', {
    attributes: {friendly_name: 'Départ', icon: 'mdi:exit-run'},
  }),
  ...createScript('script.energy', {
    attributes: {friendly_name: 'Énergie', icon: 'mdi:lightning-bolt'},
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

  ...createLoan('sensor.loan_main', {
    label: 'Prêt principal',
    principal: 250_000,
    annualRate: 1.45,
    durationMonths: 300,
    firstMonth: '2021-06',
    monthlyInsurance: 28,
  }),
  ...createLoan('sensor.loan_ptz', {
    label: 'PTZ',
    principal: 40_000,
    annualRate: 0,
    durationMonths: 240,
    firstMonth: '2021-06',
    monthlyInsurance: 6,
  }),
  ...createLoan('sensor.loan_action_logement', {
    label: 'Action Logement',
    principal: 30_000,
    annualRate: 0.5,
    durationMonths: 240,
    firstMonth: '2021-06',
    monthlyInsurance: 4,
  }),
  ...createLoan('sensor.loan_works', {
    label: 'Prêt travaux',
    principal: 15_000,
    annualRate: 2.9,
    durationMonths: 120,
    firstMonth: '2023-03',
    monthlyInsurance: 3,
  }),
} as const;
