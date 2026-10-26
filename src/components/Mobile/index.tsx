import Stack from '@mui/material/Stack';
import {useState} from 'react';
import {useHouseContext} from '../../contexts/HouseContext';
import House from '../3d/House';
import {ScenarioBar} from '../ScenarioBar';
import {MobileHeader} from './MobileHeader';
import {RoomCarousel} from './RoomCarousel';
import {RoomList} from './RoomList';
import type {MobileView} from './ViewToggle';

export function MobileDashboard() {
  const {houseConfig} = useHouseContext();
  const rooms = houseConfig?.house.rooms ?? [];
  const [view, setView] = useState<MobileView>('maison');
  const [roomId, setRoomId] = useState<string>();
  const room = rooms.find(candidate => candidate.id === roomId) ?? rooms[0];

  return (
    <Stack
      sx={{
        position: 'relative',
        height: '100dvh',
        bgcolor: 'background.default',
      }}
    >
      {/* Reste montée sur la vue Pièces : la scène ne recompile pas ses
          shaders au retour, elle est seulement mise en pause. */}
      <Stack
        sx={{
          position: 'absolute',
          inset: 0,
          visibility: view === 'maison' ? 'visible' : 'hidden',
        }}
      >
        <House focusRoomId={room?.id} paused={view !== 'maison'} />
        <ScenarioBar />
        <RoomCarousel
          rooms={rooms}
          roomId={room?.id}
          onRoomChange={setRoomId}
        />
      </Stack>
      {view === 'pieces' && <RoomList rooms={rooms} />}
      <MobileHeader view={view} onViewChange={setView} />
    </Stack>
  );
}
