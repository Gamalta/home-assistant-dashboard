import {useEffect, useState} from 'react';

const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'wheel'] as const;

/** `true` après `delay` ms sans interaction ; un délai nul désactive la veille. */
export function useIdle(delay: number) {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    if (!delay) return;
    let timer = setTimeout(() => setIdle(true), delay);
    const restart = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setIdle(true), delay);
    };
    ACTIVITY_EVENTS.forEach(event => window.addEventListener(event, restart));
    return () => {
      clearTimeout(timer);
      ACTIVITY_EVENTS.forEach(event =>
        window.removeEventListener(event, restart),
      );
    };
  }, [delay]);

  return [idle, () => setIdle(false)] as const;
}
