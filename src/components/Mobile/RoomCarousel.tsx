import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import {useEffect, useRef} from 'react';
import type {HouseConfigType} from '../../configs/house';
import {carouselPage} from '../../utils/carousel';
import {RoomCard} from './RoomCard';

// Délai sans défilement avant de choisir la pièce : la caméra ne vise pas
// chaque pièce traversée.
const SETTLE_DELAY = 120;

type RoomCarouselProps = {
  rooms: HouseConfigType['rooms'];
  roomId?: string;
  onRoomChange: (roomId: string) => void;
};

export function RoomCarousel(props: RoomCarouselProps) {
  const {rooms, roomId, onRoomChange} = props;
  const chipsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const settle = useRef<ReturnType<typeof setTimeout>>(undefined);
  const index = Math.max(
    0,
    rooms.findIndex(room => room.id === roomId),
  );

  useEffect(() => () => clearTimeout(settle.current), []);

  useEffect(() => {
    chipsRef.current?.children[index]?.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
      behavior: 'smooth',
    });
  }, [index]);

  const showRoom = (roomIndex: number) => {
    onRoomChange(rooms[roomIndex].id);
    const card = cardsRef.current?.children[roomIndex];
    if (card instanceof HTMLElement)
      cardsRef.current?.scrollTo({
        left: card.offsetLeft - 16,
        behavior: 'smooth',
      });
  };

  return (
    <Stack
      spacing={1.5}
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        pb: 2,
        // Entre les cartes, les gestes vont à la scène 3D.
        pointerEvents: 'none',
        '& > *': {pointerEvents: 'auto'},
      }}
    >
      <Stack
        ref={chipsRef}
        direction="row"
        spacing={1}
        role="group"
        aria-label="Choix de la pièce"
        sx={{px: 2, overflowX: 'auto', scrollbarWidth: 'none'}}
      >
        {rooms.map((room, roomIndex) => (
          <Chip
            key={room.id}
            label={room.name}
            clickable
            aria-pressed={roomIndex === index}
            color={roomIndex === index ? 'primary' : 'default'}
            onClick={() => showRoom(roomIndex)}
            sx={{
              flexShrink: 0,
              height: 40,
              borderRadius: 5,
              ...(roomIndex !== index && {bgcolor: 'background.primary'}),
            }}
          />
        ))}
      </Stack>
      <Box
        ref={cardsRef}
        aria-label="Pièces"
        onScroll={event => {
          const {scrollLeft, scrollWidth} = event.currentTarget;
          clearTimeout(settle.current);
          settle.current = setTimeout(() => {
            const page = carouselPage(scrollLeft, scrollWidth, rooms.length);
            onRoomChange(rooms[page].id);
          }, SETTLE_DELAY);
        }}
        sx={{
          // Les offsetLeft des cartes se mesurent depuis le carrousel.
          position: 'relative',
          display: 'grid',
          gridAutoFlow: 'column',
          // Le bord de la carte suivante dépasse : on devine qu'il y a une suite.
          gridAutoColumns: 'calc(100% - 40px)',
          gap: 1.5,
          px: 2,
          overflowX: 'auto',
          overscrollBehaviorX: 'contain',
          scrollSnapType: 'x mandatory',
          scrollPaddingInline: '16px',
          scrollbarWidth: 'none',
          '& > *': {
            scrollSnapAlign: 'start',
            // Même hauteur pour toutes : deux rangées de tuiles et le haut
            // de la troisième, qui invite à faire défiler.
            height: 260,
          },
        }}
      >
        {rooms.map(room => (
          <RoomCard
            key={room.id}
            room={room}
            items={room.items ?? []}
            idPrefix="carrousel"
          />
        ))}
      </Box>
    </Stack>
  );
}
