import {describe, expect, it} from 'vitest';
import type {HassEntityWithService} from '@hakit/core';
import {
  LightTab,
  lightColor,
  lightExtraEntityIds,
  lightStateLabel,
  supportedLightTab,
} from './light';

const EFFECT = 4;

// Seuls les modes de couleur et la couleur calculée par @hakit/core comptent.
const light = (modes: string[], color: [number, number, number]) =>
  ({
    attributes: {supported_color_modes: modes},
    custom: {color},
  }) as unknown as HassEntityWithService<'light'>;

// Seuls les attributs lus par les fonctions testées sont renseignés.
function lightWith(attributes: object) {
  return {attributes} as HassEntityWithService<'light'>;
}

describe('lightColor', () => {
  it('garde la couleur d’une lumière de couleur', () => {
    expect(lightColor(light(['hs'], [0, 0, 255]))).toEqual([0, 0, 255]);
  });

  it('donne un blanc chaud à une lumière tout-ou-rien', () => {
    const [red, green, blue] = lightColor(light(['onoff'], [33, 33, 33]));

    expect(red).toBe(255);
    expect(green).toBeGreaterThan(100);
    expect(green).toBeGreaterThan(blue);
  });
});

describe('onglet adapté à la lumière', () => {
  it('ouvre la roue des couleurs pour une lumière en couleur', () => {
    const strip = lightWith({
      supported_color_modes: ['rgb'],
      supported_features: EFFECT,
    });

    expect(supportedLightTab([strip])).toBe(LightTab.COLOR);
  });

  it('ouvre la température pour une lumière blanche réglable', () => {
    const bulb = lightWith({supported_color_modes: ['color_temp']});

    expect(supportedLightTab([bulb])).toBe(LightTab.COLOR_TEMP);
  });

  it('ouvre les effets pour une lumière qui n’a que des effets', () => {
    const lamp = lightWith({
      supported_color_modes: ['brightness'],
      supported_features: EFFECT,
      effect_list: ['Candle'],
    });

    expect(supportedLightTab([lamp])).toBe(LightTab.EFFECT);
  });

  it('se limite à marche/arrêt pour une lumière sans couleur ni effet', () => {
    const plug = lightWith({supported_color_modes: ['onoff']});

    expect(supportedLightTab([plug])).toBe(LightTab.ON_OFF);
  });
});

describe('réglages dérivés du nom de la lumière', () => {
  it('nomme les entités WLED et Hue comme leurs intégrations', () => {
    expect(lightExtraEntityIds('light.living_room_strip')).toEqual({
      preset: 'select.living_room_strip_preset',
      playlist: 'select.living_room_strip_playlist',
      palette: 'select.living_room_strip_color_palette',
      speed: 'number.living_room_strip_speed',
      effectSpeed: 'number.living_room_strip_effect_speed',
      intensity: 'number.living_room_strip_intensity',
    });
  });
});

describe('lightStateLabel', () => {
  const withState = (state: string, brightness?: number) =>
    ({
      state,
      attributes: {brightness},
    }) as unknown as HassEntityWithService<'light'>;

  it('donne la luminosité en % d’une lumière allumée', () => {
    expect(lightStateLabel(withState('on', 204))).toBe('80 %');
  });

  it('dit « Allumée » sans variateur', () => {
    expect(lightStateLabel(withState('on'))).toBe('Allumée');
  });

  it('dit « Éteinte » ou « Indisponible »', () => {
    expect(lightStateLabel(withState('off', 204))).toBe('Éteinte');
    expect(lightStateLabel(withState('unavailable'))).toBe('Indisponible');
  });
});
