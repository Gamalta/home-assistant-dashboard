import type * as THREE from 'three';
import {RoomItemConfigType} from '../../../../../configs/house';
import {RoomLight3d} from './RoomLight3d';

type RoomItemProps = {
  itemConfig: RoomItemConfigType;
  model: THREE.Object3D;
};

export function RoomItem3d(props: RoomItemProps) {
  const {itemConfig, model} = props;

  switch (itemConfig.type) {
    case 'light':
      return <RoomLight3d lightConfig={itemConfig} model={model} />;
    default:
      return <></>;
  }
}
