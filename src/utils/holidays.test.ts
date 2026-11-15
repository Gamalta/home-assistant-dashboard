import {describe, expect, it} from 'vitest';
import {isHolidaySeason} from './holidays';

describe('isHolidaySeason', () => {
  it('commence le 1er décembre', () => {
    expect(isHolidaySeason(new Date(2026, 10, 30, 23, 59))).toBe(false);
    expect(isHolidaySeason(new Date(2026, 11, 1, 0, 0))).toBe(true);
  });

  it('passe le Nouvel An', () => {
    expect(isHolidaySeason(new Date(2026, 11, 31, 23, 59))).toBe(true);
    expect(isHolidaySeason(new Date(2027, 0, 1, 0, 0))).toBe(true);
  });

  it('finit après l’Épiphanie', () => {
    expect(isHolidaySeason(new Date(2027, 0, 6, 23, 59))).toBe(true);
    expect(isHolidaySeason(new Date(2027, 0, 7, 0, 0))).toBe(false);
  });
});
