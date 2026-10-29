import ChevronLeftIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightIcon from '@mui/icons-material/ChevronRightRounded';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import {useState} from 'react';
import type {EnergyConfigType} from '../../../configs/sidebar';
import {useEnergyConsumption} from '../../../hooks/useEnergyConsumption';
import {
  type Comparison,
  formatPeriod,
  getBuckets,
  getComparisonPeriod,
  getPeriod,
  type Scale,
  STATISTICS_PERIOD,
} from '../../../utils/energy';
import {EnergyChart} from './EnergyChart';
import {EnergyFlow} from './EnergyFlow';
import {EnergyTotals} from './EnergyTotals';

const SCALES: Record<Scale, string> = {
  week: 'Semaine',
  month: 'Mois',
  year: 'Année',
};

const PREVIOUS: Record<Scale, string> = {
  week: 'Semaine précédente',
  month: 'Mois précédent',
  year: 'Année précédente',
};

type EnergyModalContentProps = {
  energyConfig: EnergyConfigType;
};

export function EnergyModalContent(props: EnergyModalContentProps) {
  const {energyConfig} = props;
  const {peakIndexEntityId, offPeakIndexEntityId, prices} = energyConfig;
  const [scale, setScale] = useState<Scale>('month');
  const [comparison, setComparison] = useState<Comparison>('previous');
  // 0 pour la période en cours, -1 pour la précédente…
  const [offset, setOffset] = useState(0);

  const now = new Date();
  const unit = STATISTICS_PERIOD[scale];
  const period = getPeriod(scale, now, offset);
  const referencePeriod = getComparisonPeriod(scale, period, comparison);
  const current = useEnergyConsumption(
    peakIndexEntityId,
    offPeakIndexEntityId,
    getBuckets(period, unit),
    unit,
    now.getTime(),
  );
  const reference = useEnergyConsumption(
    peakIndexEntityId,
    offPeakIndexEntityId,
    getBuckets(referencePeriod, unit),
    unit,
    now.getTime(),
  );
  // En année, l'année précédente est aussi celle d'un an avant.
  const shownComparison = scale === 'year' ? 'previous' : comparison;
  const comparisonLabel =
    shownComparison === 'previous' ? PREVIOUS[scale] : 'Un an avant';

  return (
    <Stack direction={{xs: 'column', sm: 'row'}} spacing={{xs: 3, sm: 5}}>
      <EnergyChart
        scale={scale}
        current={current}
        reference={reference}
        referencePeriod={referencePeriod}
        now={now.getTime()}
        comparisonLabel={comparisonLabel}
        prices={prices}
      />
      <Stack spacing={3} sx={{width: {xs: '100%', sm: 300}}}>
        <EnergyFlow energyConfig={energyConfig} />
        <ToggleButtonGroup
          exclusive
          fullWidth
          value={scale}
          onChange={(_, value: Scale | null) => {
            if (!value) return;
            setScale(value);
            setOffset(0);
          }}
        >
          {Object.entries(SCALES).map(([value, label]) => (
            <ToggleButton key={value} value={value}>
              {label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Stack
          direction="row"
          sx={{alignItems: 'center', justifyContent: 'space-between'}}
        >
          <IconButton
            aria-label="Période précédente"
            onClick={() => setOffset(offset - 1)}
          >
            <ChevronLeftIcon />
          </IconButton>
          <Typography
            variant="subtitle1"
            sx={{'&::first-letter': {textTransform: 'uppercase'}}}
          >
            {formatPeriod(scale, period)}
          </Typography>
          <IconButton
            aria-label="Période suivante"
            disabled={offset === 0}
            onClick={() => setOffset(offset + 1)}
          >
            <ChevronRightIcon />
          </IconButton>
        </Stack>
        <Stack spacing={1}>
          <Typography variant="subtitle2" color="textSecondary">
            Comparer à
          </Typography>
          {/* Largeur selon le libellé : « Semaine précédente » ne tient pas dans une moitié. */}
          <ToggleButtonGroup
            exclusive
            value={shownComparison}
            onChange={(_, value: Comparison | null) =>
              value && setComparison(value)
            }
          >
            <ToggleButton value="previous" sx={{flex: 'auto'}}>
              {PREVIOUS[scale]}
            </ToggleButton>
            <ToggleButton
              value="lastYear"
              disabled={scale === 'year'}
              sx={{flex: 'auto'}}
            >
              Un an avant
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <EnergyTotals
          current={current}
          reference={reference}
          comparisonLabel={comparisonLabel}
          prices={prices}
        />
      </Stack>
    </Stack>
  );
}
