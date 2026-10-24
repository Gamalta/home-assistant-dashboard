import {describe, expect, it} from 'vitest';
import {daylightFactor, sunAtHour, sunDirection, sunFromHour} from './daylight';

describe('sunFromHour', () => {
  it('place le soleil au sud et au plus haut à midi', () => {
    expect(sunFromHour(new Date(2026, 5, 21, 12))).toEqual({
      elevation: 50,
      azimuth: 180,
    });
  });

  it('le lève à l’est à 6 h et le couche sous l’horizon la nuit', () => {
    const sunrise = sunFromHour(new Date(2026, 5, 21, 6));
    expect(sunrise.elevation).toBeCloseTo(0);
    expect(sunrise.azimuth).toBe(90);
    expect(sunFromHour(new Date(2026, 5, 21, 22)).elevation).toBeLessThan(-6);
  });
});

describe('daylightFactor', () => {
  it('vaut 0 la nuit, 1 en plein jour et passe par le crépuscule', () => {
    expect(daylightFactor(-20)).toBe(0);
    expect(daylightFactor(30)).toBe(1);
    expect(daylightFactor(2)).toBeGreaterThan(0);
    expect(daylightFactor(2)).toBeLessThan(1);
  });
});

describe('sunDirection', () => {
  it('pointe vers +Z pour un soleil au sud, vers +X à l’est', () => {
    const south = sunDirection({elevation: 0, azimuth: 180});
    expect(south.x).toBeCloseTo(0);
    expect(south.z).toBeCloseTo(1);
    expect(sunDirection({elevation: 0, azimuth: 90}).x).toBeCloseTo(1);
  });

  it('monte avec l’élévation, sans passer sous l’horizon', () => {
    expect(sunDirection({elevation: 90, azimuth: 180}).y).toBeCloseTo(1);
    expect(sunDirection({elevation: -10, azimuth: 180}).y).toBeCloseTo(0);
  });

  it('tient compte de l’orientation du modèle', () => {
    // -Z du modèle tourné vers l'est : un soleil à l'est arrive par -Z.
    const east = sunDirection({elevation: 0, azimuth: 90}, 90);
    expect(east.x).toBeCloseTo(0);
    expect(east.z).toBeCloseTo(-1);
  });
});

describe('sunAtHour', () => {
  it('donne la même position que l’heure de la journée', () => {
    expect(sunAtHour(14.5)).toEqual(sunFromHour(new Date(2026, 5, 21, 14, 30)));
  });
});
