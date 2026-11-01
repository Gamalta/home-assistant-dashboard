import {afterEach, describe, expect, it, vi} from 'vitest';
import {haptic} from './haptic';

describe('haptic', () => {
  afterEach(() => {
    Reflect.deleteProperty(navigator, 'vibrate');
  });

  it('fait vibrer le téléphone quand le navigateur sait le faire', () => {
    const vibrate = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      value: vibrate,
      configurable: true,
    });

    haptic();

    expect(vibrate).toHaveBeenCalledWith(10);
  });

  it('ne fait rien sans API Vibration, comme Safari', () => {
    expect(() => haptic()).not.toThrow();
  });
});
