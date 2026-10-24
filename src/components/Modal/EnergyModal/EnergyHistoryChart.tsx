import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import {BarChart, barClasses} from '@mui/x-charts/BarChart';
import {useState} from 'react';
import {
  type DayConsumption,
  formatEnergy,
  TARIFF_PERIODS,
} from '../../../utils/energy';

type EnergyHistoryChartProps = {
  /** Jours du plus ancien à aujourd'hui. */
  days: DayConsumption[];
};

export function EnergyHistoryChart(props: EnergyHistoryChartProps) {
  const {days} = props;
  const [length, setLength] = useState(7);

  return (
    <Stack spacing={1}>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={length}
        onChange={(_, value: number | null) => value && setLength(value)}
        sx={{alignSelf: 'flex-end'}}
      >
        <ToggleButton value={7}>7 jours</ToggleButton>
        <ToggleButton value={30}>30 jours</ToggleButton>
      </ToggleButtonGroup>
      <BarChart
        height={220}
        dataset={days.slice(-length)}
        borderRadius={4}
        grid={{horizontal: true}}
        xAxis={[
          {
            scaleType: 'band',
            dataKey: 'start',
            valueFormatter: (start: number, context) =>
              new Date(start).toLocaleDateString(
                'fr-FR',
                context.location !== 'tick'
                  ? {weekday: 'long', day: 'numeric', month: 'long'}
                  : length > 7
                    ? {day: 'numeric'}
                    : {weekday: 'short'},
              ),
          },
        ]}
        yAxis={[{label: 'kWh', width: 48}]}
        series={(['peak', 'offPeak'] as const).map(period => ({
          dataKey: period,
          stack: 'day',
          label: TARIFF_PERIODS[period].label,
          color: TARIFF_PERIODS[period].color,
          valueFormatter: formatEnergy,
        }))}
        // Un liseré de la couleur du fond sépare les heures pleines des heures creuses.
        sx={theme => ({
          [`& .${barClasses.element}`]: {
            stroke: (theme.vars ?? theme).palette.background.paper,
            strokeWidth: 2,
          },
        })}
      />
    </Stack>
  );
}
