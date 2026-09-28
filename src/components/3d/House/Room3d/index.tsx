import {Room, RoomAnchorProps} from '../../../House/Room';
import {RoomProvider} from '../../../../contexts/RoomContext';
import {HouseConfigType} from '../../../../configs/house';
import {RoomItem3d} from './RoomItem3d';
import {useAppContext} from '../../../../contexts/AppContext';
import {Html} from '../../Html';

type RoomProps = {
  room: HouseConfigType['rooms'][0];
};

const heatmapDisplay = ['climate', 'temperature'];

function Anchor3d({position, children}: RoomAnchorProps) {
  return (
    <Html position={[position.x, position.y, position.z]}>{children}</Html>
  );
}

export function Room3d(props: RoomProps) {
  const {room} = props;
  const {configuration} = useAppContext();

  const cleanedRoom = {
    ...room,
    items: (room.items ?? []).filter(
      item =>
        !configuration.heatmapShader || heatmapDisplay.includes(item.type),
    ),
  };

  return (
    <RoomProvider>
      <Room room={cleanedRoom} Anchor={Anchor3d} />
      {cleanedRoom.items.map((item, id) => (
        <RoomItem3d key={`item-3d-${id}`} itemConfig={item} />
      ))}
    </RoomProvider>
  );
}
