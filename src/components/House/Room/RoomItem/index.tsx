import {RoomItemConfigType} from '../../../../configs/house';
import {RoomDesktop} from './RoomDesktop';
import {RoomLight} from './RoomLight';
import {RoomShutter} from './RoomShutter';

type RoomItemProps = {
  id: string;
  itemConfig: RoomItemConfigType;
};

export function RoomItem(props: RoomItemProps) {
  const {id, itemConfig} = props;

  switch (itemConfig.type) {
    case 'light':
      return <RoomLight lightConfig={itemConfig} />;
    case 'shutter':
      return <RoomShutter id={id} shutterConfig={itemConfig} />;
    case 'desktop':
      return <RoomDesktop id={id} desktopConfig={itemConfig} />;
    default:
      return <></>;
  }
}
