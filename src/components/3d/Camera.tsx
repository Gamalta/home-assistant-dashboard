import {useThree} from '@react-three/fiber';

export function Camera() {
  useThree(({camera}) => {
    camera.position.set(0, 8.2, 0);
    camera.lookAt(0, 0, 0);
  });
  return null;
}
