import {useEntity} from '@hakit/core';
import BoltIcon from '@mui/icons-material/BoltRounded';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {useState} from 'react';
import type {EnergyShortcutConfigType} from '../../../configs/sidebar';
import {useEnergyConsumption} from '../../../hooks/useEnergyConsumption';
import {
  dayStart,
  formatCost,
  formatPower,
  getCost,
  getTariffPeriod,
  parseState,
  TARIFF_PERIODS,
} from '../../../utils/energy';
import {EnergyModal} from '../../Modal/EnergyModal';
import {ShortcutCard} from './ShortcutCard';

const ENTITY_OPTIONS = {returnNullIfNotFound: true} as const;

type EnergyShortcutProps = {
  id: string;
  shortcutConfig: EnergyShortcutConfigType;
};

export function EnergyShortcut(props: EnergyShortcutProps) {
  const {id, shortcutConfig} = props;
  const {
    powerEntityId,
    tariffPeriodEntityId,
    peakIndexEntityId,
    offPeakIndexEntityId,
    prices,
  } = shortcutConfig;
  const [open, setOpen] = useState(false);
  const power = useEntity(powerEntityId, ENTITY_OPTIONS);
  const tariffPeriod = useEntity(tariffPeriodEntityId, ENTITY_OPTIONS);
  const now = new Date();
  const [today] =
    useEnergyConsumption(
      peakIndexEntityId,
      offPeakIndexEntityId,
      [{start: dayStart(now), end: dayStart(now, 1)}],
      'day',
      now.getTime(),
    ) ?? [];
  const period = getTariffPeriod(tariffPeriod?.state);

  return (
    <>
      <ShortcutCard
        id={id}
        icon={<BoltIcon sx={{color: period && TARIFF_PERIODS[period].color}} />}
        label="Énergie"
        onClick={() => setOpen(true)}
      >
        <Stack spacing={0.5}>
          <Stack direction="row" spacing={1} sx={{alignItems: 'baseline'}}>
            <Typography variant="h4" component="span">
              {formatPower(
                parseState(power?.state),
                power?.attributes.unit_of_measurement ?? 'VA',
              )}
            </Typography>
            {period && (
              <Typography
                variant="subtitle2"
                component="span"
                sx={{color: TARIFF_PERIODS[period].color}}
              >
                {TARIFF_PERIODS[period].label}
              </Typography>
            )}
          </Stack>
          <Typography component="span">
            {`Aujourd’hui : ${formatCost(today ? getCost(today, prices) : null)}`}
          </Typography>
        </Stack>
      </ShortcutCard>
      <EnergyModal
        id={id}
        open={open}
        onClose={() => setOpen(false)}
        title="Énergie"
        shortcutConfig={shortcutConfig}
      />
    </>
  );
}
