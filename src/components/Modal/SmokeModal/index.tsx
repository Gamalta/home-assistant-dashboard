import {useEntity} from '@hakit/core';
import CampaignIcon from '@mui/icons-material/CampaignRounded';
import ScheduleIcon from '@mui/icons-material/ScheduleRounded';
import ShieldIcon from '@mui/icons-material/ShieldRounded';
import ThermostatIcon from '@mui/icons-material/ThermostatRounded';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {Modal, ModalProps} from '..';
import {SmokeConfigType} from '../../../configs/house';
import {useSmokeDetector} from '../../../hooks/useSmokeDetector';
import {batteryLevel, isBatteryLow} from '../../../utils/entity/battery';
import {SMOKE_STATUSES} from '../../../utils/entity/smoke';
import {BatteryIcon} from '../../Icons/BatteryIcon';
import {SmokeDetectorView} from './SmokeDetectorView';
import {SmokeInfoRow} from './SmokeInfoRow';

type SmokeModalProps = Omit<ModalProps, 'children'> & {
  smokeConfig: SmokeConfigType;
};

const STATUS_COLORS = {
  smoke: 'error.main',
  heat: 'error.main',
  unavailable: 'text.disabled',
  warning: undefined,
  ok: undefined,
};

export function SmokeModal(props: SmokeModalProps) {
  const {smokeConfig, ...modalProps} = props;
  const {status, smoke, heat, battery, batteryLow, tamper} =
    useSmokeDetector(smokeConfig);
  const test = useEntity(smokeConfig.testEntityId ?? 'unknown', {
    returnNullIfNotFound: true,
  });

  const level = batteryLevel(battery?.state);
  const lowBattery = batteryLow?.state === 'on' || isBatteryLow(level);
  // L'entité la plus récente dit quand le détecteur a donné signe de vie.
  const latest = [smoke, heat, battery, batteryLow, tamper]
    .filter(entity => entity !== null)
    .sort((a, b) => b.last_updated.localeCompare(a.last_updated))[0];

  return (
    <Modal {...modalProps}>
      <Stack
        direction={{xs: 'column', sm: 'row'}}
        spacing={3}
        sx={{alignItems: 'center'}}
      >
        <SmokeDetectorView status={status} />
        <Stack spacing={1.5} sx={{width: {xs: '100%', sm: 300}}}>
          <Typography variant="h4" sx={{color: STATUS_COLORS[status]}}>
            {SMOKE_STATUSES[status].label}
          </Typography>
          <Divider />
          {(battery || batteryLow) && (
            <SmokeInfoRow
              icon={<BatteryIcon level={level} />}
              label="Pile"
              color={lowBattery ? 'warning.main' : undefined}
            >
              {level !== null
                ? `${level}%`
                : lowBattery
                  ? 'Faible'
                  : battery
                    ? '--'
                    : 'Bonne'}
            </SmokeInfoRow>
          )}
          {heat && (
            <SmokeInfoRow
              icon={<ThermostatIcon />}
              label="Chaleur"
              color={heat.state === 'on' ? 'error.main' : undefined}
            >
              {heat.state === 'on' ? 'Élevée' : 'Normale'}
            </SmokeInfoRow>
          )}
          {tamper && (
            <SmokeInfoRow
              icon={<ShieldIcon />}
              label="Autoprotection"
              color={tamper.state === 'on' ? 'warning.main' : undefined}
            >
              {tamper.state === 'on' ? 'Déclenchée' : 'OK'}
            </SmokeInfoRow>
          )}
          {latest && (
            <SmokeInfoRow icon={<ScheduleIcon />} label="Mis à jour">
              {latest.custom.relativeTime}
            </SmokeInfoRow>
          )}
          {test && (
            <Button
              variant="outlined"
              startIcon={<CampaignIcon />}
              onClick={() => test.service.press()}
            >
              Tester
            </Button>
          )}
        </Stack>
      </Stack>
    </Modal>
  );
}
