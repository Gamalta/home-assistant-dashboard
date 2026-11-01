import {useEntity} from '@hakit/core';
import SquareFootIcon from '@mui/icons-material/SquareFootRounded';
import TimerIcon from '@mui/icons-material/TimerRounded';
import Chip, {ChipProps} from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  formatCleaningTime,
  isCleaningActive,
  vacuumStateLabel,
  type VacuumEntityIds,
} from '../../../utils/entity/vacuum';

type VacuumStatusProps = {
  ids: VacuumEntityIds;
};

const options = {returnNullIfNotFound: true} as const;
const STATE_COLORS: Record<string, ChipProps['color']> = {
  cleaning: 'primary',
  paused: 'warning',
  returning: 'info',
  docked: 'success',
  error: 'error',
};

export function VacuumStatus(props: VacuumStatusProps) {
  const {ids} = props;
  const vacuum = useEntity(ids.vacuum, options);
  const map = useEntity(ids.map, options);

  if (!vacuum) return null;
  const {vacuum_state, cleaning_progress, cleaned_area, cleaning_time} =
    vacuum.attributes;
  const active = isCleaningActive(vacuum.state);
  const room = map?.attributes.rooms?.[vacuum.attributes.current_segment];
  // Hors nettoyage, la surface et la durée sont celles du dernier.
  const figures = [
    {
      icon: <SquareFootIcon />,
      label: 'Surface',
      value: `${cleaned_area ?? '--'} m²`,
    },
    {
      icon: <TimerIcon />,
      label: 'Durée',
      value: formatCleaningTime(cleaning_time),
    },
  ];

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1} sx={{alignItems: 'center'}}>
        <Chip
          size="small"
          label={vacuumStateLabel(vacuum_state ?? vacuum.state)}
          color={STATE_COLORS[vacuum.state] ?? 'default'}
        />
        {active && room && (
          <Typography variant="body2" color="textSecondary" noWrap>
            {room.name}
          </Typography>
        )}
      </Stack>
      {active && cleaning_progress !== undefined && (
        <Stack direction="row" spacing={1} sx={{alignItems: 'center'}}>
          <LinearProgress
            variant="determinate"
            value={cleaning_progress}
            aria-label="Progression"
            sx={{flex: 1, height: 8, borderRadius: 1}}
          />
          <Typography variant="body2">{cleaning_progress}%</Typography>
        </Stack>
      )}
      <Stack direction="row" spacing={1}>
        {figures.map(figure => (
          <Stack
            key={figure.label}
            direction="row"
            spacing={1}
            sx={{
              flex: 1,
              alignItems: 'center',
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'background.tertiary',
              color: 'text.secondary',
            }}
          >
            {figure.icon}
            <Stack>
              <Typography
                variant="h6"
                color="textPrimary"
                sx={{lineHeight: 1.2}}
              >
                {figure.value}
              </Typography>
              <Typography variant="caption">{figure.label}</Typography>
            </Stack>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
