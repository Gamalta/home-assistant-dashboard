import {FilterByDomain, EntityName} from '@hakit/core';

type Position3dType = {x: number; y: number; z: number};
/** Position en pourcentage de la largeur / hauteur du plan 2D. */
type Position2dType = {x: number; y: number};

type HouseConfigType = {
  /** Modèle glTF utilisé par la vue 3D. */
  model?: string;
  /** Caméra du modèle donnant la position initiale (sinon la première). */
  camera?: string;
  /** Point visé par la caméra (par défaut l'origine). */
  cameraTarget?: Position3dType;
  /** Plans utilisés par la vue 2D (fallback sans WebGL). */
  floorPlan?: {
    day: string;
    night: string;
  };
  rooms: {
    id: string;
    name: string;
    position: Position3dType;
    floorPosition?: Position2dType;
    items?: RoomItemConfigType[];
  }[];
};

type RoomItemConfigType =
  | LightConfigType
  | ClimateConfigType
  | TemperatureConfigType
  | ShutterConfigType
  | DestkopConfigType;

type BaseItemConfigType =
  | {
      type: string;
      roomDisplay: true;
    }
  | {
      type: string;
      roomDisplay?: false;
      position: Position3dType;
      floorPosition?: Position2dType;
    };

type LightConfigType = BaseItemConfigType & {
  type: 'light';
  lightEntityId: FilterByDomain<EntityName, 'light'>;
  /**
   * Noms des lumières du modèle 3D pilotées par cette entité.
   * Par défaut : toutes celles dont le nom commence par l'id de l'entité.
   */
  lightNames?: string[];
  /** Intensité 3D à pleine luminosité (12.75 par défaut, dépend des unités de l'export). */
  intensity?: number;
  /** Calques RGB utilisés par la vue 2D. */
  layer?: {
    red: string;
    green: string;
    blue: string;
  };
};

type ClimateConfigType = BaseItemConfigType & {
  type: 'climate';
  climateEntityId: FilterByDomain<EntityName, 'climate'>;
  temperatureEntityId?: FilterByDomain<EntityName, 'sensor'>;
  humidityEntityId?: FilterByDomain<EntityName, 'sensor'>;
};

type TemperatureConfigType = BaseItemConfigType & {
  type: 'temperature';
  temperatureEntityId: FilterByDomain<EntityName, 'sensor'>;
  humidityEntityId?: FilterByDomain<EntityName, 'sensor'>;
  batteryEntityId?: FilterByDomain<EntityName, 'sensor'>;
  signalEntityId?: FilterByDomain<EntityName, 'sensor'>;
};

type ShutterConfigType = BaseItemConfigType & {
  type: 'shutter';
  shutterEntityId: FilterByDomain<EntityName, 'cover'>;
};

type DestkopConfigType = BaseItemConfigType & {
  type: 'desktop';
  options: {
    icon?: string;
    label?: string;
    color?: string;
    scriptEntityId: FilterByDomain<EntityName, 'script'>;
    hide?: boolean;
  }[];
};
