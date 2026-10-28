import TrendingDownIcon from '@mui/icons-material/TrendingDownRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUpRounded';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {useIsMobile} from '../../../hooks/useIsMobile';
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
  const mobile = useIsMobile();
  const total = current && sumConsumption(current);
  const change = current && reference && getChange(current, reference, now);
  const ongoing = !!current && now < current[current.length - 1].end;
  const referenceData =
    current?.map((_, i) => (reference?.[i] ? getTotal(reference[i]) : null)) ??
    [];
  // Rien n'est posé sur le tracé : la plus haute barre en prend toute la hauteur.
  const max = Math.max(
    0,
    ...(current ?? []).map(
      bucket => (bucket.peak ?? 0) + (bucket.offPeak ?? 0),
    ),
    ...referenceData.map(value => value ?? 0),
  );

  return (
    // Total et écart au-dessus du tracé : le survol ne passe pas dessus.
    <Stack spacing={2} sx={{width: {xs: '100%', sm: 560}}}>
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
              color: change < 0 ? 'success.main' : 'primary.main',
            }}
          >
            {change < 0 ? <TrendingDownIcon /> : <TrendingUpIcon />}
            <Typography>
              {`${formatChange(change)} par rapport à ${scale === 'week' ? 'la ' : ''}${formatPeriod(scale, referencePeriod)}${ongoing ? ', à date égale' : ''}`}
            </Typography>
          </Stack>
        )}
      </Stack>
      <Chart
        // Sur téléphone, les réglages suivent le graphique : il ne touche pas le bord.
        bleed={!mobile}
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
            data: referenceData,
            variant: 'comparison' as const,
            format: formatEnergy,
          },
        ]}
        max={max || undefined}
        sx={{flex: 1, minHeight: 280}}
      />
    </Stack>
  );
}
