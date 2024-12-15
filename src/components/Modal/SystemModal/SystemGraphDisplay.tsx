import {useEntity} from '@hakit/core';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {SystemGraphConfigType} from '../../../configs/house';
import {roundToNearest5Minutes} from '../../../utils/graph';
import {ChartsTooltip} from '@mui/x-charts/ChartsTooltip';
import {ResponsiveChartContainer} from '@mui/x-charts/ResponsiveChartContainer';
import {ChartsClipPath} from '@mui/x-charts/ChartsClipPath';
import {LinePlot} from '@mui/x-charts/LineChart';
import {AreaPlot} from '@mui/x-charts/LineChart';

type SystemGraphDisplayProps = {
  graphConfig: SystemGraphConfigType;
};

export function SystemGraphDisplay(props: SystemGraphDisplayProps) {
  const {graphConfig} = props;

  const entity = useEntity(graphConfig.sensor ?? 'unknown', {
    returnNullIfNotFound: true,
    historyOptions: {
      disable: false,
      hoursToShow: 24,
    },
  });
  if (!entity) return null;

  const valueMap = Object.fromEntries(
    entity.history.entityHistory.map(data => [
      roundToNearest5Minutes(data.lu * 1000),
      Number(data.s) || null,
    ])
  );
  const values = Object.values(valueMap).filter(
    (data): data is number => data !== null
  );
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const timestamps = Array.from(new Set(Object.keys(valueMap))).sort(
    (a, b) => Number(a) - Number(b)
  );

  const dataset = timestamps.map(time => {
    const value = valueMap[time];
    return {
      timestamp: Number(time),
      value,
    };
  });
  const lastTime = dataset[dataset.length - 1]?.timestamp;

  return (
    <Stack
      position="relative"
      bgcolor="background.tertiary"
      borderRadius={1}
      overflow="hidden"
    >
      <ResponsiveChartContainer
        margin={{bottom: 0, right: 0, top: 0, left: 0}}
        sx={{
          '& .MuiLineElement-series-temperature': {
            strokeWidth: 3,
          },
          '& .MuiLineElement-series-humidity': {
            strokeWidth: 2,
            opacity: 0.5,
          },
        }}
        dataset={dataset}
        series={[
          {
            id: 'value',
            type: 'line',
            dataKey: 'value',
            label: graphConfig.label,
            color: graphConfig.color,
            area: true,
            valueFormatter: value =>
              `${value}${entity.attributes.unit_of_measurement}`,
          },
        ]}
        xAxis={[
          {
            id: 'time',
            dataKey: 'timestamp',
            scaleType: 'utc',
            min: lastTime - 24 * 60 * 60 * 1000,
            max: lastTime,
            valueFormatter: value =>
              new Date(value).toLocaleTimeString('fr', {
                hour: '2-digit',
                minute: '2-digit',
              }),
          },
        ]}
        yAxis={[
          {
            id: 'temperature',
            min: minValue * 0.9,
            max: maxValue * 1.1,
            scaleType: 'linear',
          },
        ]}
        width={175}
        height={125}
      >
        <g clipPath="url(#clip-path)">
          <LinePlot />
          <AreaPlot opacity={0.2} />
        </g>
        <ChartsTooltip />
        <ChartsClipPath id="clip-path" />
      </ResponsiveChartContainer>
      <Stack
        direction="row"
        justifyContent="space-between"
        position="absolute"
        width="100%"
        spacing={1}
        p={1}
      >
        <Typography variant="body2" sx={{fontWeight: 'bold'}}>
          {graphConfig.label}
        </Typography>
        <Typography variant="body2">
          {entity.state}
          {entity.attributes.unit_of_measurement}
        </Typography>
      </Stack>
    </Stack>
  );
}
