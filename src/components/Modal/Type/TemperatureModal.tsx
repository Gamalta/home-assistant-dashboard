import {
  ChartsXAxis,
  LinePlot,
  MarkPlot,
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

  const dataset = entity.history.entityHistory.map(item => {
    return {
      lu: new Date(item.lu * 1000).toLocaleTimeString('fr', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      s: Number(item.s),
    };
  });

  return (
    <Modal {...modalProps}>
      <Stack width="500px" height="300px">
        Temperature Modal
        <ResponsiveChartContainer
          dataset={dataset}
          series={[
            {
              type: 'line',
              dataKey: 's',
              label: 'Température (°C)',
            },
          ]}
          xAxis={[
            {
              id: 'time',
              dataKey: 'lu',
              scaleType: 'band',
            },
          ]}
          yAxis={[
            {
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
          <MarkPlot />
          <ChartsXAxis position="bottom" axisId="time" />
        </ResponsiveChartContainer>
      </Stack>
    </Modal>
  );
}
