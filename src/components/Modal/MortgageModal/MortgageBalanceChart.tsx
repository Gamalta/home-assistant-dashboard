import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type {MortgageConfigType} from '../../../configs/sidebar';
import {
  formatEuros,
  mortgageStatus,
  type MortgagesStatus,
  yearlyBalances,
} from '../../../utils/mortgage';
import {Chart} from '../../Charts/Chart';
import {MortgageLegend} from './MortgageLegend';

const COLORS = ['primary', 'info', 'success', 'error', 'warning'];

type MortgageBalanceChartProps = {
  mortgages: MortgageConfigType[];
  status: MortgagesStatus;
};

export function MortgageBalanceChart(props: MortgageBalanceChartProps) {
  const {mortgages, status} = props;
  const {x, balances} = yearlyBalances(mortgages);
  const now = new Date();
  const colorOf = (index: number) => COLORS[index % COLORS.length];

  return (
    <Stack spacing={1}>
      <Chart
        x={x}
        min={0}
        formatX={time => String(new Date(time).getFullYear())}
        series={mortgages.map((mortgage, index) => ({
          id: `mortgage-${index}`,
          label: mortgage.label,
          data: balances[index],
          color: colorOf(index),
          format: formatEuros,
        }))}
        sx={{height: 200, width: 564}}
      >
        <Stack>
          <Typography variant="h4">
            {formatEuros(status.remainingPrincipal)}
          </Typography>
          <Typography color="textSecondary">Capital restant dû</Typography>
        </Stack>
      </Chart>
      <MortgageLegend
        items={mortgages.map((mortgage, index) => ({
          label: `${mortgage.label} · ${Math.floor(mortgageStatus(mortgage, now).repaidRatio * 100)} %`,
          color: colorOf(index),
        }))}
      />
    </Stack>
  );
}
