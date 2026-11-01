import {act, renderHook} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {useDaylight} from './useDaylight';

const {state} = vi.hoisted(() => ({
  state: {
    sun: null as {attributes: {elevation: number}} | null,
    simulatedHour: null as number | null,
  },
}));

vi.mock('@hakit/core', async importOriginal => ({
  ...(await importOriginal()),
  useEntity: () => state.sun,
}));

vi.mock('../contexts/AppContext', () => ({
  useAppContext: () => ({simulatedHour: state.simulatedHour}),
}));

describe('useDaylight', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 25, 2));
    state.sun = null;
    state.simulatedHour = null;
  });
  afterEach(() => vi.useRealTimers());

  it('suit l’heure sans sun.sun', () => {
    const {result} = renderHook(() => useDaylight());
    expect(result.current).toBe(0);

    act(() => vi.advanceTimersByTime(10 * 3600_000));
    expect(result.current).toBe(1);
  });

  it('préfère l’élévation de sun.sun à l’heure', () => {
    state.sun = {attributes: {elevation: 30}};
    expect(renderHook(() => useDaylight()).result.current).toBe(1);
  });

  it('préfère l’heure simulée à sun.sun', () => {
    state.sun = {attributes: {elevation: 30}};
    state.simulatedHour = 23;
    expect(renderHook(() => useDaylight()).result.current).toBe(0);
  });

  it('ne fait pas de rendu la nuit à chaque minute', () => {
    let renders = 0;
    renderHook(() => {
      renders++;
      return useDaylight();
    });

    act(() => vi.advanceTimersByTime(30 * 60_000));
    expect(renders).toBe(1);
  });
});
