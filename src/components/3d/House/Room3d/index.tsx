import {Room} from '../../../House/Room';
import {RoomProvider} from '../../../../contexts/RoomContext';
import {HouseConfigType} from '../../../../configs/house';
import {RoomItem3d} from './RoomItem3d';

type RoomProps = {
  room: HouseConfigType['rooms'][0];
};

export function Room3d(props: RoomProps) {
  const {room} = props;

  return (
    <RoomProvider>
      <Room room={room} />
      {(room.items ?? []).map((item, id) => (
        <RoomItem3d key={`item-3d-${id}`} itemConfig={item} />
      ))}
    </RoomProvider>
  );
}
