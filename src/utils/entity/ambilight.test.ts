import {describe, expect, it} from 'vitest';
import {
  ambilightEffects,
  ambilightEntityIds,
  ambilightSource,
  ledAreas,
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

  it('trouve les caméras de l’image et des LED à partir de la lumière', () => {
    expect(ambilightEntityIds('light.tv_ambilight')).toEqual({
      image: 'camera.tv_ambilight_led_colors',
      leds: 'camera.tv_ambilight_led_gradient',
    });
  });
});

describe('zones des LED autour de l’écran', () => {
  const layout = {top: 2, right: 1, bottom: 2, left: 1};
  const corners = (areas: ReturnType<typeof ledAreas>) =>
    areas.map(({x, y}) => [x, y]);

  it('suit la disposition classique de HyperHDR, dans le sens horaire', () => {
    expect(corners(ledAreas(layout))).toEqual([
      [0, 0],
      [0.5, 0],
      [0.9, 0],
      [0.5, 0.9],
      [0, 0.9],
      [0, 0],
    ]);
  });

  it('couvre chaque côté par des LED de même taille', () => {
    expect(ledAreas(layout).slice(0, 3)).toEqual([
      {x: 0, y: 0, width: 0.5, height: 0.1},
      {x: 0.5, y: 0, width: 0.5, height: 0.1},
      {x: 0.9, y: 0, width: 0.1, height: 1},
    ]);
  });

  it('commence le ruban à la position d’entrée, même négative', () => {
    const areas = ledAreas(layout);

    expect(ledAreas({...layout, position: 2})[0]).toEqual(areas[2]);
    expect(ledAreas({...layout, position: -1})[0]).toEqual(areas[5]);
  });

  it('inverse l’ordre du ruban après l’avoir décalé', () => {
    const areas = ledAreas({...layout, position: 2});

    expect(ledAreas({...layout, position: 2, reverse: true})).toEqual(
      areas.reverse(),
    );
  });
});
