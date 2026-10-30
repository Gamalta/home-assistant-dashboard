import {useEntity} from '@hakit/core';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {SystemGraphConfigType} from '../../../configs/sidebar';
import {
  alignHistories,
  formatTime,
  isHistoryLoading,
} from '../../../utils/chart';
import {Chart} from '../../Charts/Chart';

type SystemGraphDisplayProps = {
  graphConfig: SystemGraphConfigType;
};

export function SystemGraphDisplay(props: SystemGraphDisplayProps) {
  const {graphConfig} = props;
  const entity = useEntity(graphConfig.sensorEntityId ?? 'unknown', {
    returnNullIfNotFound: true,
    historyOptions: {
      disable: false,
      hoursToShow: 24,
    },
  });
  if (!entity) return null;

  const {
    x,
    data: [values],
  } = alignHistories([entity.history?.entityHistory ?? []]);
  const unit = entity.attributes.unit_of_measurement ?? '';

  return (
    <Chart
      loading={isHistoryLoading(entity.history)}
      x={x}
      formatX={formatTime}
      series={[
        {
          id: 'value',
          label: graphConfig.label,
          data: values,
          color: graphConfig.color,
          format: value =>
            `${value.toLocaleString('fr', {maximumFractionDigits: 1})}${unit}`,
        },
      ]}
      sx={{
        width: 175,
        height: 150,
        p: {xs: 1, sm: 1.5},
        bgcolor: 'background.tertiary',
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      {/* Sur téléphone, la valeur passe sous le libellé. */}
      <Stack
        direction={{xs: 'column', sm: 'row'}}
        sx={{justifyContent: 'space-between', alignItems: 'baseline'}}
      >
        <Typography variant="body2" color="textSecondary">
          {graphConfig.label}
        </Typography>
        <Typography variant="h6">
          {entity.state}
          {unit}
        </Typography>
      </Stack>
    </Chart>
  );
}
