import {MouseEvent, TouchEvent, useCallback, useRef, useState} from 'react';

export const useLongPress = (
  onLongPress: (event: MouseEvent | TouchEvent) => void,
  onClick: (event: MouseEvent | TouchEvent) => void,
  {shouldPreventDefault = true, delay = 300} = {}
) => {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeout = useRef<number | null>(null);
  const target = useRef<EventTarget | null>(null);

  const start = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (shouldPreventDefault && event.target) {
        event.target.addEventListener('touchend', () => preventDefault(event), {
          passive: false,
        });
        target.current = event.target;
      }
      timeout.current = window.setTimeout(() => {
        onLongPress(event);
        setLongPressTriggered(true);
      }, delay);
    },
    [onLongPress, delay, shouldPreventDefault]
  );

  const clear = useCallback(
    (event: MouseEvent | TouchEvent, shouldTriggerClick = true) => {
      if (timeout.current) {
        window.clearTimeout(timeout.current);
        timeout.current = null;
      }
      if (shouldTriggerClick && !longPressTriggered) {
        onClick(event);
      }
      setLongPressTriggered(false);
      if (shouldPreventDefault && target.current) {
        target.current.removeEventListener('touchend', () =>
          preventDefault(event)
        );
      }
    },
    [shouldPreventDefault, onClick, longPressTriggered]
  );

  return {
    onMouseDown: (event: MouseEvent) => start(event),
    onTouchStart: (event: TouchEvent) => start(event),
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
