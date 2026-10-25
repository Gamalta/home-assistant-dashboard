import {act, renderHook} from '@testing-library/react';
import type {TouchEvent} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {useLongPress} from './useLongPress';

const target = document.createElement('button');
const touch = (x: number, y: number) =>
  ({target, touches: [{clientX: x, clientY: y}]}) as unknown as TouchEvent;

function setup() {
  const onLongPress = vi.fn();
  const onClick = vi.fn();
  const {result} = renderHook(() => useLongPress(onLongPress, onClick));
  return {handlers: () => result.current, onLongPress, onClick};
}

describe('useLongPress', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('déclenche l’appui court quand le doigt se lève vite', () => {
    const {handlers, onLongPress, onClick} = setup();

    act(() => handlers().onTouchStart(touch(0, 0)));
    act(() => handlers().onTouchEnd(touch(0, 0)));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('déclenche l’appui long sans appui court', () => {
    const {handlers, onLongPress, onClick} = setup();

    act(() => handlers().onTouchStart(touch(0, 0)));
    act(() => vi.advanceTimersByTime(300));
    act(() => handlers().onTouchEnd(touch(0, 0)));

    expect(onLongPress).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('ignore un doigt qui fait défiler la page', () => {
    const {handlers, onLongPress, onClick} = setup();

    act(() => handlers().onTouchStart(touch(0, 0)));
    act(() => handlers().onTouchMove(touch(0, 30)));
    act(() => vi.advanceTimersByTime(300));
    act(() => handlers().onTouchEnd(touch(0, 30)));

    expect(onLongPress).not.toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('tolère un léger tremblement du doigt', () => {
    const {handlers, onClick} = setup();

    act(() => handlers().onTouchStart(touch(0, 0)));
    act(() => handlers().onTouchMove(touch(3, 4)));
    act(() => handlers().onTouchEnd(touch(3, 4)));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
