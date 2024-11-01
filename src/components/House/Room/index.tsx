import {HassEntityWithService, useEntity, useHass} from '@hakit/core';
import type {HouseConfigType} from '../../../configs/house';
import {RoomProvider} from '../../../contexts/RoomContext';
import {RoomAction} from './RoomAction';
import {RoomLightImage} from './RoomLightImage';
import {RoomLight} from './RoomLight';

type RoomProps = {
  room: HouseConfigType['rooms'][0];
};

export function Room(props: RoomProps) {
  const {room} = props;
  const {getAllEntities} = useHass();

  const mainLight = {
    light: useEntity(room.main_light?.entity_id ?? 'unknown', {
      returnNullIfNotFound: true,
    }),
    config: room.main_light,
  };

  const lights = Object.values(getAllEntities())
    .filter(entity => entity.entity_id.startsWith('light.'))
    .filter(entity =>
      room.lights?.some(light => light.entity_id === entity.entity_id)
    )
    .map(entity => ({
      light: entity as HassEntityWithService<'light'>,
      config: room.lights?.find(light => light.entity_id === entity.entity_id),
    }));

  return (
    <RoomProvider>
      <RoomAction
        key={room.id}
        id={`action-${room.id}`}
        room={room}
        position={room.main_light?.position ?? {x: 0, y: 0}}
        mainLight={mainLight.light ?? undefined}
        lights={lights?.map(entity => entity.light)}
      />
      {[...(lights ?? [])].map((light, index) => (
        <RoomLight parameters={light} key={`room-${room.id}-light-${index}`} />
      ))}
      {[mainLight ?? [], lights ?? []].flat().map((light, index) => (
        <RoomLightImage
          parameters={light}
          key={`room-${room.id}-light-image-${index}`}
        />
      ))}
    </RoomProvider>
  );
}
