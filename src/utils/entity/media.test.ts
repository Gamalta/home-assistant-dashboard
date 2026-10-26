import {describe, expect, it} from 'vitest';
import {isMediaOn, mediaTitle} from './media';

describe('isMediaOn', () => {
  it('considère le lecteur éteint en veille, hors ligne ou inconnu', () => {
    for (const state of ['off', 'standby', 'unavailable', 'unknown']) {
      expect(isMediaOn(state)).toBe(false);
    }
  });

  it('considère le lecteur allumé dès qu’il lit, attend ou est en pause', () => {
    for (const state of ['on', 'idle', 'playing', 'paused', 'buffering']) {
      expect(isMediaOn(state)).toBe(true);
    }
  });
});

describe('mediaTitle', () => {
  it('affiche le titre du média', () => {
    expect(mediaTitle({media_title: 'My Way', app_name: 'Musique'})).toBe(
      'My Way',
    );
  });

  it('affiche l’application quand le média n’a pas de titre', () => {
    expect(mediaTitle({media_title: '', app_name: 'Films'})).toBe('Films');
    expect(mediaTitle({})).toBeUndefined();
  });
});
