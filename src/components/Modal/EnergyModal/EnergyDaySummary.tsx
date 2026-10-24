import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  type DayConsumption,
  formatCost,
  formatEnergy,
  getCost,
  type TariffPeriod,
  TARIFF_PERIODS,
} from '../../../utils/energy';

type EnergyDaySummaryProps = {
  title: string;
  day: DayConsumption;
  prices: Record<TariffPeriod, number>;
};

export function EnergyDaySummary(props: EnergyDaySummaryProps) {
  const {title, day, prices} = props;

  return (
    <Stack
      component="section"
      aria-label={title}
      sx={{flex: 1, p: 1.5, borderRadius: 1, bgcolor: 'background.tertiary'}}
    >
      <Typography variant="subtitle2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h5">{formatCost(getCost(day, prices))}</Typography>
      {(['peak', 'offPeak'] as const).map(period => (
        <Typography key={period} variant="body2">
          <Box
            component="span"
            aria-hidden
            sx={{color: TARIFF_PERIODS[period].color}}
          >
            ●{' '}
          </Box>
          {`${TARIFF_PERIODS[period].label} : ${formatEnergy(day[period])}`}
        </Typography>
      ))}
    </Stack>
  );
}
