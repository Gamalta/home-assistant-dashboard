import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  formatEuros,
  type Loan,
  loansStatus,
  type LoansStatus,
  yearlyBalances,
} from '../../../utils/mortgage';
import {Chart} from '../../Charts/Chart';
import {MortgageLegend} from './MortgageLegend';

const COLORS = ['primary', 'info', 'success', 'error', 'warning'];

type MortgageBalanceChartProps = {
  loans: Loan[];
  status: LoansStatus;
};

export function MortgageBalanceChart(props: MortgageBalanceChartProps) {
  const {loans, status} = props;
  const {x, balances} = yearlyBalances(loans);
  const now = new Date();
  const colorOf = (index: number) => COLORS[index % COLORS.length];

  return (
    <Stack spacing={1}>
      <Chart
        x={x}
        min={0}
        formatX={time => String(new Date(time).getFullYear())}
        series={loans.map((loan, index) => ({
          id: `loan-${index}`,
          label: loan.label,
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
        items={loans.map((loan, index) => ({
          label: `${loan.label} · ${Math.floor(loansStatus([loan], now).repaidRatio * 100)} %`,
          color: colorOf(index),
        }))}
      />
    </Stack>
  );
}
