import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {useState} from 'react';
import type {HouseConfigType} from '../../configs/house';
import {filterRoomItems, RoomFilter} from '../../utils/room';
import {RoomCard} from './RoomCard';

const FILTERS: {value: RoomFilter; label: string}[] = [
  {value: 'all', label: 'Toutes'},
  {value: 'light', label: 'Lumières'},
  {value: 'shutter', label: 'Volets'},
  {value: 'climate', label: 'Climat'},
];

type RoomListProps = {
  rooms: HouseConfigType['rooms'];
};

export function RoomList(props: RoomListProps) {
  const {rooms} = props;
  const [filter, setFilter] = useState<RoomFilter>('all');

  return (
    <Stack
      spacing={1.5}
      sx={{
        position: 'absolute',
        inset: 0,
        overflowY: 'auto',
        // Sous l'en-tête, posé par-dessus la liste.
        pt: 12,
        px: 2,
        pb: 2,
        bgcolor: 'background.default',
      }}
    >
      <Typography variant="h4" component="h1" sx={{fontWeight: 700}}>
        Pièces
      </Typography>
      <Stack direction="row" spacing={1} role="group" aria-label="Filtres">
        {FILTERS.map(option => (
          <Chip
            key={option.value}
            label={option.label}
            clickable
            aria-pressed={filter === option.value}
            color={filter === option.value ? 'primary' : 'default'}
            onClick={() => setFilter(option.value)}
            sx={{height: 40, borderRadius: 5}}
          />
        ))}
      </Stack>
      {rooms.map(room => {
        const items = filterRoomItems(room.items ?? [], filter);
        return (
          items.length > 0 && (
            <RoomCard
              key={room.id}
              room={room}
              items={items}
              idPrefix="liste"
            />
          )
        );
      })}
    </Stack>
  );
}
