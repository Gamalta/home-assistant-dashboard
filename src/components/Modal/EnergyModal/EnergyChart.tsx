import TrendingDownIcon from '@mui/icons-material/TrendingDownRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUpRounded';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  type Consumption,
  formatChange,
  formatCost,
  formatEnergy,
  formatPeriod,
  getChange,
  getCost,
  getTotal,
  type Period,
  type Scale,
  sumConsumption,
  type TariffPeriod,
  TARIFF_PERIODS,
} from '../../../utils/energy';
import {Chart} from '../../Charts/Chart';

type EnergyChartProps = {
  scale: Scale;
  /** Jours ou mois affichés, `null` pendant le chargement. */
  current: Consumption[] | null;
  /** Ceux de la période comparée, alignés par leur rang. */
  reference: Consumption[] | null;
  referencePeriod: Period;
  /** « Mois précédent », « Un an avant ». */
  comparisonLabel: string;
  now: number;
  prices: Record<TariffPeriod, number>;
};

export function EnergyChart(props: EnergyChartProps) {
  const {
    scale,
    current,
    reference,
    referencePeriod,
    comparisonLabel,
    now,
    prices,
  } = props;
  const total = current && sumConsumption(current);
  const change = current && reference && getChange(current, reference, now);
  const ongoing = !!current && now < current[current.length - 1].end;

  return (
    <Chart
      bleed
      bars
      loading={!current}
      x={current?.map(bucket => bucket.start) ?? []}
      formatX={start =>
        new Date(start).toLocaleDateString(
          'fr-FR',
          scale === 'year'
            ? {month: 'long', year: 'numeric'}
            : {weekday: 'long', day: 'numeric', month: 'long'},
        )
      }
      series={[
        ...(['offPeak', 'peak'] as const).map(tariff => ({
          id: tariff,
          label: TARIFF_PERIODS[tariff].label,
          data: current?.map(bucket => bucket[tariff]) ?? [],
          color: TARIFF_PERIODS[tariff].color,
          format: formatEnergy,
        })),
        {
          id: 'reference',
          label: comparisonLabel,
          data:
            current?.map((_, i) =>
              reference?.[i] ? getTotal(reference[i]) : null,
            ) ?? [],
          variant: 'comparison' as const,
          format: formatEnergy,
        },
      ]}
      sx={{width: 560, minHeight: 400}}
    >
      <Stack spacing={0.5}>
        <Typography variant="h3">
          {formatEnergy(total && getTotal(total))}
        </Typography>
        <Typography variant="h6" color="textSecondary">
          {formatCost(total && getCost(total, prices))}
        </Typography>
        {change != null && (
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              alignItems: 'center',
              color: change < 0 ? 'success.main' : 'warning.main',
            }}
          >
            {change < 0 ? <TrendingDownIcon /> : <TrendingUpIcon />}
            <Typography>
              {`${formatChange(change)} par rapport à ${scale === 'week' ? 'la ' : ''}${formatPeriod(scale, referencePeriod)}${ongoing ? ', à date égale' : ''}`}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Chart>
  );
}
