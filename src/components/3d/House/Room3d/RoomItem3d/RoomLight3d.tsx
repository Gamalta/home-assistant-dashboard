import {useEntity} from '@hakit/core';
import {LightConfigType} from '../../../../../configs/house';
import { useThree } from '@react-three/fiber';

type RoomLight3dProps = {
  lightConfig: LightConfigType;
};

export function RoomLight3d(props: RoomLight3dProps) {
  const {lightConfig} = props;

  const {scene} = useThree()
  const light3d = scene.children.filter(obj =>
      obj.name.toLowerCase().startsWith(lightConfig.lightEntityId.toLowerCase())
    )?.[0]

  const light = useEntity(lightConfig.lightEntityId, {
    returnNullIfNotFound: true,
  });

  if (!light) return <></>;

  return (
    <pointLight
      ref={light}
      castShadow
      position={light3d?.position ?? [0, -0.1, 0]}
      color={light.custom.color}
      //TODO link intensity to light brightness
      intensity={0.05}
      distance={5}
      shadow-bias={-0.0001}
      shadow-normalBias={0.05}
    />
  );
}
