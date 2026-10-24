import {describe, expect, it, vi} from 'vitest';
import {
  HeatmapPoint,
  MAX_HEATMAP_POINTS,
  getTemperatureRange,
  limitHeatmapPoints,
} from './common';

const point = (temperature: number, x = 0): HeatmapPoint => ({
  x,
  z: 0,
  temperature,
});

describe('getTemperatureRange', () => {
  it('prend la température minimale et maximale', () => {
    expect(getTemperatureRange([point(20), point(23.5), point(18)])).toEqual({
      minTemp: 18,
      maxTemp: 23.5,
    });
  });

  it("élargit l'échelle à 1 °C autour du milieu si les températures sont trop proches", () => {
    expect(getTemperatureRange([point(20), point(20.5)])).toEqual({
      minTemp: 19.75,
      maxTemp: 20.75,
    });
  });

  it('renvoie une échelle non nulle sans capteur', () => {
    expect(getTemperatureRange([])).toEqual({minTemp: 0, maxTemp: 1});
  });
});

describe('limitHeatmapPoints', () => {
  it('garde les premiers capteurs au-delà de la limite et prévient', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const points = Array.from({length: MAX_HEATMAP_POINTS + 5}, (_, i) =>
      point(20, i),
    );

    expect(limitHeatmapPoints(points)).toEqual(
      points.slice(0, MAX_HEATMAP_POINTS),
    );
    expect(warn).toHaveBeenCalledOnce();
  });

  it('ne prévient pas sous la limite', () => {
    const warn = vi.spyOn(console, 'warn');
    const points = [point(20), point(21)];

    expect(limitHeatmapPoints(points)).toEqual(points);
    expect(warn).not.toHaveBeenCalled();
  });
});
