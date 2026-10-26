import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {formatEuros, type Loan, yearlyCosts} from '../../../utils/mortgage';
import {Chart} from '../../Charts/Chart';
import {MortgageLegend} from './MortgageLegend';

type MortgageCostChartProps = {
  loans: Loan[];
};

export function MortgageCostChart(props: MortgageCostChartProps) {
  const {loans} = props;
  const years = yearlyCosts(loans);
  const series = [
    {
      id: 'principal',
      label: 'Capital',
      color: 'primary',
      data: years.map(year => year.principal),
    },
    {
      id: 'interest',
      label: 'Intérêts',
      color: 'error',
      data: years.map(year => year.interest),
    },
    {
      id: 'insurance',
      label: 'Assurance',
      color: 'info',
      data: years.map(year => year.insurance),
    },
  ];
  const total = (values: number[]) =>
    values.reduce((sum, value) => sum + value, 0);
  const interest = total(series[1].data);
  const insurance = total(series[2].data);

  return (
    <Stack spacing={1}>
      <Chart
        bars
        x={years.map(year => new Date(year.year, 0, 1).getTime())}
        formatX={time => String(new Date(time).getFullYear())}
        series={series.map(item => ({...item, format: formatEuros}))}
        sx={{height: 200, width: 564}}
      >
        <Stack>
          <Typography variant="h4">
            {formatEuros(interest + insurance)}
          </Typography>
          <Typography color="textSecondary">
            Coût du crédit : {formatEuros(interest)} d'intérêts et{' '}
            {formatEuros(insurance)} d'assurance
          </Typography>
        </Stack>
      </Chart>
      <MortgageLegend items={series} />
    </Stack>
  );
}
