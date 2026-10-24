import {HassEntityWithService} from '@hakit/core';

export enum LightEntityFeature {
  EFFECT = 4,
  FLASH = 8,
  TRANSITION = 32,
}

export function lightHasEffect(entity: HassEntityWithService<'light'>) {
  return lightsHasEffect([entity]);
}

export function lightsHasEffect(entities: HassEntityWithService<'light'>[]) {
  return entities.some(
    entity =>
      ((entity.attributes.supported_features ?? 0) &
        LightEntityFeature.EFFECT) ===
      LightEntityFeature.EFFECT,
  );
}

export function lightHasBrightness(entity: HassEntityWithService<'light'>) {
  return lightsHasBrightness([entity]);
}

export function lightsHasBrightness(
  entities: HassEntityWithService<'light'>[],
) {
  return entities.some(entity =>
    ['brightness', 'color_temp', 'hs', 'rgb', 'rgbw', 'rgbww', 'xy'].some(
      colorMode => entity.attributes.supported_color_modes?.includes(colorMode),
    ),
  );
}
export function lightHasColorTemp(entity: HassEntityWithService<'light'>) {
  return lightsHasColorTemp([entity]);
}
export function lightsHasColorTemp(entities: HassEntityWithService<'light'>[]) {
  return entities.some(entity =>
    entity.attributes.supported_color_modes?.includes('color_temp'),
  );
}
export function lightHasColor(entity: HassEntityWithService<'light'>) {
  return lightsHasColor([entity]);
}
export function lightsHasColor(entities: HassEntityWithService<'light'>[]) {
  return entities.some(entity =>
    ['hs', 'rgb', 'rgbw', 'rgbww', 'xy'].some(colorMode =>
      entity.attributes.supported_color_modes?.includes(colorMode),
    ),
  );
}

export enum LightTab {
  ON_OFF = 'on-off',
  COLOR = 'color',
  COLOR_TEMP = 'color_temp',
  EFFECT = 'effect',
}

export function supportedLightTab(entities: HassEntityWithService<'light'>[]) {
  if (lightsHasColor(entities)) return LightTab.COLOR;
  if (lightsHasColorTemp(entities)) return LightTab.COLOR_TEMP;
  if (lightsHasEffect(entities)) return LightTab.EFFECT;
  return LightTab.ON_OFF;
}

// Entités que WLED (préréglages, palette…) et Zigbee2MQTT (vitesse des effets
// Hue) créent à côté de la lumière : `<domaine>.<lumière>_<clé>`.
export function lightExtraEntityIds(lightEntityId: string) {
  const name = lightEntityId.split('.')[1];
  return {
    preset: `select.${name}_preset`,
    playlist: `select.${name}_playlist`,
    palette: `select.${name}_color_palette`,
    speed: `number.${name}_speed`,
    effectSpeed: `number.${name}_effect_speed`,
    intensity: `number.${name}_intensity`,
  } as const;
}
