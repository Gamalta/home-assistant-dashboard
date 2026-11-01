import {useEntity, useHass} from '@hakit/core';
import CheckIcon from '@mui/icons-material/CheckRounded';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import {keyframes} from '@mui/material/styles';
import {useState} from 'react';
import {
  isCleaningActive,
  toMapPixel,
  type CalibrationPoint,
  type VacuumEntityIds,
} from '../../../utils/entity/vacuum';

type VacuumMapProps = {
  ids: VacuumEntityIds;
  selected: number[];
  onToggle: (room: number) => void;
};

type MapRoom = {room_id: number; name: string; x: number; y: number};

const options = {returnNullIfNotFound: true} as const;

// Plan dessiné par l'intégration, chemin du robot compris ; les pièces s'y
// ajoutent en étiquettes qu'on touche pour les choisir.
export function VacuumMap(props: VacuumMapProps) {
  const {ids, selected, onToggle} = props;
  const joinHassUrl = useHass(state => state.helpers.joinHassUrl);
  const vacuum = useEntity(ids.vacuum, options);
  const map = useEntity(ids.map, options);
  // Les points de calibration se rapportent à la taille d'origine de l'image.
  const [size, setSize] = useState<{width: number; height: number} | null>(
    null,
  );

  const picture = map?.attributes.entity_picture;
  if (!picture) return null;
  const calibration: CalibrationPoint[] | undefined =
    map.attributes.calibration_points;
  const rooms: MapRoom[] = Object.values(map.attributes.rooms ?? {});
  const planned: number[] = map.attributes.active_segments ?? [];
  const completed: number[] = map.attributes.completed_segments ?? [];
  const active = isCleaningActive(vacuum?.state);

  return (
    <Box sx={{position: 'relative', borderRadius: 2, overflow: 'hidden'}}>
      <img
        src={joinHassUrl(picture)}
        alt="Plan de nettoyage"
        onLoad={event =>
          setSize({
            width: event.currentTarget.naturalWidth,
            height: event.currentTarget.naturalHeight,
          })
        }
        style={{display: 'block', maxWidth: '100%', maxHeight: 400}}
      />
      {size &&
        calibration &&
        rooms.map(room => {
          const {x, y} = toMapPixel(room, calibration);
          const current =
            active && room.room_id === vacuum?.attributes.current_segment;
          const done = active && completed.includes(room.room_id);
          const chosen = !active && selected.includes(room.room_id);
          const skipped =
            active && planned.length > 0 && !planned.includes(room.room_id);
          return (
            <Chip
              key={room.room_id}
              size="small"
              label={room.name}
              icon={done || chosen ? <CheckIcon /> : undefined}
              color={
                current || chosen ? 'primary' : done ? 'success' : 'default'
              }
              aria-pressed={active ? undefined : chosen}
              onClick={active ? undefined : () => onToggle(room.room_id)}
              sx={{
                position: 'absolute',
                left: `${(x / size.width) * 100}%`,
                top: `${(y / size.height) * 100}%`,
                transform: 'translate(-50%, -50%)',
                boxShadow: 2,
                opacity: skipped ? 0.5 : 1,
                ...(!current &&
                  !chosen &&
                  !done && {bgcolor: 'background.paper'}),
                ...(current && {
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'inherit',
                    border: '2px solid',
                    borderColor: 'primary.main',
                    animation: `${pulse} 1.6s ease-out infinite`,
                  },
                }),
              }}
            />
          );
        })}
    </Box>
  );
}

const pulse = keyframes`
  to {
    transform: scale(1.4);
    opacity: 0;
  }
`;
