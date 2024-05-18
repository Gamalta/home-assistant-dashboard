import {useThree} from '@react-three/fiber';
import {useEffect} from 'react';

export function AdaptivePixelRatio() {
  const current = useThree(state => state.performance.current);
  const setPixelRatio = useThree(state => state.setDpr);
  useEffect(() => {
    setPixelRatio(window.devicePixelRatio * current);
  }, [current, setPixelRatio]);
  return null;
}
