import {act, renderHook} from '@testing-library/react';
import type {TouchEvent} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {useLongPress} from './useLongPress';
import {haptic} from '../utils/haptic';

vi.mock('../utils/haptic', () => ({haptic: vi.fn()}));

const target = document.createElement('button');
const touch = (x: number, y: number, preventDefault = vi.fn()) =>
  ({
    target,
    touches: [{clientX: x, clientY: y}],
    preventDefault,
  }) as unknown as TouchEvent;

function setup() {
  const onLongPress = vi.fn();
  const onClick = vi.fn();
  const {result} = renderHook(() => useLongPress(onLongPress, onClick));
  return {handlers: () => result.current, onLongPress, onClick};
}

describe('useLongPress', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.mocked(haptic).mockClear();
  });

  it('déclenche l’appui court quand le doigt se lève vite', () => {
    const {handlers, onLongPress, onClick} = setup();

    act(() => handlers().onTouchStart(touch(0, 0)));
    act(() => handlers().onTouchEnd(touch(0, 0)));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onLongPress).not.toHaveBeenCalled();
    expect(haptic).toHaveBeenCalledTimes(1);
  });

  it('déclenche l’appui long sans appui court', () => {
    const {handlers, onLongPress, onClick} = setup();

    act(() => handlers().onTouchStart(touch(0, 0)));
    act(() => vi.advanceTimersByTime(300));
    act(() => handlers().onTouchEnd(touch(0, 0)));

    expect(onLongPress).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("un doigt qui fait défiler n'appuie sur rien", () => {
    const {handlers, onLongPress, onClick} = setup();

    act(() => handlers().onTouchStart(touch(0, 0)));
    act(() => handlers().onTouchMove(touch(0, 30)));
    act(() => vi.advanceTimersByTime(300));
    act(() => handlers().onTouchEnd(touch(0, 30)));

    expect(onLongPress).not.toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
    expect(haptic).not.toHaveBeenCalled();
  });

  it('tolère un léger tremblement du doigt', () => {
    const {handlers, onClick} = setup();

    act(() => handlers().onTouchStart(touch(0, 0)));
    act(() => handlers().onTouchMove(touch(3, 4)));
    act(() => handlers().onTouchEnd(touch(3, 4)));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("n'émet pas en plus l'appui souris que rejoue le navigateur", () => {
    const {handlers, onClick} = setup();
    const preventDefault = vi.fn();

    act(() => handlers().onTouchStart(touch(0, 0)));
    act(() => handlers().onTouchEnd(touch(0, 0, preventDefault)));

    expect(preventDefault).toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
