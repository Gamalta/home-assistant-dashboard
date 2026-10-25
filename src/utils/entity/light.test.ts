import {describe, expect, it} from 'vitest';
import type {HassEntityWithService} from '@hakit/core';
import {lightColor} from './light';

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
