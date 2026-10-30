import {describe, expect, it} from 'vitest';
import {shutterStateLabel} from './shutter';

describe('shutterStateLabel', () => {
  it('donne la position d’un volet entrouvert', () => {
    expect(shutterStateLabel('open', 60)).toBe('Ouvert 60 %');
  });

  it('dit « Ouvert » ou « Fermé » aux extrémités', () => {
    expect(shutterStateLabel('open', 100)).toBe('Ouvert');
    expect(shutterStateLabel('open')).toBe('Ouvert');
    expect(shutterStateLabel('closed', 0)).toBe('Fermé');
    expect(shutterStateLabel('open', 0)).toBe('Fermé');
  });

  it('signale un volet en mouvement ou indisponible', () => {
    expect(shutterStateLabel('opening', 40)).toBe('Ouverture…');
    expect(shutterStateLabel('closing', 40)).toBe('Fermeture…');
    expect(shutterStateLabel('unavailable')).toBe('Indisponible');
  });
});
