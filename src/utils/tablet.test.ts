import {describe, expect, it} from 'vitest';
import {isUnplugged} from './tablet';

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
