import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {Fragment} from 'react';
import {
  type Consumption,
  formatCost,
  formatEnergy,
  formatPrice,
  getCost,
  getTotal,
  sumConsumption,
  type TariffPeriod,
  TARIFF_PERIODS,
} from '../../../utils/energy';

type EnergyTotalsProps = {
  current: Consumption[] | null;
  reference: Consumption[] | null;
  comparisonLabel: string;
  prices: Record<TariffPeriod, number>;
};

export function EnergyTotals(props: EnergyTotalsProps) {
  const {current, reference, comparisonLabel, prices} = props;
  const total = sumConsumption(current ?? []);
  const referenceTotal = sumConsumption(reference ?? []);
  const rows = [
    ...(['peak', 'offPeak'] as const).map(tariff => ({
      label: TARIFF_PERIODS[tariff].label,
      color: TARIFF_PERIODS[tariff].color,
      price: prices[tariff],
      kWh: total[tariff],
      cost: total[tariff] === null ? null : total[tariff] * prices[tariff],
    })),
    {
      label: comparisonLabel,
      color: null,
      price: null,
      kWh: getTotal(referenceTotal),
      cost: getCost(referenceTotal, prices),
    },
  ];

  return (
    <Box
      component="section"
      aria-label="Totaux"
      sx={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto auto',
        alignItems: 'center',
        columnGap: 1.5,
        rowGap: 1,
      }}
    >
      {rows.map(row => (
        <Fragment key={row.label}>
          {/* Un point pour une barre, un tiret pour la comparaison en pointillés. */}
          <Box
            sx={
              row.color
                ? {
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: row.color,
                  }
                : {
                    width: 12,
                    borderTop: 2,
                    borderTopStyle: 'dashed',
                    color: 'text.secondary',
                  }
            }
          />
          <Stack>
            <Typography variant="body2">{row.label}</Typography>
            {row.price !== null && (
              <Typography variant="caption" color="textSecondary">
                {formatPrice(row.price)}
              </Typography>
            )}
          </Stack>
          <Typography variant="body2" sx={{textAlign: 'right'}}>
            {formatEnergy(row.kWh)}
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{textAlign: 'right'}}
          >
            {formatCost(row.cost)}
          </Typography>
        </Fragment>
      ))}
    </Box>
  );
}
