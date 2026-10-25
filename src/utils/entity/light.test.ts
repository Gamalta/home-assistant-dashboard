import {describe, expect, it} from 'vitest';
import type {HassEntityWithService} from '@hakit/core';
import {lightColor, lightStateLabel} from './light';

// Seuls les modes de couleur et la couleur calculée par @hakit/core comptent.
const light = (modes: string[], color: [number, number, number]) =>
  ({
    attributes: {supported_color_modes: modes},
    custom: {color},
  }) as unknown as HassEntityWithService<'light'>;

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
