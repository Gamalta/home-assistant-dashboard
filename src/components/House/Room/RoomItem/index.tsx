import {RoomItemConfigType} from '../../../../configs/house';
import {RoomDesktop} from './RoomDesktop';

type RoomItemProps = {
  id: string;
  itemConfig: RoomItemConfigType;
};

export function RoomItem(props: RoomItemProps) {
  const {id, itemConfig} = props;

  switch (itemConfig.type) {
    case 'desktop':
      return <RoomDesktop id={id} desktopConfig={itemConfig} />;
  }
}
