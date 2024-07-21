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
      {mainLight?.state === 'on' && (
        <img
          src={room.main_light?.layer}
          style={{
            filter: `hue-rotate(${
              mainLight.attributes.hs_color?.[0] ?? 0
            }deg) saturate(${mainLight.attributes.hs_color?.[1] ?? 100}%)`,
          }}
        />
      )}
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
