import {useRef} from 'react';
import type {HouseConfigType} from '../../../configs/house';
import {RoomProvider} from '../../../contexts/RoomContext';
import {RoomAction} from './RoomAction';
import {RoomItem} from './RoomItem';

type RoomProps = {
  room: HouseConfigType['rooms'][0];
};

export function Room(props: RoomProps) {
  const {room} = props;

  const roomActionRef = useRef<HTMLDivElement>(null);

  return (
    <RoomProvider>
      <RoomAction
        ref={roomActionRef}
        key={room.id}
        position={room.position ?? {x: 0, y: 0}}
      />
      {(room.items ?? []).map((item, id) => (
        <RoomItem
          key={`room-${room.id}-item-${item.type}-id-${id}`}
          id={`room-${room.id}-item-${item.type}-id-${id}`}
          itemConfig={item}
          parentRef={item.roomDisplay ? roomActionRef : undefined}
        />
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
