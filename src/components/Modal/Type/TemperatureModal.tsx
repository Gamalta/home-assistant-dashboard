import {
  AreaPlot,
  ChartsTooltip,
  ChartsXAxis,
  ChartsYAxis,
  LinePlot,
  ResponsiveChartContainer,
} from '@mui/x-charts';
import {Modal, ModalProps} from '..';
import {HassEntityWithService} from '@hakit/core';
import Stack from '@mui/material/Stack';

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

  return (
    <Modal {...modalProps}>
      <Stack width="500px" height="300px">
        Temperature Modal
        <ResponsiveChartContainer
          sx={{
            '& .MuiAreaElement-root': {
              overflow: 'hidden',
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
              min: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
              max: new Date(),
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
              tickNumber: 10,
              tickMinStep: 1,
              colorMap: {
                type: 'continuous',
                min: 15,
                max: 25,
                color: ['blue', 'red'],
              },
            },
          ]}
        >
          <LinePlot />
          <AreaPlot />
          <ChartsXAxis position="bottom" axisId="time" />
          <ChartsYAxis position="left" axisId="temperature" />
          <ChartsTooltip />
        </ResponsiveChartContainer>
      </Stack>
    </Modal>
  );
}
