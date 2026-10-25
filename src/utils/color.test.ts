import {describe, expect, it} from 'vitest';
import {
  getColorFromCoord,
  getColorTempFromCoord,
  getCoordFromColor,
  getCoordFromColorTemp,
  getWheelPosition,
} from './color';

const canvas = {clientWidth: 200, clientHeight: 200} as HTMLCanvasElement;

describe('roue des couleurs', () => {
  it.each([
    [0, 0],
    [0.5, -0.5],
    [-0.3, 0.8],
    [1, 0],
  ])('replace le curseur sur la couleur choisie en (%d, %d)', (x, y) => {
    const color = getColorFromCoord(x, y);
    const {x: px, y: py} = getCoordFromColor(canvas, color);
    const position = getWheelPosition(canvas, px, py);

    expect(position.x).toBeCloseTo(x, 1);
    expect(position.y).toBeCloseTo(y, 1);
  });

  it('borne la saturation au bord de la roue', () => {
    expect(getColorFromCoord(2, 0)).toEqual([255, 0, 0]);
  });
});

describe('getColorTempFromCoord', () => {
  it('parcourt la plage de Kelvin sur 90 % du rayon et borne au-delà', () => {
    const kelvin = (y: number) => getColorTempFromCoord(0, y, 2000, 6500);

    expect(kelvin(-0.9)).toBeCloseTo(2000);
    expect(kelvin(0)).toBeCloseTo(4250);
    expect(kelvin(0.9)).toBeCloseTo(6500);
    expect(kelvin(-1)).toBe(2000);
    expect(kelvin(1)).toBe(6500);
  });
});

describe('roue des températures', () => {
  it.each([-0.9, -0.45, 0, 0.45, 0.9])(
    'replace le curseur sur la température choisie en y = %d',
    y => {
      const kelvin = getColorTempFromCoord(0, y, 2000, 6500);
      const {x: px, y: py} = getCoordFromColorTemp(canvas, kelvin, 2000, 6500);
      const position = getWheelPosition(canvas, px, py);

      expect(position.x).toBeCloseTo(0);
      expect(position.y).toBeCloseTo(y);
    },
  );
});
