import {describe, expect, it} from 'vitest';
import {batteryLevel, isBatteryLow} from './battery';

describe('batteryLevel', () => {
  it('lit le niveau en % et l’arrondit', () => {
    expect(batteryLevel('85')).toBe(85);
    expect(batteryLevel('12.6')).toBe(13);
    expect(batteryLevel('0')).toBe(0);
  });

  it('ne donne pas de niveau sans nombre', () => {
    expect(batteryLevel(undefined)).toBeNull();
    expect(batteryLevel('')).toBeNull();
    expect(batteryLevel('unknown')).toBeNull();
    expect(batteryLevel('unavailable')).toBeNull();
  });
});

describe('isBatteryLow', () => {
  it('signale une pile sous 20 %', () => {
    expect(isBatteryLow(19)).toBe(true);
    expect(isBatteryLow(0)).toBe(true);
  });

  it('ne signale pas une pile à 20 % ou plus', () => {
    expect(isBatteryLow(20)).toBe(false);
    expect(isBatteryLow(100)).toBe(false);
  });

  it('ne signale pas un niveau inconnu', () => {
    expect(isBatteryLow(null)).toBe(false);
  });
});
