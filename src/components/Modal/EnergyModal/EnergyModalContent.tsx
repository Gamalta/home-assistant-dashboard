import {useEntity} from '@hakit/core';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type {EnergyShortcutConfigType} from '../../../configs/sidebar';
import {useEnergyStatistics} from '../../../hooks/useEnergyStatistics';
import {
  formatPower,
  getDailyConsumption,
  getSubscribedPower,
  parseState,
  toKWh,
} from '../../../utils/energy';
import {EnergyDaySummary} from './EnergyDaySummary';
import {EnergyHistoryChart} from './EnergyHistoryChart';

const HISTORY_DAYS = 30;
const ENTITY_OPTIONS = {returnNullIfNotFound: true} as const;

type EnergyModalContentProps = {
  shortcutConfig: EnergyShortcutConfigType;
};

export function EnergyModalContent(props: EnergyModalContentProps) {
  const {shortcutConfig} = props;
  const {
    powerEntityId,
    peakIndexEntityId,
    offPeakIndexEntityId,
    subscribedCurrentEntityId,
    prices,
  } = shortcutConfig;
  const power = useEntity(powerEntityId, ENTITY_OPTIONS);
  const peakIndex = useEntity(peakIndexEntityId, ENTITY_OPTIONS);
  const offPeakIndex = useEntity(offPeakIndexEntityId, ENTITY_OPTIONS);
  const subscribedCurrent = useEntity(
    subscribedCurrentEntityId ?? 'unknown',
    ENTITY_OPTIONS,
  );
  const statistics = useEnergyStatistics(
    peakIndexEntityId,
    offPeakIndexEntityId,
    HISTORY_DAYS,
  );

  const days = getDailyConsumption(
    statistics,
    {
      peak: toKWh(peakIndex?.state, peakIndex?.attributes.unit_of_measurement),
      offPeak: toKWh(
        offPeakIndex?.state,
        offPeakIndex?.attributes.unit_of_measurement,
      ),
    },
    HISTORY_DAYS,
    new Date(),
  );
  const powerValue = parseState(power?.state);
  const powerUnit = power?.attributes.unit_of_measurement ?? 'VA';
  const subscribedPower = getSubscribedPower(
    parseState(subscribedCurrent?.state),
  );

  return (
    <Stack spacing={2} sx={{width: 500}}>
      <Stack spacing={1}>
        <Stack direction="row" spacing={2}>
          <EnergyDaySummary
            title="Aujourd’hui"
            day={days[HISTORY_DAYS - 1]}
            prices={prices}
          />
          <EnergyDaySummary
            title="Hier"
            day={days[HISTORY_DAYS - 2]}
            prices={prices}
          />
        </Stack>
        <Typography variant="caption" color="text.secondary">
          Coût estimé aux tarifs configurés, hors abonnement.
        </Typography>
      </Stack>
      {subscribedPower !== null && (
        <Stack spacing={1}>
          <Typography variant="body2">
            {`Charge : ${formatPower(powerValue, powerUnit)} sur ${formatPower(subscribedPower, 'VA')} souscrits`}
          </Typography>
          <LinearProgress
            variant="determinate"
            aria-label="Charge"
            value={Math.min(100, ((powerValue ?? 0) / subscribedPower) * 100)}
          />
        </Stack>
      )}
      <EnergyHistoryChart days={days} />
    </Stack>
  );
}
