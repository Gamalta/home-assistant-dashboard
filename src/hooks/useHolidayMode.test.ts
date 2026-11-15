import {act, renderHook} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {HolidayMode} from '../contexts/AppContext';
import {useHolidayMode} from './useHolidayMode';

const {state} = vi.hoisted(() => ({
  state: {holidayMode: 'auto' as HolidayMode},
}));

vi.mock('../contexts/AppContext', () => ({
  useAppContext: () => ({configuration: {holidayMode: state.holidayMode}}),
}));

describe('useHolidayMode', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 30, 23, 30));
    state.holidayMode = 'auto';
  });
  afterEach(() => vi.useRealTimers());

  it('s’active le 1er décembre sans recharger la page', () => {
    const {result} = renderHook(() => useHolidayMode());
    expect(result.current).toBe(false);

    act(() => vi.advanceTimersByTime(3600_000));
    expect(result.current).toBe(true);
  });

  it('suit le réglage forcé, quelle que soit la date', () => {
    state.holidayMode = 'on';
    expect(renderHook(() => useHolidayMode()).result.current).toBe(true);

    vi.setSystemTime(new Date(2026, 11, 24));
    state.holidayMode = 'off';
    expect(renderHook(() => useHolidayMode()).result.current).toBe(false);
  });
});
