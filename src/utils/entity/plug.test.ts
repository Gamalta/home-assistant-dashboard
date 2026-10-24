import {describe, expect, it} from 'vitest';
import {formatPower, parsePower, plugStateLabel} from './plug';

describe('parsePower', () => {
  it('lit la puissance du capteur', () => {
    expect(parsePower('85.4')).toBe(85.4);
    expect(parsePower('0')).toBe(0);
  });

  it('ne connaît pas la puissance d’un capteur indisponible ou absent', () => {
    expect(parsePower('unavailable')).toBeNull();
    expect(parsePower('unknown')).toBeNull();
    expect(parsePower(undefined)).toBeNull();
  });
});

describe('formatPower', () => {
  it('arrondit au watt à partir de 10 W', () => {
    expect(formatPower(85.4)).toBe('85\u00a0W');
    expect(formatPower(2300)).toBe('2\u202f300\u00a0W');
  });

  it('garde une décimale sous 10 W', () => {
    expect(formatPower(0.84)).toBe('0,8\u00a0W');
    expect(formatPower(3)).toBe('3\u00a0W');
  });
});

describe('plugStateLabel', () => {
  it('dit « en veille » quand la prise allumée consomme moins que le seuil', () => {
    expect(plugStateLabel(true, 0.8)).toBe('En veille');
    expect(plugStateLabel(true, 85)).toBe('Allumée');
  });

  it('suit le seuil configuré', () => {
    expect(plugStateLabel(true, 8, 10)).toBe('En veille');
    expect(plugStateLabel(true, 3, 2)).toBe('Allumée');
  });

  it('ne dit jamais « en veille » pour une prise éteinte', () => {
    expect(plugStateLabel(false, 0)).toBe('Éteinte');
  });

  it('dit « allumée » quand la puissance est inconnue', () => {
    expect(plugStateLabel(true, null)).toBe('Allumée');
  });
});
