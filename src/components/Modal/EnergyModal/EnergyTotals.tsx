import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {Fragment} from 'react';
import {
  type Consumption,
  formatCost,
  formatEnergy,
  formatPrice,
  getCosts,
  getPrices,
  getTotal,
  type Period,
  sumConsumption,
  type Tariff,
  TARIFF_PERIODS,
} from '../../../utils/energy';

type EnergyTotalsProps = {
  /** Jours ou mois de la période, pour ses prix avant même le chargement. */
  buckets: Period[];
  current: Consumption[] | null;
  reference: Consumption[] | null;
  comparisonLabel: string;
  tariff: Tariff;
};

export function EnergyTotals(props: EnergyTotalsProps) {
  const {buckets, current, reference, comparisonLabel, tariff} = props;
  const total = sumConsumption(current ?? []);
  const referenceTotal = sumConsumption(reference ?? []);
  const costs = getCosts(current ?? [], tariff);
  const prices = buckets.map(bucket => getPrices(tariff, bucket.start));
  const rows = [
    ...(['peak', 'offPeak'] as const).map(period => ({
      label: TARIFF_PERIODS[period].label,
      color: TARIFF_PERIODS[period].color,
      price: formatPrice(...prices.map(price => price[period])),
      kWh: total[period],
      cost: costs[period],
    })),
    {
      label: comparisonLabel,
      color: null,
      price: null,
      kWh: getTotal(referenceTotal),
      cost: getTotal(getCosts(reference ?? [], tariff)),
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
                {row.price}
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
