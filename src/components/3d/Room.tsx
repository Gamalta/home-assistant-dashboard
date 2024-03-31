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
import {useLongPress} from '../../hooks/LongPress';
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

  const temperature = room.temperature && useEntity(room.temperature);
  const light = room.light && useEntity(room.light);

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
          temperature={temperature}
          light={light}
        />
      )}
      {light?.state === 'on' && (
        <pointLight
          castShadow
          position={[0, -0.1, 0]}
          color={light.custom.color}
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
  light?: HassEntityWithService<'light'>;
};

function RoomAction(props: RoomActionProps) {
  const {id, temperature, light} = props;
  const [lightModalOpen, setLightModalOpen] = useState(false);
  const [tempModalOpen, setTempModalOpen] = useState(false);

  const lightLongPress = useLongPress(
    () => setLightModalOpen(true),
    () => light?.service.toggle()
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
        {light && (
          <>
            <motion.div layoutId={`${id}-light`}>
              <Fab
                variant="extended"
                sx={{
                  bgcolor:
                    light.state === 'on' ? light.custom.hexColor : undefined,
                  '&:hover': {
                    bgcolor:
                      light.state === 'on'
                        ? alpha(light.custom.hexColor, 0.8)
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
              entity={light}
            />
          </>
        )}
      </Stack>
    </Html>
  );
}
