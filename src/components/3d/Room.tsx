import * as THREE from 'three';
import {HassEntityWithService, useEntity} from '@hakit/core';
import {Html} from './Html';
import Stack from '@mui/material/Stack';
import Fab from '@mui/material/Fab';
import {PendantRoundIcon} from '../Icons/PendantRoundIcon';
import {useHouseContext} from '../../contexts/HouseContext';
import {ThermostatIcon} from '../Icons/ThermostatIcon';
import {useLongPress} from '../../hooks/useLongPress';
import {alpha} from '@mui/material/styles';
import {motion} from 'framer-motion';
import {TemperatureModal} from '../Modal/Type/TemperatureModal';
import {LightModal} from '../Modal/Type/LightModal';
import {useEffect, useRef, useState} from 'react';
import {HouseConfig} from './config';

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
    <group position={mesh?.position}>
      {(!activeRoom || isActive) && (
        <RoomAction
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
      {lightsWithMesh?.map(
        ({light, position}) =>
          light.state === 'on' && (
            <pointLight
              key={light.entity_id}
              castShadow
              position={position}
              color={light.custom.color}
              intensity={0.05}
              distance={5}
              shadow-bias={-0.0001}
              shadow-normalBias={0.05}
            />
          )
      )}
    </group>
  );
}

type RoomActionProps = {
  id: string;
  name: string;
  temperature?: HassEntityWithService<'sensor'>;
  mainLight?: HassEntityWithService<'light'>;
  lights?: HassEntityWithService<'light'>[];
};

function RoomAction(props: RoomActionProps) {
  const {id, name, temperature, mainLight, lights} = props;
  const [lightModalOpen, setLightModalOpen] = useState(false);
  const [tempModalOpen, setTempModalOpen] = useState(false);

  const lightLongPress = useLongPress(
    () => setLightModalOpen(true),
    () => mainLight?.service.toggle()
  );
  const tempLongPress = useLongPress(
    () => setTempModalOpen(true),
    () => {}
  );

  return (
    <Html>
      <Stack
        component={motion.div}
        bgcolor="background.default"
        direction="row"
        borderRadius="50px"
        spacing={2}
        p={1}
      >
        {temperature && (
          <>
            <motion.div layoutId={`${id}-temp`}>
              <Fab variant="extended" {...tempLongPress}>
                <ThermostatIcon />
                {`${temperature.state}°C`}
              </Fab>
            </motion.div>
            <TemperatureModal
              id={`${id}-temp`}
              open={tempModalOpen}
              onClose={() => setTempModalOpen(false)}
              entity={temperature}
            />
          </>
        )}
        {mainLight && (
          <>
            <motion.div layoutId={`${id}-light`}>
              <Fab
                variant="extended"
                sx={{
                  bgcolor:
                    mainLight.state === 'on'
                      ? mainLight.custom.hexColor
                      : undefined,
                  '&:hover': {
                    bgcolor:
                      mainLight.state === 'on'
                        ? alpha(mainLight.custom.hexColor, 0.8)
                        : undefined,
                  },
                }}
                {...lightLongPress}
              >
                <PendantRoundIcon />
              </Fab>
            </motion.div>
            <LightModal
              id={`${id}-light`}
              open={lightModalOpen}
              onClose={() => setLightModalOpen(false)}
              mainEntity={mainLight}
              entities={lights}
              title={name}
            />
          </>
        )}
      </Stack>
    </Html>
  );
}
