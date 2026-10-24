import {useEntity} from '@hakit/core';
import BoltIcon from '@mui/icons-material/BoltRounded';
import Typography from '@mui/material/Typography';
import {useState} from 'react';
import type {EnergyShortcutConfigType} from '../../../configs/sidebar';
import {
  formatPower,
  getTariffPeriod,
  parseState,
  TARIFF_PERIODS,
} from '../../../utils/energy';
import {EnergyModal} from '../../Modal/EnergyModal';
import {ShortcutCard} from './ShortcutCard';

type EnergyShortcutProps = {
  id: string;
  shortcutConfig: EnergyShortcutConfigType;
};

export function EnergyShortcut(props: EnergyShortcutProps) {
  const {id, shortcutConfig} = props;
  const [open, setOpen] = useState(false);
  const power = useEntity(shortcutConfig.powerEntityId, {
    returnNullIfNotFound: true,
  });
  const tariffPeriod = useEntity(shortcutConfig.tariffPeriodEntityId, {
    returnNullIfNotFound: true,
  });
  const period = getTariffPeriod(tariffPeriod?.state);
  const powerLabel = formatPower(
    parseState(power?.state),
    power?.attributes.unit_of_measurement ?? 'VA',
  );

  return (
    <>
      <ShortcutCard
        id={id}
        icon={<BoltIcon sx={{color: period && TARIFF_PERIODS[period].color}} />}
        label="Énergie"
        onClick={() => setOpen(true)}
      >
        <Typography component="span">
          {period
            ? `${powerLabel} · ${TARIFF_PERIODS[period].short}`
            : powerLabel}
        </Typography>
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
