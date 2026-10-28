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

  it('bascule un interrupteur natif sans vibreur, comme sur iPhone', () => {
    const toggled = vi.fn();
    document.addEventListener('change', toggled);

    haptic();

    document.removeEventListener('change', toggled);
    const input = toggled.mock.calls[0][0].target as HTMLInputElement;
    expect(input.hasAttribute('switch')).toBe(true);
    expect(input.isConnected).toBe(false);
  });
});
