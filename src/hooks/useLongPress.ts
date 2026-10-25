import {MouseEvent, TouchEvent, useCallback, useRef, useState} from 'react';

// Au-delà, le doigt fait défiler la page : ni appui long, ni appui court.
const MOVE_TOLERANCE = 10;

export const useLongPress = (
  onLongPress: (event: MouseEvent | TouchEvent) => void,
  onClick: (event: MouseEvent | TouchEvent) => void,
  {shouldPreventDefault = true, delay = 300} = {},
) => {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeout = useRef<number | null>(null);
  const target = useRef<EventTarget | null>(null);
  const origin = useRef<{x: number; y: number} | null>(null);
  const moved = useRef(false);

  const start = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (shouldPreventDefault && event.target) {
        event.target.addEventListener('touchend', () => preventDefault(event), {
          passive: false,
        });
        target.current = event.target;
      }
      moved.current = false;
      origin.current = isTouchEvent(event)
        ? {x: event.touches[0].clientX, y: event.touches[0].clientY}
        : null;
      timeout.current = window.setTimeout(() => {
        onLongPress(event);
        setLongPressTriggered(true);
      }, delay);
    },
    [onLongPress, delay, shouldPreventDefault],
  );

  const move = (event: TouchEvent) => {
    if (!origin.current) return;
    const {clientX, clientY} = event.touches[0];
    const distance = Math.hypot(
      clientX - origin.current.x,
      clientY - origin.current.y,
    );
    if (distance <= MOVE_TOLERANCE) return;
    moved.current = true;
    origin.current = null;
    if (timeout.current) {
      window.clearTimeout(timeout.current);
      timeout.current = null;
    }
  };

  const clear = useCallback(
    (event: MouseEvent | TouchEvent, shouldTriggerClick = true) => {
      if (timeout.current) {
        window.clearTimeout(timeout.current);
        timeout.current = null;
      }
      if (shouldTriggerClick && !longPressTriggered && !moved.current) {
        onClick(event);
      }
      setLongPressTriggered(false);
      if (shouldPreventDefault && target.current) {
        target.current.removeEventListener('touchend', () =>
          preventDefault(event),
        );
      }
    },
    [shouldPreventDefault, onClick, longPressTriggered],
  );

  return {
    onMouseDown: (event: MouseEvent) => start(event),
    onTouchStart: (event: TouchEvent) => start(event),
    onTouchMove: move,
    onMouseUp: (event: MouseEvent) => clear(event),
    onMouseLeave: (event: MouseEvent) => clear(event, false),
    onTouchEnd: (event: TouchEvent) => clear(event),
  };
};

const isTouchEvent = (event: MouseEvent | TouchEvent): event is TouchEvent => {
  return 'touches' in event;
};

const preventDefault = (event: MouseEvent | TouchEvent) => {
  if (!isTouchEvent(event)) return;

  if (event.touches.length < 2 && event.preventDefault) {
    event.preventDefault();
  }
};
