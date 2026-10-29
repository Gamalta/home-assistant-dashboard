import {useHass} from '@hakit/core';
import FireIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import WarningIcon from '@mui/icons-material/WarningAmberRounded';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type {AlertsConfigType} from '../../configs/sidebar';
import {getHouseAlerts} from '../../utils/alerts';
import {ScreensaverCard} from './ScreensaverCard';

type ScreensaverAlertsProps = {
  alerts: AlertsConfigType;
};

export function ScreensaverAlerts(props: ScreensaverAlertsProps) {
  const {alerts: config} = props;
  const entities = useHass(state => state.entities);
  const alerts = getHouseAlerts(entities, config);
  if (alerts.length === 0) return null;

  return (
    <ScreensaverCard
      icon={<WarningIcon />}
      title={`${alerts.length} alerte${alerts.length > 1 ? 's' : ''}`}
    >
      {alerts.map(alert => {
        const critical = alert.severity === 'critical';
        return (
          <Stack
            key={alert.entityId}
            direction="row"
            spacing={1}
            sx={{alignItems: 'center'}}
          >
            {critical ? (
              <FireIcon color="error" />
            ) : (
              <WarningIcon color="warning" />
            )}
            <Typography sx={{color: critical ? 'error.light' : undefined}}>
              {alert.label}
            </Typography>
          </Stack>
        );
      })}
    </ScreensaverCard>
  );
}
