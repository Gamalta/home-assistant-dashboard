import {describe, expect, it} from 'vitest';
import {climateStateLabel} from './climate';

describe('climateStateLabel', () => {
  it('donne la consigne d’une climatisation en marche', () => {
    expect(climateStateLabel('heat', 25)).toBe('Consigne 25°');
    expect(climateStateLabel('cool')).toBe('Marche');
  });

  it('dit « Arrêt » ou « Indisponible »', () => {
    expect(climateStateLabel('off', 25)).toBe('Arrêt');
    expect(climateStateLabel('unavailable')).toBe('Indisponible');
  });
});
