import Stack from '@mui/material/Stack';
import type {ReactNode} from 'react';
import type {HouseConfigType, Position3dType} from '../../../configs/house';
import {Html} from '../../3d/Html';
import {RoomItem} from './RoomItem';
import ButtonGroup from '@mui/material/ButtonGroup';

type RoomProps = {
  room: HouseConfigType['rooms'][0];
};

function Anchor({
  position,
  children,
}: {
  position: Position3dType;
  children: ReactNode;
}) {
  return (
    <Html position={[position.x, position.y, position.z]}>{children}</Html>
  );
}

export function Room(props: RoomProps) {
  const {room} = props;
  const items = room.items ?? [];

  return (
    <>
      <Anchor position={room.position}>
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
      </Anchor>
      {items.map((item, id) =>
        item.roomDisplay ? null : (
          <Anchor
            key={`room-${room.id}-item-${item.type}-id-${id}`}
            position={item.position}
          >
            <Stack>
              <RoomItem
                id={`room-${room.id}-item-${item.type}-id-${id}`}
                itemConfig={item}
              />
            </Stack>
          </Anchor>
        ),
      )}
    </>
  );
}
