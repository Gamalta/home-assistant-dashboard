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
      LightEntityFeature.EFFECT
  );
}

export function lightHasBrightness(entity: HassEntityWithService<'light'>) {
  return lightsHasBrightness([entity]);
}

export function lightsHasBrightness(
  entities: HassEntityWithService<'light'>[]
) {
  return entities.some(entity =>
    ['brightness', 'color_temp', 'hs', 'rgb', 'rgbw', 'rgbww', 'xy'].some(
      colorMode => entity.attributes.supported_color_modes?.includes(colorMode)
    )
  );
}
export function lightHasColorTemp(entity: HassEntityWithService<'light'>) {
  return lightsHasColorTemp([entity]);
}
export function lightsHasColorTemp(entities: HassEntityWithService<'light'>[]) {
  return entities.some(entity =>
    entity.attributes.supported_color_modes?.includes('color_temp')
  );
}
export function lightHasColor(entity: HassEntityWithService<'light'>) {
  return lightsHasColor([entity]);
}
export function lightsHasColor(entities: HassEntityWithService<'light'>[]) {
  return entities.some(entity =>
    ['hs', 'rgb', 'rgbw', 'rgbww', 'xy'].some(colorMode =>
      entity.attributes.supported_color_modes?.includes(colorMode)
    )
  );
}
