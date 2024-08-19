import {useEntity} from '@hakit/core';
import {useHouseContext} from '../../../contexts/HouseContext';
import {HouseConfig} from '../config';
import {RoomProvider} from '../../../contexts/RoomContext';
import {RoomAction} from './RoomAction';
import {RoomLightImage} from './RoomLightImage';
import {RoomLight} from './RoomLight';

type RoomProps = {
  room: (typeof HouseConfig)['rooms'][0];
};

export function Room(props: RoomProps) {
  const {room} = props;

  const {room: activeRoom} = useHouseContext();
  const isActive = activeRoom?.id === room.id;
  const mainLight = {
    light: useEntity(room.main_light?.entity_id ?? 'unknown', {
      returnNullIfNotFound: true,
    }),
    config: room.main_light,
  };
  const lights = room.lights?.map(light => ({
    // TODO fix later
    // eslint-disable-next-line react-hooks/rules-of-hooks
    light: useEntity(light.entity_id),
    config: light,
  }));

  return (
    <RoomProvider>
      {(!activeRoom || isActive) && (
        <RoomAction
          key={room.id}
          id={`action-${room.id}`}
          room={room}
          position={room.main_light?.position ?? {x: 0, y: 0}}
          mainLight={mainLight.light ?? undefined}
          lights={lights?.map(entity => entity.light)}
        />
      )}
      {[...(lights ?? [])].map(light => (
        <RoomLight parameters={light} />
      ))}
      {[mainLight ?? [], lights ?? []].flat().map(light => (
        <RoomLightImage parameters={light} />
      ))}
    </RoomProvider>
  );
}
