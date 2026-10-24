import type {HassEntity} from 'home-assistant-js-websocket';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {
  formatRelative,
  getPendingUpdates,
  hasBackupFailed,
  isUnplugged,
} from './system';

const entity = (entity_id: string, state: string) =>
  ({entity_id, state, attributes: {}}) as HassEntity;

afterEach(() => {
  vi.useRealTimers();
});

describe('getPendingUpdates', () => {
  it('ne garde que les entités update à on', () => {
    const entities = {
      'update.core': entity('update.core', 'on'),
      'update.os': entity('update.os', 'off'),
      'switch.update': entity('switch.update', 'on'),
    };

    expect(getPendingUpdates(entities)).toEqual([entities['update.core']]);
  });
});

describe('isUnplugged', () => {
  it('signale la tablette qui ne charge pas', () => {
    expect(isUnplugged('discharging')).toBe(true);
  });

  it('accepte la charge, la batterie pleine et la charge en pause', () => {
    expect(isUnplugged('charging')).toBe(false);
    expect(isUnplugged('full')).toBe(false);
    expect(isUnplugged('not_charging')).toBe(false);
  });
});

describe('formatRelative', () => {
  it('écrit une date passée ou future en relatif', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-24T12:00:00Z'));

    expect(formatRelative('2026-10-21T12:00:00Z')).toBe('il y a 3 jours');
    expect(formatRelative('2026-10-25T12:00:00Z')).toBe('demain');
    expect(formatRelative('2026-10-24T17:00:00Z')).toBe('dans 5 heures');
  });

  it('ne date pas un capteur sans valeur', () => {
    expect(formatRelative('unknown')).toBeUndefined();
  });
});

describe('hasBackupFailed', () => {
  const success = '2026-10-21T04:45:00Z';
  const attempt = '2026-10-23T04:45:00Z';

  it('signale une tentative plus récente que la dernière réussite', () => {
    expect(hasBackupFailed(success, attempt, 'idle')).toBe(true);
  });

  it('accepte une tentative réussie', () => {
    expect(hasBackupFailed(attempt, success, 'idle')).toBe(false);
  });

  it('attend la fin d’une sauvegarde en cours', () => {
    expect(hasBackupFailed(success, attempt, 'create_backup')).toBe(false);
  });

  it('signale une tentative sans aucune réussite', () => {
    expect(hasBackupFailed('unknown', attempt)).toBe(true);
  });

  it('ne signale rien sans tentative connue', () => {
    expect(hasBackupFailed(success, 'unknown')).toBe(false);
    expect(hasBackupFailed(success)).toBe(false);
  });
});
