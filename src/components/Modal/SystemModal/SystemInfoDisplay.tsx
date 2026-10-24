import {
  EntityName,
  FilterByDomain,
  HassEntityWithService,
  useEntity,
} from '@hakit/core';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type SystemInfoDisplayProps = {
  label: string;
  sensor?: FilterByDomain<EntityName, 'sensor' | 'binary_sensor'>;
  formatEntity?: (entity: HassEntityWithService<'sensor'>) => string;
  isWarning?: (entity: HassEntityWithService<'sensor'>) => boolean;
};

export function SystemInfoDisplay(props: SystemInfoDisplayProps) {
  const {
    label,
    sensor,
    formatEntity = entity => entity.state,
    isWarning,
  } = props;

  const entity = useEntity(sensor ?? 'unknown', {returnNullIfNotFound: true});
  if (!entity) return null;

  return (
    <Stack
      direction="row"
      sx={{justifyContent: 'space-between', alignItems: 'center'}}
    >
      <Typography>{label}</Typography>
      <Typography color={isWarning?.(entity) ? 'error' : 'text.secondary'}>
        {formatEntity(entity)}
      </Typography>
    </Stack>
  );
}
