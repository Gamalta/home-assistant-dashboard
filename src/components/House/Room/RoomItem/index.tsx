import {RefObject} from 'react';
import {RoomItemConfigType} from '../../../../configs/house';
import {RoomDesktop} from './RoomDesktop';
import {RoomLight} from './RoomLight';
import {RoomShutter} from './RoomShutter';
import {createPortal} from 'react-dom';
import {FloatingAction} from '../../FloatingAction';
import {RoomTemperature} from './RoomTemperature';

type RoomItemProps = {
  id: string;
  itemConfig: RoomItemConfigType;
  parentRef?: RefObject<HTMLDivElement>;
};

export function RoomItem(props: RoomItemProps) {
  const {id, itemConfig, parentRef} = props;

  const getItemComponent = () => {
    switch (itemConfig.type) {
      case 'light':
        return <RoomLight id={id} lightConfig={itemConfig} />;
      case 'temperature':
        return <RoomTemperature id={id} tempConfig={itemConfig} />;
      case 'shutter':
        return <RoomShutter id={id} shutterConfig={itemConfig} />;
      case 'desktop':
        return <RoomDesktop id={id} desktopConfig={itemConfig} />;

      default:
        return <></>;
    }
  };
  const itemComponent = getItemComponent();

  if (itemConfig.roomDisplay) {
    if (parentRef && parentRef.current) {
      return createPortal(itemComponent, parentRef.current);
    }
    return <></>;
  }
  return (
    <FloatingAction
      position={itemConfig?.position ?? {x: 0, y: 0}}
      bgcolor="background.paper"
      borderRadius="50%"
    >
      {itemComponent}
    </FloatingAction>
  );
}
