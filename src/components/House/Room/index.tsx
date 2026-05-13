import Stack from '@mui/material/Stack';
import type {HouseConfigType} from '../../../configs/house';
import {RoomProvider} from '../../../contexts/RoomContext';
import {RoomItem} from './RoomItem';
import ButtonGroup from '@mui/material/ButtonGroup';
import {Html} from '../../3d/Html';

type RoomProps = {
  room: HouseConfigType['rooms'][0];
};

export function Room(props: RoomProps) {
  const {room} = props;

  return (
    <RoomProvider>
      <Html
        key={room.id}
        position={[room.position.x, room.position.y, room.position.z]}
      >
        <ButtonGroup
          variant="contained"
          size="small"
          sx={{
            border: 0,
            boxShadow: 0,
          }}
        >
          {(room.items ?? [])
            .filter(item => item.roomDisplay)
            .map((item, id) => (
              <RoomItem
                key={`room-${room.id}-item-${item.type}-room-id-${id}`}
                id={`room-${room.id}-item-${item.type}-room-id-${id}`}
                itemConfig={item}
              />
            ))}
        </ButtonGroup>
      </Html>
      {(room.items ?? [])
        .filter(item => !item.roomDisplay)
        .map((item, id) => (
          <Html
            key={`room-${room.id}-item-${item.type}-id-${id}`}
            position={[item.position.x, item.position.y, item.position.z]}
          >
            <Stack>
              <RoomItem
                id={`room-${room.id}-item-${item.type}-id-${id}`}
                itemConfig={item}
              />
            </Stack>
          </Html>
        ))}
    </RoomProvider>
  );
}
