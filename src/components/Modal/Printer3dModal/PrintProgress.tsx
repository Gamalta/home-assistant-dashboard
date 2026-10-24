import {useEntity} from '@hakit/core';
import Chip, {ChipProps} from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  currentStageLabel,
  formatEndTime,
  formatRemainingTime,
  isPrintActive,
  printStatusLabel,
  type Printer3dEntityIds,
} from '../../../utils/entity/printer3d';

type PrintProgressProps = {
  ids: Printer3dEntityIds;
};

const options = {returnNullIfNotFound: true} as const;
const STATUS_COLORS: Record<string, ChipProps['color']> = {
  running: 'primary',
  pause: 'warning',
  failed: 'error',
  finish: 'success',
};

export function PrintProgress(props: PrintProgressProps) {
  const {ids} = props;
  const status = useEntity(ids.status, options);
  const stage = useEntity(ids.stage, options);
  const task = useEntity(ids.taskName, options);
  const progress = useEntity(ids.progress, options);
  const layer = useEntity(ids.currentLayer, options);
  const totalLayers = useEntity(ids.totalLayers, options);
  const remaining = useEntity(ids.remainingTime, options);
  const end = useEntity(ids.endTime, options);

  const active = isPrintActive(status?.state);
  const percent = Number(progress?.state) || 0;
  const remainingTime = formatRemainingTime(remaining?.state);

  return (
    <Stack spacing={1}>
      <Typography variant="h6" noWrap>
        {task?.state}
      </Typography>
      <Stack direction="row" spacing={1} sx={{alignItems: 'center'}}>
        <Chip
          size="small"
          label={printStatusLabel(status?.state ?? 'unknown')}
          color={STATUS_COLORS[status?.state ?? ''] ?? 'default'}
        />
        {active && stage && (
          <Typography variant="body2" color="textSecondary" noWrap>
            {currentStageLabel(stage.state)}
          </Typography>
        )}
      </Stack>
      <Stack direction="row" spacing={1} sx={{alignItems: 'center'}}>
        <LinearProgress
          variant="determinate"
          value={percent}
          aria-label="Progression"
          sx={{flex: 1, height: 8, borderRadius: 1}}
        />
        <Typography variant="body2">{percent}%</Typography>
      </Stack>
      {active && (
        <>
          <Stack direction="row" sx={{justifyContent: 'space-between'}}>
            <Typography variant="body2" color="textSecondary">
              Couche {layer?.state ?? '--'} / {totalLayers?.state ?? '--'}
            </Typography>
            {remainingTime && (
              <Typography variant="body2" color="textSecondary">
                Reste {remainingTime}
              </Typography>
            )}
          </Stack>
          <Typography variant="body2">{formatEndTime(end?.state)}</Typography>
        </>
      )}
    </Stack>
  );
}
