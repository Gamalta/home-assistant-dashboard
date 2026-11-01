import type {LedLayoutType} from '../../configs/house';

export type AmbilightSource = 'video' | 'color' | 'effect';

// Effets propres à l'intégration HyperHDR : « Solid » pour une couleur fixe, et
// une source externe par nom (KEY_COMPONENTID_TO_NAME de hyperhdr-py). L'image
// de la TV arrive par la carte d'acquisition HDMI-USB, d'où « USB Capture ».
export const SOLID_EFFECT = 'Solid';
export const VIDEO_EFFECT = 'USB Capture';
export const EXTERNAL_SOURCES = [
  'Boblight Server',
  'Platform Capture',
  VIDEO_EFFECT,
  'Flatbuffers Server',
  'Protocol Buffers Server',
];

// « LED Colors » diffuse l'image de la TV, « LED Gradient » une image d'un
// pixel de large par LED, dans l'ordre du ruban.
export function ambilightEntityIds(lightEntityId: string) {
  const name = lightEntityId.split('.')[1];
  return {
    image: `camera.${name}_led_colors`,
    leds: `camera.${name}_led_gradient`,
  } as const;
}

export function ambilightSource(effect?: string | null): AmbilightSource {
  if (!effect || effect === SOLID_EFFECT) return 'color';
  return EXTERNAL_SOURCES.includes(effect) ? 'video' : 'effect';
}

export function ambilightEffects(effectList: string[]) {
  return effectList.filter(effect => ambilightSource(effect) === 'effect');
}

// La tuile TV montre l'état de l'ambilight : celui de la TV est inconnu.
export function ambilightStateLabel(state: string, brightness?: number) {
  if (state === 'unavailable') return 'Indisponible';
  if (state !== 'on') return 'Ambilight éteint';
  return `Ambilight ${Math.round((brightness ?? 255) / 2.55)} %`;
}

// Profondeur d'une LED, du bord vers le centre de l'écran.
const LED_DEPTH = 0.1;

// Zone de chaque LED du ruban sur l'écran, en fractions de sa largeur et de sa
// hauteur. Même ordre que la disposition classique de HyperHDR : le haut de
// gauche à droite, la droite de haut en bas, le bas puis la gauche en remontant.
export function ledAreas(layout: LedLayoutType) {
  const {top, right, bottom, left, position = 0, reverse = false} = layout;
  const leds = [
    ...Array.from({length: top}, (_, i) => ({
      x: i / top,
      y: 0,
      width: 1 / top,
      height: LED_DEPTH,
    })),
    ...Array.from({length: right}, (_, i) => ({
      x: 1 - LED_DEPTH,
      y: i / right,
      width: LED_DEPTH,
      height: 1 / right,
    })),
    ...Array.from({length: bottom}, (_, i) => ({
      x: 1 - (i + 1) / bottom,
      y: 1 - LED_DEPTH,
      width: 1 / bottom,
      height: LED_DEPTH,
    })),
    ...Array.from({length: left}, (_, i) => ({
      x: 0,
      y: 1 - (i + 1) / left,
      width: LED_DEPTH,
      height: 1 / left,
    })),
  ];
  // « Position d'entrée » fait tourner le ruban, « Direction inverse » le retourne.
  const shift = ((position % leds.length) + leds.length) % leds.length;
  const strip = [...leds.slice(shift), ...leds.slice(0, shift)];
  return reverse ? strip.reverse() : strip;
}
