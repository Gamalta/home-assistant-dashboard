import {useEntity} from '@hakit/core';
import {useHouseContext} from '../../../contexts/HouseContext';
import {HouseConfig} from '../config';
import {RoomProvider} from '../../../contexts/RoomContext';
import {RoomAction} from './RoomAction';

type RoomProps = {
  room: (typeof HouseConfig)['rooms'][0];
};

export function Room(props: RoomProps) {
  const {room} = props;

  const {room: activeRoom} = useHouseContext();
  const isActive = activeRoom?.id === room.id;

  const temperature = useEntity(room.temperature ?? 'unknown', {
    returnNullIfNotFound: true,
  });
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
          name={room.name}
          position={room.main_light?.position ?? {x: 0, y: 0}}
          temperature={temperature ?? undefined}
          mainLight={mainLight.light ?? undefined}
          lights={lights?.map(entity => entity.light)}
        />
      )}
      {[mainLight ?? [], lights ?? []].flat().map(
        ({light, config}) =>
          light &&
          light.state === 'on' &&
          ['red', 'green', 'blue'].map((color, index) => (
            <img
              key={color}
              src={config?.layer[color as 'red' | 'green' | 'blue']}
              style={{
                mixBlendMode: 'lighten',
                opacity:
                  ((light.attributes.rgb_color?.[index] ?? 0) / 255) *
                  ((light.attributes.brightness ?? 255) / 255),
              }}
            />
          ))
      )}
    </RoomProvider>
  );
}
