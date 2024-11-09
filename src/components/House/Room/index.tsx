import type {HouseConfigType} from '../../../configs/house';
import {RoomProvider} from '../../../contexts/RoomContext';
import {RoomAction} from './RoomAction';
import {RoomLightImage} from './RoomLightImage';
import {RoomLight} from './RoomLight';
import {useEntity} from '@hakit/core';

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
      {(room.lights ?? []).map(light => (
        <RoomLight
          lightConfig={light}
          key={`room-${room.id}-light-${light.entity_id}`}
        />
      ))}
      {[room.main_light ?? [], room.lights ?? []].flat().map((light, index) => (
        <RoomLightImage
          lightConfig={light}
          key={`room-${room.id}-light-image-${index}`}
        />
      ))}
    </RoomProvider>
  );
}
