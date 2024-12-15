import type {HouseConfigType, LightConfigType} from '../../../configs/house';
import {RoomProvider} from '../../../contexts/RoomContext';
import {RoomAction} from './RoomAction';
import {RoomLightImage} from './RoomLightImage';
import {useEntity} from '@hakit/core';
import {RoomItem} from './RoomItem';

type RoomProps = {
  room: HouseConfigType['rooms'][0];
};

export function Room(props: RoomProps) {
  const {room} = props;

  const mainLight = useEntity(room.main_light?.entity_id ?? 'unknown', {
    returnNullIfNotFound: true,
  });

  return (
    <RoomProvider>
      <RoomAction
        key={room.id}
        id={`action-${room.id}`}
        room={room}
        position={room.main_light?.position ?? {x: 0, y: 0}}
        mainLight={mainLight ?? undefined}
      />
      {(room.items ?? []).map(item => (
        <RoomItem
          key={`room-${room.id}-item-${item.type}-pos-${item.position}`}
          id={`room-${room.id}-item-${item.type}-pos-${item.position}`}
          itemConfig={item}
        />
      ))}
      {[
        room.main_light ?? [],
        room.items?.filter(item => item.type === 'light') ?? [],
      ]
        .flat()
        .map(light => (
          <RoomLightImage
            lightConfig={light}
            key={`room-${room.id}-light-image-${light.position}`}
          />
        ))}
    </RoomProvider>
  );
}
