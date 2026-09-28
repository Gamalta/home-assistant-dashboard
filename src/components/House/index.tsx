import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import {useEffect, useRef, useState} from 'react';
import {useHouseContext} from '../../contexts/HouseContext';
import {RoomProvider} from '../../contexts/RoomContext';
import type {LightConfigType} from '../../configs/house';
import {Room, RoomAnchorProps} from './Room';
import {RoomLightImage} from './Room/RoomLightImage';

/** Opacité du plan de nuit selon l'heure (fondu à l'aube et au crépuscule). */
function getNightOpacity(date: Date) {
  const hour = date.getHours() + date.getMinutes() / 60;
  if (hour >= 6 && hour < 8) return 1 - (hour - 6) / 2;
  if (hour >= 8 && hour < 16) return 0;
  if (hour >= 16 && hour < 18) return (hour - 16) / 2;
  return 1;
}

function Anchor2d({floorPosition, children}: RoomAnchorProps) {
  // Élément sans position 2D : il n'est pas affiché sur le plan.
  if (!floorPosition) return null;
  return (
    <Stack
      sx={{
        zIndex: 100,
        position: 'absolute',
        top: `${floorPosition.y}%`,
        left: `${floorPosition.x}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {children}
    </Stack>
  );
}

/** Vue 2D (plan et calques d'éclairage), utilisée quand la 3D est indisponible. */
export default function House2d() {
  const {houseConfig} = useHouseContext();
  const house = houseConfig?.house;
  const [nightOpacity, setNightOpacity] = useState(() =>
    getNightOpacity(new Date()),
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [planSize, setPlanSize] = useState({width: 0, height: 0});

  useEffect(() => {
    const interval = setInterval(
      () => setNightOpacity(getNightOpacity(new Date())),
      60000,
    );
    return () => clearInterval(interval);
  }, []);

  // Le plan est affiché en `object-fit: contain` : on calcule la zone qu'il
  // occupe réellement pour y positionner les éléments en pourcentage.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !aspectRatio) return;
    const updateSize = () => {
      const {width, height} = container.getBoundingClientRect();
      if (width / height > aspectRatio) {
        setPlanSize({width: height * aspectRatio, height});
      } else {
        setPlanSize({width, height: width / aspectRatio});
      }
    };
    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [aspectRatio]);

  if (!house?.floorPlan) {
    return (
      <Stack
        sx={{height: '100%', justifyContent: 'center', alignItems: 'center'}}
      >
        <Alert severity="warning" variant="filled">
          Aucun plan 2D dans cette configuration.
        </Alert>
      </Stack>
    );
  }

  const lights = house.rooms.flatMap(room =>
    (room.items ?? []).filter(
      (item): item is LightConfigType => item.type === 'light' && !!item.layer,
    ),
  );

  return (
    <Stack
      ref={containerRef}
      sx={{
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        alignItems: 'center',
        '& img': {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          transition: 'opacity 1s',
          objectFit: 'contain',
        },
      }}
    >
      <img
        src={house.floorPlan.day}
        onLoad={event => {
          const {naturalWidth, naturalHeight} = event.currentTarget;
          setAspectRatio(naturalWidth / naturalHeight);
        }}
      />
      <img src={house.floorPlan.night} style={{opacity: nightOpacity}} />
      <Stack
        sx={{
          position: 'relative',
          top: '50%',
          width: planSize.width,
          height: planSize.height,
          transform: 'translateY(-50%)',
        }}
      >
        {lights.map(light => (
          <RoomLightImage key={light.lightEntityId} lightConfig={light} />
        ))}
        {house.rooms.map(room => (
          <RoomProvider key={room.id}>
            <Room room={room} Anchor={Anchor2d} />
          </RoomProvider>
        ))}
      </Stack>
    </Stack>
  );
}
