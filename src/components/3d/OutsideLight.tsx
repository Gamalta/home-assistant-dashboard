import {Vector3} from '@react-three/fiber';

export const OutsideLight = ({position}: {position: Vector3}) => (
  <directionalLight
    //castShadow
    position={position}
    intensity={0.05}
    shadow-mapSize-width={1024}
    shadow-mapSize-height={1024}
    shadow-camera-left={-7}
    shadow-camera-right={7}
    shadow-camera-top={7}
    shadow-camera-bottom={-7}
    shadow-bias={-0.0001}
    shadow-normalBias={0.05}
  />
);
