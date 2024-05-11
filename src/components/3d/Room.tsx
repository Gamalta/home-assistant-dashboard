import {useFrame} from '@react-three/fiber';
import {RoomConfig} from './config';
import * as THREE from 'three';
import {HassEntityWithService, useEntity} from '@hakit/core';
import {Html} from './Html';
import Stack from '@mui/material/Stack';
import Fab from '@mui/material/Fab';
import {PendantRoundIcon} from '../Icons/PendantRoundIcon';
import {useHouseContext} from '../../contexts/HouseContext';
import {ThermostatIcon} from '../Icons/ThermostatIcon';
import {useState} from 'react';
import {useLongPress} from '../../hooks/useLongPress';
import {alpha} from '@mui/material/styles';
import {motion} from 'framer-motion';
import {TemperatureModal} from '../Modal/Type/TemperatureModal';
import {LightModal} from '../Modal/Type/LightModal';

type RoomProps = {
  room: RoomConfig;
  debug?: boolean;
};

export function Room(props: RoomProps) {
  const {room, debug} = props;
  const {camera, position, size} = room;

  const {room: activeRoom, setRoom} = useHouseContext();
  const isActive = activeRoom === room.name;

  const temperature = useEntity(room.temperature ?? 'unknown', {
    returnNullIfNotFound: true,
  });
  const mainLight = useEntity(room.light ?? 'unknown', {
    returnNullIfNotFound: true,
  });
  // TODO fix later
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const lights = room.lights?.map(light => useEntity(light.entity));

  useFrame(state => {
    if (!isActive) return;
    const cameraPosition = new THREE.Vector3(...camera.position);
    const cameraLookAt = new THREE.Vector3(...camera.lookAt);

    state.camera.position.lerp(cameraPosition, 0.05);
    state.camera.lookAt(cameraLookAt);
  });

  return (
    <mesh
      position={position}
      castShadow
      onClick={() => setRoom(room.name)}
      onPointerEnter={() => console.log('enter')}
      onPointerLeave={() => console.log('leave')}
    >
      <boxGeometry args={[size[0], 0.1, size[1]]} />
      <meshBasicMaterial transparent opacity={debug ? 0.5 : 0} />
      {(!activeRoom || isActive) && (
        <RoomAction
          key={room.name}
          id={`action-${room.name}`}
          temperature={temperature ?? undefined}
          mainLight={mainLight ?? undefined}
          lights={lights}
        />
      )}
      {mainLight?.state === 'on' && (
        <pointLight
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
    </mesh>
  );
}

type RoomActionProps = {
  id: string;
  temperature?: HassEntityWithService<'sensor'>;
  mainLight?: HassEntityWithService<'light'>;
  lights?: HassEntityWithService<'light'>[];
};

function RoomAction(props: RoomActionProps) {
  const {id, temperature, mainLight, lights} = props;
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
            />
          </>
        )}
      </Stack>
    </Html>
  );
}
