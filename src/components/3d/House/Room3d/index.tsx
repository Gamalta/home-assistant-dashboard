import {Room} from '../../../House/Room';
import {RoomProvider} from '../../../../contexts/RoomContext';
import {HouseConfigType} from '../../../../configs/house';
import {RoomItem3d} from './RoomItem3d';
import {useAppContext} from '../../../../contexts/AppContext';

type RoomProps = {
  room: HouseConfigType['rooms'][0];
};

export function Room3d(props: RoomProps) {
  const {room} = props;
  const {configuration} = useAppContext();

  const heatmapDisplay = ['climate', 'temperature'];

  const cleanedRoom = {
    ...room,
    items: (room.items ?? []).filter(
      item =>
        !configuration.heatmapShader || heatmapDisplay.includes(item.type),
    ),
  };

  return (
    <RoomProvider>
      <Room room={cleanedRoom} />
      {(cleanedRoom.items ?? []).map((item, id) => (
        <RoomItem3d key={`item-3d-${id}`} itemConfig={item} />
      ))}
    </RoomProvider>
  );
}
