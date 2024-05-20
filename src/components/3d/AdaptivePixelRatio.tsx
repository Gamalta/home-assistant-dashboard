import {useThree} from '@react-three/fiber';
import {useEffect} from 'react';

export function AdaptivePixelRatio() {
  const current = useThree(state => state.performance.current);
  const setPixelRatio = useThree(state => state.setDpr);
  useEffect(() => {
    console.log('current', current);
    setPixelRatio(window.devicePixelRatio * 0.1);
  }, [current, setPixelRatio]);
  return null;
}
