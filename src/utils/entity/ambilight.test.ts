import {describe, expect, it} from 'vitest';
import {
  ambilightEffects,
  ambilightEntityIds,
  ambilightSource,
} from './ambilight';

describe('source de l’ambilight', () => {
  it.each([
    ['USB Capture', 'video'],
    ['Platform Capture', 'video'],
    ['Flatbuffers Server', 'video'],
    ['Solid', 'color'],
    [undefined, 'color'],
    ['Rainbow swirl', 'effect'],
  ])('déduit la source « %s » → %s', (effect, source) => {
    expect(ambilightSource(effect)).toBe(source);
  });

  it('ne propose comme effets ni la couleur fixe ni les captures', () => {
    const effectList = ['Solid', 'USB Capture', 'Boblight Server', 'Candle'];

    expect(ambilightEffects(effectList)).toEqual(['Candle']);
  });

  it('trouve la caméra « LED Gradient » à partir de la lumière', () => {
    expect(ambilightEntityIds('light.tv_ambilight')).toEqual({
      gradient: 'camera.tv_ambilight_led_gradient',
    });
  });
});
