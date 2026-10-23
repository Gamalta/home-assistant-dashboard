import Stack from '@mui/material/Stack';
import type {HouseConfigType} from '../../../configs/house';
import {Html} from '../../3d/Html';
import {RoomItem} from './RoomItem';
import ButtonGroup from '@mui/material/ButtonGroup';

type RoomProps = {
  room: HouseConfigType['rooms'][0];
};

export function Room(props: RoomProps) {
  const {room} = props;
  const items = room.items ?? [];

  return (
    <>
      <Html position={[room.position.x, room.position.y, room.position.z]}>
        <ButtonGroup
          variant="contained"
          size="small"
          sx={{
            border: 0,
            boxShadow: 0,
          }}
        >
          {items
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
      {items.map((item, id) =>
        item.roomDisplay ? null : (
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
        ),
      )}
    </>
  );
}
