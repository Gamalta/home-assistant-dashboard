import {useFrame} from '@react-three/fiber';
import {RoomConfig} from './config';
import * as THREE from 'three';
import {useEntity} from '@hakit/core';
import {Html} from './Html';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import {PendantRound} from '../Icons/PendantRound';

type RoomProps = {
  room: RoomConfig;
  active: boolean;
  debug?: boolean;
  onClick: () => void;
};

export function Room(props: RoomProps) {
  const {room, active, onClick, debug} = props;
  const {camera, position, size, temperature, light} = room;

  useFrame(state => {
    if (!active) return;
    const cameraPosition = new THREE.Vector3(...camera.position);
    const cameraLookAt = new THREE.Vector3(...camera.lookAt);

    state.camera.position.lerp(cameraPosition, 0.05);
    state.camera.lookAt(cameraLookAt);
  });

  return (
    <mesh
      position={position}
      castShadow
      onClick={onClick}
      onPointerEnter={() => console.log('enter')}
      onPointerLeave={() => console.log('leave')}
    >
      <boxGeometry args={[size[0], 0.1, size[1]]} />
      <meshBasicMaterial transparent opacity={debug ? 0.5 : 0} />
      <RoomAction temperature={temperature} light={light} />
    </mesh>
  );
}

type RoomActionProps = {
  temperature?: RoomConfig['temperature'];
  light?: RoomConfig['light'];
};

function RoomAction(props: RoomActionProps) {
  const temperature = props.temperature && useEntity(props.temperature);
  const light = props.light && useEntity(props.light);
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
            sx={{p: 1, '& .MuiChip-label': {pr: 0}}}
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
