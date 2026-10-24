import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  formatEuros,
  type Mortgage,
  type MortgageStatus,
  yearlyBalance,
} from '../../../utils/mortgage';
import {Chart} from '../../Charts/Chart';

type MortgageChartProps = {
  mortgage: Mortgage;
  status: MortgageStatus;
};

export function MortgageChart(props: MortgageChartProps) {
  const {mortgage, status} = props;
  const points = yearlyBalance(mortgage);
  const balance = points.map(point => point.remaining);
  // Les années écoulées et la projection se rejoignent au dernier anniversaire du prêt.
  const last = Math.floor(status.paymentsMade / 12);

  return (
    <Chart
      bleed
      x={points.map(point => point.date.getTime())}
      min={0}
      formatX={time => String(new Date(time).getFullYear())}
      series={[
        {
          id: 'balance',
          label: 'Capital restant dû',
          data: balance.map((value, i) => (i <= last ? value : null)),
          format: formatEuros,
        },
        {
          id: 'projection',
          label: 'Projection',
          data: balance.map((value, i) => (i >= last ? value : null)),
          variant: 'comparison',
          format: formatEuros,
        },
      ]}
      sx={{height: 300, width: 564}}
    >
      <Stack>
        <Typography variant="h4">
          {formatEuros(status.remainingPrincipal)}
        </Typography>
        <Typography color="textSecondary">Capital restant dû</Typography>
      </Stack>
    </Chart>
  );
}
