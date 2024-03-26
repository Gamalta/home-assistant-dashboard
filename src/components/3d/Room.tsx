import {useFrame} from '@react-three/fiber';
import {RoomConfig} from './config';
import * as THREE from 'three';
import {HassEntityWithService, useEntity} from '@hakit/core';
import {Html} from './Html';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import {PendantRound} from '../Icons/PendantRound';
import {alpha} from '@mui/material';
import {useHouseContext} from '../../context/House';

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
        <RoomAction temperature={temperature} light={light} />
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
  temperature?: HassEntityWithService<'sensor'>;
  light?: HassEntityWithService<'light'>;
};

function RoomAction(props: RoomActionProps) {
  const {temperature, light} = props;
  return (
    <Html distanceFactor={10}>
      <Stack
        bgcolor="background.default"
        direction="row"
        borderRadius="50px"
        spacing={1}
        p={1}
      >
        {temperature && <Chip label={`${temperature.state}°C`} />}
        {light && (
          <Chip
            icon={<PendantRound />}
            sx={{
              bgcolor: light.state === 'on' ? light.custom.hexColor : undefined,
              p: 1,
              '& .MuiChip-label': {pr: 0},
              '&:hover': {
                bgcolor:
                  light.state === 'on'
                    ? alpha(light.custom.hexColor, 0.8)
                    : undefined,
              },
            }}
            onClick={event => {
              event.stopPropagation();
              light.service.toggle();
            }}
          />
        )}
      </Stack>
    </Html>
  );
}
