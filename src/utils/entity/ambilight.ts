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

export function ambilightEntityIds(lightEntityId: string) {
  const name = lightEntityId.split('.')[1];
  return {gradient: `camera.${name}_led_gradient`} as const;
}

export function ambilightSource(effect?: string | null): AmbilightSource {
  if (!effect || effect === SOLID_EFFECT) return 'color';
  return EXTERNAL_SOURCES.includes(effect) ? 'video' : 'effect';
}

export function ambilightEffects(effectList: string[]) {
  return effectList.filter(effect => ambilightSource(effect) === 'effect');
}
