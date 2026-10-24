import {useTheme} from '@mui/material/styles';
import {LineChart, lineClasses} from '@mui/x-charts/LineChart';
import {
  formatEuros,
  type Mortgage,
  yearlyBalance,
} from '../../../utils/mortgage';

type MortgageChartProps = {
  mortgage: Mortgage;
};

export function MortgageChart(props: MortgageChartProps) {
  const {mortgage} = props;
  const theme = useTheme();
  const points = yearlyBalance(mortgage);

  return (
    <LineChart
      height={180}
      xAxis={[
        {
          data: points.map(point => point.date),
          scaleType: 'time',
          valueFormatter: (date: Date) => String(date.getFullYear()),
        },
      ]}
      yAxis={[
        {
          width: 56,
          min: 0,
          max: mortgage.principal,
          valueFormatter: (value: number) => `${Math.round(value / 1000)} k€`,
        },
      ]}
      series={[
        {
          data: points.map(point => point.remaining),
          area: true,
          showMark: false,
          color: theme.palette.primary.main,
          valueFormatter: value => formatEuros(value ?? 0),
        },
      ]}
      sx={{[`& .${lineClasses.area}`]: {fillOpacity: 0.25}}}
    />
  );
}
