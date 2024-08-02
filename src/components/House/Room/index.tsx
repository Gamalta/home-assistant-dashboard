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
  const mainLight = useEntity(room.main_light?.entity_id ?? 'unknown', {
    returnNullIfNotFound: true,
  });
  // TODO fix later
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const lights = room.lights?.map(light => useEntity(light.entity_id));

  return (
    <RoomProvider>
      {(!activeRoom || isActive) && (
        <RoomAction
          key={room.id}
          id={`action-${room.id}`}
          name={room.name}
          position={room.main_light?.position ?? {x: 0, y: 0}}
          temperature={temperature ?? undefined}
          mainLight={mainLight ?? undefined}
          lights={lights}
        />
      )}
      {mainLight &&
        mainLight.state === 'on' &&
        ['red', 'green', 'blue'].map((color, index) => (
          <img
            key={color}
            src={room.main_light?.layer[color as 'red' | 'green' | 'blue']}
            style={{
              mixBlendMode: 'lighten',
              opacity:
                ((mainLight.attributes.rgb_color?.[index] ?? 0) / 255) *
                ((mainLight.attributes.brightness ?? 255) / 255),
            }}
          />
        ))}
      {/*lightsWithMesh?.map(({light, position}) => (
        <group position={position} key={light.entity_id}>
          <RoomLightHtml light={light} />
          {light.state === 'on' && (
            <pointLight
              castShadow
              color={light.custom.color}
              intensity={0.05}
              distance={5}
              shadow-bias={-0.0001}
              shadow-normalBias={0.05}
            />
          )}
        </group>
      ))*/}
    </RoomProvider>
  );
}
