import * as THREE from 'three';
import {useEntity} from '@hakit/core';
import {useHouseContext} from '../../../contexts/HouseContext';
import {useEffect, useRef} from 'react';
import {HouseConfig} from '../config';
import {RoomProvider} from '../../../contexts/RoomContext';
import {RoomLightHtml} from './RoomLightHtml';
import {RoomActionHtml} from './RoomActionHtml';

type RoomProps = {
  room: (typeof HouseConfig)['rooms'][0];
  mesh?: THREE.Object3D;
  lightMeshes?: THREE.Object3D[];
};

export function Room(props: RoomProps) {
  const {room, mesh, lightMeshes} = props;

  const {room: activeRoom} = useHouseContext();
  const isActive = activeRoom?.id === room.id;

  const temperature = useEntity(room.temperature ?? 'unknown', {
    returnNullIfNotFound: true,
  });
  const mainLight = useEntity(room.main_light ?? 'unknown', {
    returnNullIfNotFound: true,
  });
  // TODO fix later
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const lights = room.lights?.map(light => useEntity(light));
  const light = useRef<THREE.PointLight>(null);

  const lightsWithMesh = lights?.map(light => {
    const lightMesh = lightMeshes?.find(
      obj =>
        obj.name === `Light_${room.id}-${light.entity_id.replace('light.', '')}`
    );
    return {
      light,
      position: lightMesh?.position.sub(
        mesh?.position ?? new THREE.Vector3(0, 0, 0)
      ),
    };
  });

  useEffect(() => {
    if (!mesh || !(mesh instanceof THREE.Mesh)) return;
    mesh.material = new THREE.MeshStandardMaterial({
      transparent: true,
      opacity: 0,
    });
    mesh.castShadow = false;
    mesh.receiveShadow = false;
  }, [mesh]);

  return (
    <RoomProvider>
      <group position={mesh?.position}>
        {(!activeRoom || isActive) && (
          <RoomActionHtml
            key={room.id}
            id={`action-${room.id}`}
            name={room.name}
            temperature={temperature ?? undefined}
            mainLight={mainLight ?? undefined}
            lights={lights}
          />
        )}
        {mainLight?.state === 'on' && (
          <pointLight
            ref={light}
            castShadow
            position={[0, -0.1, 0]}
            color={mainLight.custom.color}
            //TODO link intensity to light brightness
            intensity={0.05}
            distance={5}
            shadow-bias={-0.0001}
            shadow-normalBias={0.05}
          />
        )}
        {lightsWithMesh?.map(({light, position}) => (
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
        ))}
      </group>
    </RoomProvider>
  );
}
