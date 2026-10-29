import {act, renderHook} from '@testing-library/react';
import type {MouseEvent, TouchEvent} from 'react';
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
const mouse = {target} as unknown as MouseEvent;

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

  it('déclenche l’appui court au clic qui suit le doigt levé', () => {
    const {handlers, onLongPress, onClick} = setup();

    act(() => handlers().onTouchStart(touch(0, 0)));
    act(() => handlers().onTouchEnd(touch(0, 0)));
    act(() => handlers().onClick(mouse));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onLongPress).not.toHaveBeenCalled();
    expect(haptic).toHaveBeenCalledTimes(1);
  });

  it('déclenche l’appui long sans appui court', () => {
    const {handlers, onLongPress, onClick} = setup();
    const preventDefault = vi.fn();

    act(() => handlers().onTouchStart(touch(0, 0)));
    act(() => vi.advanceTimersByTime(300));
    act(() => handlers().onTouchEnd(touch(0, 0, preventDefault)));
    act(() => handlers().onClick(mouse));

    expect(onLongPress).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
    // Le navigateur ne rejoue pas de clic sur la modale ouverte.
    expect(preventDefault).toHaveBeenCalled();
  });

  it("un doigt qui fait défiler n'appuie sur rien", () => {
    const {handlers, onLongPress, onClick} = setup();

    act(() => handlers().onTouchStart(touch(0, 0)));
    act(() => handlers().onTouchMove(touch(0, 30)));
    act(() => vi.advanceTimersByTime(300));
    act(() => handlers().onTouchEnd(touch(0, 30)));
    act(() => handlers().onClick(mouse));

    expect(onLongPress).not.toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
    expect(haptic).not.toHaveBeenCalled();
  });

  it('tolère un léger tremblement du doigt', () => {
    const {handlers, onClick} = setup();

    act(() => handlers().onTouchStart(touch(0, 0)));
    act(() => handlers().onTouchMove(touch(3, 4)));
    act(() => handlers().onTouchEnd(touch(3, 4)));
    act(() => handlers().onClick(mouse));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('laisse passer le clic du navigateur sans appuyer deux fois', () => {
    const {handlers, onClick} = setup();
    const preventDefault = vi.fn();

    act(() => handlers().onTouchStart(touch(0, 0)));
    act(() => handlers().onTouchEnd(touch(0, 0, preventDefault)));
    // Le navigateur rejoue le toucher en souris, puis clique.
    act(() => handlers().onMouseDown(mouse));
    act(() => handlers().onMouseUp());
    act(() => handlers().onClick(mouse));

    expect(preventDefault).not.toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
