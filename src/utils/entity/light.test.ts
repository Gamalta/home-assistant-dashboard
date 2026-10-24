import type {HassEntityWithService} from '@hakit/core';
import {describe, expect, it} from 'vitest';
import {LightTab, supportedLightTab} from './light';

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
