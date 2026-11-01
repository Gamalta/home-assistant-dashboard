import {describe, expect, it} from 'vitest';
import {smokeStatus} from './smoke';

const calm = {
  smoke: 'off',
  heat: 'off',
  battery: '85',
  batteryLow: 'off',
  tamper: 'off',
};

describe('smokeStatus', () => {
  it('va bien quand rien n’est signalé', () => {
    expect(smokeStatus(calm)).toBe('ok');
    expect(smokeStatus({smoke: 'off'})).toBe('ok');
  });

  it('signale la fumée avant tout le reste', () => {
    expect(smokeStatus({...calm, smoke: 'on', heat: 'on', tamper: 'on'})).toBe(
      'smoke',
    );
  });

  it('signale la chaleur', () => {
    expect(smokeStatus({...calm, heat: 'on'})).toBe('heat');
  });

  it('signale la chaleur même si la fumée est indisponible', () => {
    expect(smokeStatus({...calm, smoke: 'unavailable', heat: 'on'})).toBe(
      'heat',
    );
  });

  it('signale un détecteur indisponible ou absent', () => {
    expect(smokeStatus({...calm, smoke: 'unavailable'})).toBe('unavailable');
    expect(smokeStatus({...calm, smoke: 'unknown'})).toBe('unavailable');
    expect(smokeStatus({})).toBe('unavailable');
  });

  it('avertit pour une pile faible, binaire ou sous 20 %', () => {
    expect(smokeStatus({...calm, batteryLow: 'on'})).toBe('warning');
    expect(smokeStatus({...calm, battery: '19'})).toBe('warning');
    expect(smokeStatus({...calm, battery: '20'})).toBe('ok');
  });

  it('avertit quand l’autoprotection est déclenchée', () => {
    expect(smokeStatus({...calm, tamper: 'on'})).toBe('warning');
  });
});
