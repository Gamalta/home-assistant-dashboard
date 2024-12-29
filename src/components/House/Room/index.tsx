import Stack from '@mui/material/Stack';
import type {HouseConfigType} from '../../../configs/house';
import {RoomProvider} from '../../../contexts/RoomContext';
import {RoomItem} from './RoomItem';
import ButtonGroup from '@mui/material/ButtonGroup';

type RoomProps = {
  room: HouseConfigType['rooms'][0];
};

export function Room(props: RoomProps) {
  const {room} = props;

  return (
    <RoomProvider>
      <ButtonGroup
        variant="contained"
        size="small"
        key={room.id}
        sx={{
          position: 'absolute',
          top: `${room.position.y}%`,
          left: `${room.position.x}%`,
          transform: 'translate(-50%, -50%)',
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
      {(room.items ?? [])
        .filter(item => !item.roomDisplay)
        .map((item, id) => (
          <Stack
            key={`room-${room.id}-item-${item.type}-id-${id}`}
            sx={{
              position: 'absolute',
              top: `${item.position.y}%`,
              left: `${item.position.x}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <RoomItem
              id={`room-${room.id}-item-${item.type}-id-${id}`}
              itemConfig={item}
            />
          </Stack>
        ))}
      {/*(room.items ?? [])
        .filter(item => item.type === 'light')
        .map(light => (
          <RoomLightImage
            lightConfig={light as LightConfigType}
            key={`room-${room.id}-light-image-posX-${light.position.x}-poxY-${light.position.y}`}
          />
        ))*/}
    </RoomProvider>
  );
}
