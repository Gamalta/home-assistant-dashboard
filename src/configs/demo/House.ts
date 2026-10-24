import {HouseConfigType} from '../house';
import {SideBarConfigType} from '../sidebar';
import Demo from './Demo.glb?url';

export const ConfigName = 'Démo';

export const SideBarConfig: SideBarConfigType = {
  weatherEntityId: 'weather.home',
  pets: ['Tom', 'Jerry'],
  alerts: {
    smokeEntityIds: [
      'binary_sensor.hallway_smoke_detector_smoke',
      'binary_sensor.hallway_smoke_detector_heat',
    ],
    batteryLowEntityIds: ['binary_sensor.hallway_smoke_detector_battery_low'],
    batteryLevelEntityIds: [
      'sensor.kitchen_button_battery',
      'sensor.bedroom_button_battery',
      'sensor.cellar_sensor_battery',
    ],
    internetEntityId: 'binary_sensor.router_wan_status',
    zigbeeEntityId: 'binary_sensor.zigbee_bridge_connection_state',
    tabletBatteryStateEntityId: 'sensor.wall_tablet_battery_state',
  },
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
    internetEntityId: 'binary_sensor.router_wan_status',
    lastBackupEntityId: 'sensor.backup_last_successful',
    lastBackupAttemptEntityId: 'sensor.backup_last_attempted',
    nextBackupEntityId: 'sensor.backup_next_scheduled',
    backupStateEntityId: 'sensor.backup_manager_state',
    tabletBatteryLevelEntityId: 'sensor.wall_tablet_battery_level',
    tabletBatteryStateEntityId: 'sensor.wall_tablet_battery_state',
    tabletChargerTypeEntityId: 'sensor.wall_tablet_charger_type',
    graphs: [
      {
        color: 'error',
        label: 'Mémoire',
        sensorEntityId: 'sensor.system_monitor_memory_usage',
      },
      {
        color: 'warning',
        label: 'Température',
        sensorEntityId: 'sensor.system_monitor_processor_temperature',
      },
      {
        color: 'info',
        label: 'Processeur',
        sensorEntityId: 'sensor.system_monitor_processor_use',
      },
    ],
  },
  shortcuts: [
    {type: 'allLightsOff'},
    {
      type: 'mortgage',
      principal: 250_000,
      annualRate: 1.45,
      durationMonths: 300,
      firstPaymentDate: '2021-06-05',
      monthlyInsurance: 28,
    },
    {type: 'shoppingList', todoEntityId: 'todo.shopping_list'},
    {type: 'trains', label: 'Vers le travail', prefix: 'sncf_paris_lyon'},
    {
      type: 'energy',
      powerEntityId: 'sensor.meter_apparent_power',
      tariffPeriodEntityId: 'sensor.meter_tariff_period',
      peakIndexEntityId: 'sensor.meter_peak_index',
      offPeakIndexEntityId: 'sensor.meter_off_peak_index',
      subscribedCurrentEntityId: 'sensor.meter_subscribed_current',
      prices: {peak: 0.27, offPeak: 0.21},
    },
  ],
};

export const HouseConfig: HouseConfigType = {
  model: Demo,
  rooms: [
    {
      id: 'Salon',
      name: 'Séjour',
      position: {x: -0.8, y: 2.5, z: 2.8},
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
          position: {x: -3.2, y: 0.3, z: 3.1},
        },
        {
          type: 'shutter',
          shutterEntityId: 'cover.salon_shutter',
          position: {x: -0.8, y: 1.3, z: 5.8},
        },
        {
          type: 'plug',
          switchEntityId: 'switch.tv_plug',
          powerEntityId: 'sensor.tv_plug_power',
          position: {x: -3.3, y: 0.3, z: 4.3},
        },
        {
          type: 'media',
          mediaPlayerEntityId: 'media_player.living_room_tv',
          remoteEntityId: 'remote.living_room_tv',
          position: {x: -3.3, y: 1.4, z: 4.4},
        },
        {
          type: 'light',
          lightEntityId: 'light.salon_strip',
          position: {x: -3.0, y: 0.4, z: 5.6},
        },
        {
          type: 'ambilight',
          lightEntityId: 'light.tv_ambilight',
          position: {x: -3.3, y: 2.6, z: 4.0},
        },
        {
          type: 'battery',
          name: 'Interrupteur du séjour',
          batteryEntityId: 'sensor.salon_button_battery',
          position: {x: 1.4, y: 1.1, z: 1.6},
        },
      ],
    },
    {
      id: 'Kitchen',
      name: 'Cuisine',
      position: {x: -0.5, y: 2.5, z: -5.3},
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
          position: {x: 1.0, y: 1.5, z: -7.2},
        },
        {
          type: 'shutter',
          shutterEntityId: 'cover.kitchen_shutter_2',
          position: {x: -2.5, y: 0.8, z: -4.2},
        },
        {
          type: 'battery',
          name: 'Interrupteur de la cuisine',
          batteryEntityId: 'sensor.kitchen_button_battery',
          position: {x: 1.4, y: 1.1, z: -5},
        },
      ],
    },
    {
      id: 'Dining',
      name: 'Salle à manger',
      position: {x: 0.5, y: 2.5, z: -2.45},
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
      position: {x: -5.25, y: 2.5, z: 2.15},
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
          position: {x: -5.6, y: 1.3, z: 4},
        },
        {
          type: 'battery',
          name: 'Interrupteur de la chambre',
          batteryEntityId: 'sensor.bedroom_button_battery',
          position: {x: -3.9, y: 1.1, z: 0.9},
        },
      ],
    },
    {
      id: 'Bedroom_dressing',
      name: 'Dressing',
      position: {x: -5.7, y: 2.5, z: -0.4},
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
      position: {x: -5.7, y: 2.5, z: -2.5},
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
      position: {x: 5.1, y: 2.5, z: -3.5},
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
          position: {x: 4.2, y: 1.3, z: -5},
        },
        {
          type: 'printer3d',
          prefix: 'p1s_demo',
          position: {x: 6.2, y: 1.1, z: -1.8},
        },
      ],
    },
    {
      id: 'Bedroom_3',
      name: 'Chambre 3',
      position: {x: 6, y: 2.5, z: 2},
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
          position: {x: 6.5, y: 1.3, z: 4.2},
        },
        {
          type: 'plug',
          switchEntityId: 'switch.desk_plug',
          powerEntityId: 'sensor.desk_plug_power',
          position: {x: 5.8, y: 0.8, z: 1.2},
        },
      ],
    },
    {
      id: 'Cellar',
      name: 'Cellier',
      position: {x: -2.5, y: 2.5, z: -2.5},
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
      position: {x: 6, y: 2.5, z: -1.2},
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
      position: {x: 2.9, y: 2.5, z: 0.4},
      items: [
        {
          type: 'light',
          roomDisplay: true,
          lightEntityId: 'light.corridor_light',
        },
        {
          type: 'smoke',
          smokeEntityId: 'binary_sensor.hallway_smoke_detector_smoke',
          heatEntityId: 'binary_sensor.hallway_smoke_detector_heat',
          batteryEntityId: 'sensor.hallway_smoke_detector_battery',
          batteryLowEntityId:
            'binary_sensor.hallway_smoke_detector_battery_low',
          tamperEntityId: 'binary_sensor.hallway_smoke_detector_tamper',
          testEntityId: 'button.hallway_smoke_detector_test',
          position: {x: 2.9, y: 2.4, z: -1.1},
        },
      ],
    },
    {
      id: 'Toilet',
      name: 'Toilette',
      position: {x: 3.8, y: 2.5, z: 2.6},
      items: [
        {
          type: 'light',
          roomDisplay: true,
          lightEntityId: 'light.toilet_light',
        },
      ],
    },
    {
      id: 'Hallway',
      name: 'Entrée',
      position: {x: 1.5, y: 2.5, z: 4},
      items: [
        {
          type: 'light',
          roomDisplay: true,
          lightEntityId: 'light.hallway_dimmer',
        },
      ],
    },
    {
      id: 'Storage',
      name: 'Débarras',
      position: {x: 4, y: 2.5, z: 4.6},
      items: [
        {
          type: 'light',
          roomDisplay: true,
          lightEntityId: 'light.storage_switch',
        },
      ],
    },
  ],
};
