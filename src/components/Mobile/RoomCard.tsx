import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type {HouseConfigType, RoomItemConfigType} from '../../configs/house';
import {RoomProvider} from '../../contexts/RoomContext';
import {RoomItem} from '../House/Room/RoomItem';

type RoomCardProps = {
  room: HouseConfigType['rooms'][0];
  items: RoomItemConfigType[];
  // Les étiquettes 3D sont montées en même temps : les layoutId doivent différer.
  idPrefix: string;
};

export function RoomCard(props: RoomCardProps) {
  const {room, items, idPrefix} = props;

  return (
    <Stack
      component="section"
      aria-label={room.name}
      spacing={1.5}
      sx={{p: 2, borderRadius: 3, bgcolor: 'background.primary'}}
    >
      <Typography variant="h6" component="h2" sx={{fontWeight: 700}}>
        {room.name}
      </Typography>
      {/* Sans son propre contexte, la modale lumière ne connaît pas la pièce. */}
      <RoomProvider>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gridAutoRows: 72,
            gap: 1,
            // Dans une carte de hauteur fixe, les tuiles en trop défilent.
            minHeight: 0,
            overflowY: 'auto',
          }}
        >
          {items.map((item, index) => (
            <RoomItem
              key={index}
              id={`${idPrefix}-${room.id}-${index}`}
              itemConfig={item}
              variant="tile"
            />
          ))}
        </Box>
      </RoomProvider>
    </Stack>
  );
}
