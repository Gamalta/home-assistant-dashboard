import {useEntity} from '@hakit/core';
import BoltIcon from '@mui/icons-material/BoltRounded';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type {EnergyShortcutConfigType} from '../../../configs/sidebar';
import {
  formatPower,
  getSubscribedPower,
  getTariffPeriod,
  parseState,
  TARIFF_PERIODS,
} from '../../../utils/energy';

const ENTITY_OPTIONS = {returnNullIfNotFound: true} as const;

type EnergyLoadProps = {
  shortcutConfig: EnergyShortcutConfigType;
};

/** Puissance instantanée, dans la couleur de la période tarifaire, et charge par rapport à la puissance souscrite. */
export function EnergyLoad(props: EnergyLoadProps) {
  const {shortcutConfig} = props;
  const {powerEntityId, tariffPeriodEntityId, subscribedCurrentEntityId} =
    shortcutConfig;
  const power = useEntity(powerEntityId, ENTITY_OPTIONS);
  const tariffPeriod = useEntity(tariffPeriodEntityId, ENTITY_OPTIONS);
  const subscribedCurrent = useEntity(
    subscribedCurrentEntityId ?? 'unknown',
    ENTITY_OPTIONS,
  );

  const period = getTariffPeriod(tariffPeriod?.state);
  const powerValue = parseState(power?.state);
  const powerLabel = formatPower(
    powerValue,
    power?.attributes.unit_of_measurement ?? 'VA',
  );
  const subscribedPower = getSubscribedPower(
    parseState(subscribedCurrent?.state),
  );

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        alignItems: 'center',
        borderRadius: 1,
        border: theme => `1px solid ${theme.palette.divider}`,
        px: 1.5,
        py: 0.5,
      }}
    >
      <BoltIcon sx={{color: period && TARIFF_PERIODS[period].color}} />
      {subscribedPower === null ? (
        <Typography>{powerLabel}</Typography>
      ) : (
        <>
          <Typography>{`${powerLabel} sur ${formatPower(subscribedPower, 'VA')}`}</Typography>
          <LinearProgress
            variant="determinate"
            aria-label="Charge"
            value={Math.min(100, ((powerValue ?? 0) / subscribedPower) * 100)}
            sx={{width: 64}}
          />
        </>
      )}
    </Stack>
  );
}
