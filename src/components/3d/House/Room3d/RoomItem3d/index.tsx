import {RoomItemConfigType} from '../../../../../configs/house';
import {RoomLight3d} from './RoomLight3d';

type RoomItemProps = {
  itemConfig: RoomItemConfigType;
};

export function RoomItem3d(props: RoomItemProps) {
  const {itemConfig} = props;

  switch (itemConfig.type) {
    case 'light':
      return <RoomLight3d lightConfig={itemConfig} />;
    default:
      return <></>;
  }
}
