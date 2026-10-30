import {useEntity} from '@hakit/core';
import ElectricMeterIcon from '@mui/icons-material/ElectricMeterRounded';
import HomeIcon from '@mui/icons-material/HomeRounded';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {keyframes} from '@mui/material/styles';
import type {EnergyConfigType} from '../../../configs/sidebar';
import {
  formatCost,
  formatPower,
  formatPrice,
  getFlowDuration,
  getSubscribedPower,
  getTariffPeriod,
  parseState,
  TARIFF_PERIODS,
} from '../../../utils/energy';

const ENTITY_OPTIONS = {returnNullIfNotFound: true} as const;

// Un point de 6 px tous les 16 px : un tour de l'animation avance d'un motif.
const STEP = 16;

type EnergyFlowProps = {
  energyConfig: EnergyConfigType;
};

/** Le courant du Linky à la maison : un fil par période tarifaire, animé dans la période en cours. */
export function EnergyFlow(props: EnergyFlowProps) {
  const {energyConfig} = props;
  const {
    powerEntityId,
    tariffPeriodEntityId,
    subscribedCurrentEntityId,
    prices,
  } = energyConfig;
  const power = useEntity(powerEntityId, ENTITY_OPTIONS);
  const tariffPeriod = useEntity(tariffPeriodEntityId, ENTITY_OPTIONS);
  const subscribedCurrent = useEntity(
    subscribedCurrentEntityId ?? 'unknown',
    ENTITY_OPTIONS,
  );

  const period = getTariffPeriod(tariffPeriod?.state);
  const powerValue = parseState(power?.state);
  const subscribedPower = getSubscribedPower(
    parseState(subscribedCurrent?.state),
  );
  // Les VA du Linky comptent un peu plus que les watts facturés : d'où le « ≈ ».
  const hourlyCost =
    period && powerValue !== null ? (powerValue / 1000) * prices[period] : null;

  return (
    <Stack
      component="section"
      aria-label="Courant"
      direction="row"
      spacing={1.5}
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 1,
        border: theme => `1px solid ${theme.palette.divider}`,
        p: 1.5,
      }}
    >
      <Stack sx={{alignItems: 'center'}}>
        <ElectricMeterIcon color="action" />
        <Typography variant="caption" color="textSecondary">
          Linky
        </Typography>
      </Stack>
      <Stack spacing={1}>
        {(['peak', 'offPeak'] as const).map(tariff => (
          <Stack
            key={tariff}
            aria-current={tariff === period}
            spacing={0.5}
            sx={{opacity: tariff === period ? 1 : 0.5}}
          >
            <Typography variant="caption" noWrap>
              <Box
                component="span"
                sx={{color: TARIFF_PERIODS[tariff].color, fontWeight: 600}}
              >
                {TARIFF_PERIODS[tariff].short}
              </Box>
              {` ${formatPrice(prices[tariff])}`}
            </Typography>
            <Box
              sx={{
                width: 72,
                height: 4,
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: 'divider',
              }}
            >
              {tariff === period && (
                <Box
                  sx={{
                    width: `calc(100% + ${STEP}px)`,
                    height: '100%',
                    backgroundImage: `repeating-linear-gradient(90deg, ${TARIFF_PERIODS[tariff].color} 0 6px, transparent 6px ${STEP}px)`,
                    animation: powerValue
                      ? `${flow} ${getFlowDuration(powerValue)}s linear infinite`
                      : undefined,
                    '@media (prefers-reduced-motion: reduce)': {
                      animation: 'none',
                    },
                  }}
                />
              )}
            </Box>
          </Stack>
        ))}
      </Stack>
      <Stack spacing={0.5} sx={{minWidth: 96}}>
        <Stack direction="row" spacing={0.5} sx={{alignItems: 'center'}}>
          <HomeIcon />
          <Typography variant="h6">
            {formatPower(
              powerValue,
              power?.attributes.unit_of_measurement ?? 'VA',
            )}
          </Typography>
        </Stack>
        {subscribedPower !== null && (
          <>
            <LinearProgress
              variant="determinate"
              aria-label="Charge"
              value={Math.min(100, ((powerValue ?? 0) / subscribedPower) * 100)}
            />
            <Typography variant="caption" color="textSecondary">
              {`sur ${formatPower(subscribedPower, 'VA')}`}
            </Typography>
          </>
        )}
        {hourlyCost !== null && (
          <Typography variant="caption">{`≈ ${formatCost(hourlyCost)}/h`}</Typography>
        )}
      </Stack>
    </Stack>
  );
}

// Les points glissent vers la maison, d'un motif par tour : seule la transformation change.
const flow = keyframes`
  from {
    transform: translateX(-${STEP}px);
  }
  to {
    transform: translateX(0);
  }
`;
