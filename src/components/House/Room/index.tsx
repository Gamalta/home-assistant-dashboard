import Stack from '@mui/material/Stack';
import type {ComponentType, ReactNode} from 'react';
import type {
  HouseConfigType,
  Position2dType,
  Position3dType,
} from '../../../configs/house';
import {RoomItem} from './RoomItem';
import ButtonGroup from '@mui/material/ButtonGroup';

export type RoomAnchorProps = {
  position: Position3dType;
  floorPosition?: Position2dType;
  children: ReactNode;
};

type RoomProps = {
  room: HouseConfigType['rooms'][0];
  /**
   * Place un élément dans la vue (Html de drei en 3D, positionnement absolu
   * en 2D). Injecté pour que la vue 2D n'embarque pas three.js.
   */
  Anchor: ComponentType<RoomAnchorProps>;
};

export function Room(props: RoomProps) {
  const {room, Anchor} = props;
  const items = room.items ?? [];

  return (
    <>
      <Anchor position={room.position} floorPosition={room.floorPosition}>
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
            floorPosition={item.floorPosition}
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
