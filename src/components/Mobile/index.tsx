import Stack from '@mui/material/Stack';
import {useState} from 'react';
import {useHouseContext} from '../../contexts/HouseContext';
import House from '../3d/House';
import {ScenarioBar} from '../ScenarioBar';
import {MobileHeader} from './MobileHeader';
import {RoomCarousel} from './RoomCarousel';
import {RoomList} from './RoomList';
import {MobileTab, TabBar} from './TabBar';

export function MobileDashboard() {
  const {houseConfig} = useHouseContext();
  const rooms = houseConfig?.house.rooms ?? [];
  const [tab, setTab] = useState<MobileTab>('maison');
  const [roomId, setRoomId] = useState<string>();
  const room = rooms.find(candidate => candidate.id === roomId) ?? rooms[0];

  return (
    <Stack sx={{height: '100dvh', bgcolor: 'background.default'}}>
      <Stack sx={{position: 'relative', flex: 1, minHeight: 0}}>
        {/* Reste montée sur l'onglet Pièces : la scène ne recompile pas ses
            shaders au retour, elle est seulement mise en pause. */}
        <Stack
          sx={{
            position: 'absolute',
            inset: 0,
            visibility: tab === 'maison' ? 'visible' : 'hidden',
          }}
        >
          <House focusRoomId={room?.id} paused={tab !== 'maison'} />
          <ScenarioBar />
          <RoomCarousel
            rooms={rooms}
            roomId={room?.id}
            onRoomChange={setRoomId}
          />
        </Stack>
        {tab === 'pieces' && <RoomList rooms={rooms} />}
        <MobileHeader />
      </Stack>
      <TabBar value={tab} onChange={setTab} />
    </Stack>
  );
}
