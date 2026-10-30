import {MouseEvent, TouchEvent, useCallback, useRef} from 'react';
import {haptic} from '../utils/haptic';

// Au-delà, le doigt fait défiler la page : ni appui long, ni appui court.
const MOVE_TOLERANCE = 10;

export const useLongPress = (
  onLongPress: (event: MouseEvent | TouchEvent) => void,
  onClick: (event: MouseEvent) => void,
  {delay = 300} = {},
) => {
  const timeout = useRef<number | null>(null);
  const longPressed = useRef(false);
  const origin = useRef<{x: number; y: number} | null>(null);
  const moved = useRef(false);

  const start = useCallback(
    (event: MouseEvent | TouchEvent) => {
      longPressed.current = false;
      // L'appui souris que le navigateur rejoue après un toucher n'efface pas
      // le glissé du doigt.
      if (isTouchEvent(event)) {
        moved.current = false;
        origin.current = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        };
      }
      timeout.current = window.setTimeout(() => {
        longPressed.current = true;
        onLongPress(event);
      }, delay);
    },
    [onLongPress, delay],
  );

  const clear = () => {
    if (!timeout.current) return;
    window.clearTimeout(timeout.current);
    timeout.current = null;
  };

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
    clear();
  };

  return {
    onMouseDown: (event: MouseEvent) => start(event),
    onTouchStart: (event: TouchEvent) => start(event),
    onTouchMove: move,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchEnd: (event: TouchEvent) => {
      clear();
      // Le doigt se lève sur la modale ouverte : le clic que rejouerait le
      // navigateur la refermerait.
      if (longPressed.current) event.preventDefault();
    },
    // L'appui court attend le clic du navigateur : sur iPhone, c'est lui qui
    // bascule l'interrupteur caché de la tuile et fait vibrer.
    onClick: (event: MouseEvent) => {
      if (longPressed.current || moved.current) return;
      haptic();
      onClick(event);
    },
  };
};

const isTouchEvent = (event: MouseEvent | TouchEvent): event is TouchEvent => {
  return 'touches' in event;
};
