import {act, renderHook} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {useIdle} from './useIdle';

describe('useIdle', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('passe en veille après le délai sans interaction', () => {
    const {result} = renderHook(() => useIdle(60_000));

    act(() => vi.advanceTimersByTime(59_999));
    expect(result.current[0]).toBe(false);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current[0]).toBe(true);
  });

  it('repart de zéro à chaque interaction', () => {
    const {result} = renderHook(() => useIdle(60_000));

    act(() => vi.advanceTimersByTime(50_000));
    act(() => {
      window.dispatchEvent(new Event('pointerdown'));
    });
    act(() => vi.advanceTimersByTime(50_000));
    expect(result.current[0]).toBe(false);
    act(() => vi.advanceTimersByTime(10_000));
    expect(result.current[0]).toBe(true);
  });

  it('se réveille sur demande', () => {
    const {result} = renderHook(() => useIdle(1000));

    act(() => vi.advanceTimersByTime(1000));
    act(() => result.current[1]());
    expect(result.current[0]).toBe(false);
  });

  it('ne se met jamais en veille avec un délai nul', () => {
    const {result} = renderHook(() => useIdle(0));

    act(() => vi.advanceTimersByTime(24 * 3600_000));
    expect(result.current[0]).toBe(false);
  });
});
