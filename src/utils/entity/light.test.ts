import type {HassEntityWithService} from '@hakit/core';
import {describe, expect, it} from 'vitest';
import {LightTab, lightExtraEntityIds, supportedLightTab} from './light';

const EFFECT = 4;

// Seuls les attributs lus par les fonctions testées sont renseignés.
function light(attributes: object) {
  return {attributes} as HassEntityWithService<'light'>;
}

describe('onglet adapté à la lumière', () => {
  it('ouvre la roue des couleurs pour une lumière en couleur', () => {
    const strip = light({
      supported_color_modes: ['rgb'],
      supported_features: EFFECT,
    });

    expect(supportedLightTab([strip])).toBe(LightTab.COLOR);
  });

  it('ouvre la température pour une lumière blanche réglable', () => {
    const bulb = light({supported_color_modes: ['color_temp']});

    expect(supportedLightTab([bulb])).toBe(LightTab.COLOR_TEMP);
  });

  it('ouvre les effets pour une lumière qui n’a que des effets', () => {
    const lamp = light({
      supported_color_modes: ['brightness'],
      supported_features: EFFECT,
      effect_list: ['Candle'],
    });

    expect(supportedLightTab([lamp])).toBe(LightTab.EFFECT);
  });

  it('se limite à marche/arrêt pour une lumière sans couleur ni effet', () => {
    const plug = light({supported_color_modes: ['onoff']});

    expect(supportedLightTab([plug])).toBe(LightTab.ON_OFF);
  });
});

describe('réglages dérivés du nom de la lumière', () => {
  it('nomme les entités WLED et Hue comme leurs intégrations', () => {
    expect(lightExtraEntityIds('light.salon_strip')).toEqual({
      preset: 'select.salon_strip_preset',
      playlist: 'select.salon_strip_playlist',
      palette: 'select.salon_strip_color_palette',
      speed: 'number.salon_strip_speed',
      effectSpeed: 'number.salon_strip_effect_speed',
      intensity: 'number.salon_strip_intensity',
    });
  });
});
