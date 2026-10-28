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
    // Titre et légende au-dessus du tracé : le survol ne passe pas dessus.
    <Stack spacing={1}>
      <Stack>
        <Typography variant="h4">
          {formatEuros(status.remainingPrincipal)}
        </Typography>
        <Typography color="textSecondary">Capital restant dû</Typography>
      </Stack>
      <MortgageLegend
        items={loans.map((loan, index) => ({
          label: `${loan.label} · ${Math.floor(loansStatus([loan], now).repaidRatio * 100)} %`,
          color: colorOf(index),
        }))}
      />
      <Chart
        x={x}
        min={0}
        max={status.principal}
        formatX={time => String(new Date(time).getFullYear())}
        series={loans.map((loan, index) => ({
          id: `loan-${index}`,
          label: loan.label,
          data: balances[index],
          color: colorOf(index),
          format: formatEuros,
        }))}
        sx={{height: 140, width: {xs: '100%', sm: 564}}}
      />
    </Stack>
  );
}
