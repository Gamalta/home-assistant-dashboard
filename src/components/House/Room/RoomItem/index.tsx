import {RoomItemConfigType} from '../../../../configs/house';
import {RoomClimate} from './RoomClimate';
import {RoomDesktop} from './RoomDesktop';
import {RoomLight} from './RoomLight';
import {RoomShutter} from './RoomShutter';
import {RoomTemperature} from './RoomTemperature';

type RoomItemProps = {
  id: string;
  itemConfig: RoomItemConfigType;
};

export function RoomItem(props: RoomItemProps) {
  const {id, itemConfig} = props;

  switch (itemConfig.type) {
    case 'light':
      return <RoomLight id={id} lightConfig={itemConfig} />;
    case 'climate':
      return <RoomClimate id={id} climateConfig={itemConfig} />;
    case 'temperature':
      return <RoomTemperature id={id} tempConfig={itemConfig} />;
    case 'shutter':
      return <RoomShutter id={id} shutterConfig={itemConfig} />;
    case 'desktop':
      return <RoomDesktop id={id} desktopConfig={itemConfig} />;
    default:
      return <></>;
  }
}
