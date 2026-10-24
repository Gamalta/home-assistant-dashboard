import * as THREE from 'three';

export type LightingStyle = {
  label: string;
  toneMapping: THREE.ToneMapping;
  exposure?: number;
  /** Ciel et sol de la lumière hémisphérique, en plein jour. */
  sky: string;
  ground: string;
  skyIntensity: number;
  /** Lumière uniforme ajoutée au ciel, en plein jour. */
  ambient?: number;
  sun: string;
  sunIntensity: number;
  /** Soleil fixe, en degrés ; sans, il suit la position réelle du soleil. */
  sunElevation?: number;
  sunAzimuth?: number;
  /** Teintes multipliées à la couleur des sols et des murs du modèle. */
  floorTint?: string;
  wallTint?: string;
};

// Ambiances à essayer depuis la modale Système, avant d'en garder une.
export const lightingStyles = {
  plat: {
    label: 'A · Plat',
    toneMapping: THREE.NoToneMapping,
    sky: '#ffffff',
    ground: '#ffffff',
    skyIntensity: 0.7,
    sun: '#ffffff',
    sunIntensity: 0,
  },
  soleil: {
    label: 'B · Soleil réel',
    toneMapping: THREE.NeutralToneMapping,
    sky: '#dfe9ff',
    ground: '#8a7660',
    skyIntensity: 0.6,
    sun: '#fff1dc',
    sunIntensity: 2,
  },
  doux: {
    label: 'C · Doux et chaud',
    toneMapping: THREE.NoToneMapping,
    sky: '#fff3e3',
    ground: '#d9b48a',
    skyIntensity: 1.1,
    sun: '#fff0d8',
    sunIntensity: 0.35,
    sunElevation: 75,
    sunAzimuth: 200,
  },
  cosy: {
    label: 'D · Cosy',
    toneMapping: THREE.NeutralToneMapping,
    exposure: 1.25,
    sky: '#fff1df',
    ground: '#c9a27a',
    skyIntensity: 1.15,
    sun: '#ffe7c4',
    sunIntensity: 0.6,
    sunElevation: 65,
    sunAzimuth: 160,
  },
  maquette: {
    label: 'E · Maquette',
    toneMapping: THREE.NoToneMapping,
    sky: '#ffffff',
    ground: '#e8dccb',
    skyIntensity: 0.85,
    sun: '#fff6e8',
    sunIntensity: 0.7,
    sunElevation: 60,
    sunAzimuth: 150,
  },
  apresMidi: {
    label: 'F · Fin d’après-midi',
    toneMapping: THREE.ACESFilmicToneMapping,
    exposure: 1.3,
    sky: '#ffe9cc',
    ground: '#a8805a',
    skyIntensity: 0.75,
    sun: '#ffc890',
    sunIntensity: 1.3,
    sunElevation: 28,
    sunAzimuth: 235,
  },
  studio: {
    label: 'G · Studio',
    toneMapping: THREE.NoToneMapping,
    sky: '#fffaf2',
    ground: '#d6c2a8',
    skyIntensity: 0.7,
    ambient: 0.35,
    sun: '#ffffff',
    sunIntensity: 0.5,
    sunElevation: 80,
    sunAzimuth: 200,
  },
  chaud: {
    label: 'H · Chaud et saturé',
    toneMapping: THREE.NoToneMapping,
    sky: '#ffe8cc',
    ground: '#b88a5a',
    skyIntensity: 1,
    sun: '#ffd9a8',
    sunIntensity: 0.5,
    sunElevation: 70,
    sunAzimuth: 200,
  },
  cosyBois: {
    label: 'I · Cosy, sol bois',
    toneMapping: THREE.NeutralToneMapping,
    exposure: 1.25,
    sky: '#fff1df',
    ground: '#c9a27a',
    skyIntensity: 1.15,
    sun: '#ffe7c4',
    sunIntensity: 0.6,
    sunElevation: 65,
    sunAzimuth: 160,
    floorTint: '#c8935f',
  },
  douxChene: {
    label: 'J · Doux, sol chêne, murs crème',
    toneMapping: THREE.NoToneMapping,
    sky: '#fff3e3',
    ground: '#d9b48a',
    skyIntensity: 1.1,
    sun: '#fff0d8',
    sunIntensity: 0.35,
    sunElevation: 75,
    sunAzimuth: 200,
    floorTint: '#e0b07a',
    wallTint: '#fff4e6',
  },
} satisfies Record<string, LightingStyle>;

export type LightingStyleId = keyof typeof lightingStyles;
