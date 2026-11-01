import {describe, expect, it} from 'vitest';
import {
  cleaningModeLabel,
  floorToMapUv,
  formatCleaningTime,
  isCleaningActive,
  suctionLevelLabel,
  toMapPixel,
  vacuumEntityIds,
  vacuumStateLabel,
} from './vacuum';

describe('vacuumEntityIds', () => {
  it('déduit les entités dreame-vacuum du préfixe', () => {
    const ids = vacuumEntityIds('dreame_demo');

    expect(ids.vacuum).toBe('vacuum.dreame_demo');
    expect(ids.map).toBe('camera.dreame_demo_map');
    expect(ids.cleaningMode).toBe('select.dreame_demo_cleaning_mode');
    expect(ids.suctionLevel).toBe('select.dreame_demo_suction_level');
    expect(ids.error).toBe('sensor.dreame_demo_error');
  });
});

describe('libellés', () => {
  it('traduit l’état détaillé du robot', () => {
    expect(vacuumStateLabel('sweeping_and_mopping')).toBe(
      'Aspiration et lavage',
    );
    expect(vacuumStateLabel('returning')).toBe('Retour à la station');
  });

  it('traduit le mode de nettoyage et la puissance d’aspiration', () => {
    expect(cleaningModeLabel('mopping_after_sweeping')).toBe(
      'Aspirer puis laver',
    );
    expect(suctionLevelLabel('quiet')).toBe('Silencieuse');
  });

  it('garde la valeur brute d’un état inconnu', () => {
    expect(vacuumStateLabel('climbing_stairs')).toBe('climbing_stairs');
    expect(suctionLevelLabel('full_power')).toBe('full_power');
  });

  it('considère la pause comme un nettoyage en cours', () => {
    expect(isCleaningActive('cleaning')).toBe(true);
    expect(isCleaningActive('paused')).toBe(true);
    expect(isCleaningActive('returning')).toBe(false);
    expect(isCleaningActive('docked')).toBe(false);
    expect(isCleaningActive(undefined)).toBe(false);
  });
});

describe('formatCleaningTime', () => {
  it('affiche les minutes, puis les heures', () => {
    expect(formatCleaningTime(18)).toBe('18 min');
    expect(formatCleaningTime(65)).toBe('1 h 05');
  });

  it('affiche -- sans durée', () => {
    expect(formatCleaningTime(undefined)).toBe('--');
  });
});

describe('toMapPixel', () => {
  // Points publiés par l'intégration : (0, 0), (1000, 0) et (0, 1000) en mm.
  const calibration = [
    {vacuum: {x: 0, y: 0}, map: {x: 310, y: 300}},
    {vacuum: {x: 1000, y: 0}, map: {x: 350, y: 300}},
    {vacuum: {x: 0, y: 1000}, map: {x: 310, y: 260}},
  ];

  it('place un point du robot sur l’image, axe vertical inversé', () => {
    expect(toMapPixel({x: 0, y: 0}, calibration)).toEqual({x: 310, y: 300});
    expect(toMapPixel({x: -1300, y: -2600}, calibration)).toEqual({
      x: 258,
      y: 404,
    });
  });

  it('suit une carte tournée', () => {
    const rotated = [
      {vacuum: {x: 0, y: 0}, map: {x: 100, y: 100}},
      {vacuum: {x: 1000, y: 0}, map: {x: 100, y: 150}},
      {vacuum: {x: 0, y: 1000}, map: {x: 150, y: 100}},
    ];
    expect(toMapPixel({x: 2000, y: 1000}, rotated)).toEqual({x: 150, y: 200});
  });
});

describe('floorToMapUv', () => {
  const calibration = [
    {vacuum: {x: 0, y: 0}, map: {x: 310, y: 300}},
    {vacuum: {x: 1000, y: 0}, map: {x: 350, y: 300}},
    {vacuum: {x: 0, y: 1000}, map: {x: 310, y: 260}},
  ];
  const size = {width: 640, height: 548};
  const apply = (uv: ReturnType<typeof floorToMapUv>, x: number, z: number) =>
    uv.map(([a, b, c]) => a * x + b * z + c);

  it('pose le centre du séjour de la démo sous le séjour de la scène', () => {
    const [u, v] = apply(floorToMapUv(calibration, size), -1.3, 2.6);

    expect(u).toBeCloseTo(258 / 640);
    expect(v).toBeCloseTo(404 / 548);
  });

  it('suit l’origine et la rotation du plan dans la scène', () => {
    const uv = floorToMapUv(calibration, size, {x: 1, z: 2, rotation: 90});

    // Le point (1000, 0) du robot, tourné d'un quart de tour autour de (1, 2).
    const [u, v] = apply(uv, 1, 1);
    expect(u).toBeCloseTo(350 / 640);
    expect(v).toBeCloseTo(300 / 548);
  });
});
