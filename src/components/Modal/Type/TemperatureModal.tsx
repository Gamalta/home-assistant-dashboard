import {
  AreaPlot,
  ChartsClipPath,
  ChartsTooltip,
  LinePlot,
  ResponsiveChartContainer,
} from '@mui/x-charts';
import {Modal, ModalProps} from '..';
import {HassEntityWithService} from '@hakit/core';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import {ThermostatIcon} from '../../Icons/ThermostatIcon';
import {Tooltip} from '@mui/material';

type TemperatureModalProps = Omit<ModalProps, 'children'> & {
  entity: HassEntityWithService<'sensor'>;
};

export function TemperatureModal(props: TemperatureModalProps) {
  const {entity, ...modalProps} = props;
  const dataset = entity.history.entityHistory.map(({lu, s}) => ({
    lu: lu * 1000,
    s: Number(s) || null,
  }));
  const temperatures = dataset
    .map(data => data.s)
    .filter(temp => temp !== null);
  const maxTemp = Math.max(...temperatures);
  const minTemp = Math.min(...temperatures);
  const lastTime = dataset[dataset.length - 1]?.lu;
  const formatedLastTime = new Date(lastTime).toLocaleTimeString('fr', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Modal {...modalProps}>
      <Stack width="500px" height="300px" position="relative">
        <Stack justifyContent="space-between" height="100%">
          <Stack direction="row" width="fit-content">
            <ThermostatIcon sx={{fontSize: '48px'}} />
            <Tooltip title={`mis à jour: ${formatedLastTime}`}>
              <Typography variant="h4">{`${entity.state}°C`}</Typography>
            </Tooltip>
          </Stack>
          <Chip label={`${maxTemp}°C`} sx={{width: 'fit-content'}} />
          <Chip label={`${minTemp}°C`} sx={{width: 'fit-content'}} />
        </Stack>
        <Stack
          margin="-32px"
          marginTop={0}
          height="275px"
          width="564px"
          position="absolute"
          bottom={0}
        >
          <ResponsiveChartContainer
            margin={{bottom: 0, right: 0, top: 0, left: 0}}
            sx={{
              '& .MuiLineElement-root': {
                strokeWidth: 3,
              },
            }}
            dataset={dataset}
            series={[
              {
                type: 'line',
                dataKey: 's',
                label: 'Température (°C)',
                area: true,
              },
            ]}
            xAxis={[
              {
                id: 'time',
                dataKey: 'lu',
                scaleType: 'utc',
                min: lastTime - 24 * 60 * 60 * 1000,
                max: lastTime,
                tickMinStep: 1800000,
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
                min: minTemp - 1,
                max: maxTemp + 1,
                scaleType: 'linear',
                /*colorMap: {
                type: 'piecewise',
                thresholds: [0, 5, 10, 15, 20, 25, 30, 35, 40],
                colors: [
                  '#0000FF',
                  '#007FFF',
                  '#00FFFF',
                  '#00FF7F',
                  '#7FFF00',
                  '#FFFF00',
                  '#FF7F00',
                  '#FF4500',
                  '#FF0000',
                ],
              },*/
              },
            ]}
          >
            <g clipPath="url(#clip-path)">
              <LinePlot />
              <AreaPlot opacity={0.2} />
            </g>
            <ChartsTooltip />
            <ChartsClipPath id="clip-path" />
          </ResponsiveChartContainer>
        </Stack>
      </Stack>
    </Modal>
  );
}
