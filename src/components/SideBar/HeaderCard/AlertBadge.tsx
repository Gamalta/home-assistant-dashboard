import {useHass} from '@hakit/core';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import {keyframes} from '@mui/material/styles';
import FireIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import WarningIcon from '@mui/icons-material/WarningAmberRounded';
import {motion} from 'framer-motion';
import {useState} from 'react';
import {AlertsConfigType} from '../../../configs/sidebar';
import {getHouseAlerts} from '../../../utils/alerts';
import {AlertsModal} from '../../Modal/AlertsModal';

type AlertBadgeProps = {
  config: AlertsConfigType;
};

export function AlertBadge(props: AlertBadgeProps) {
  const {config} = props;
  const [open, setOpen] = useState(false);
  const entities = useHass(state => state.entities);
  const alerts = getHouseAlerts(entities, config);
  if (alerts.length === 0) return null;

  const critical = alerts[0].severity === 'critical';
  const count = `${alerts.length} alerte${alerts.length > 1 ? 's' : ''}`;

  return (
    <>
      {/* Posée sous la date, sans décaler la date ni la météo. */}
      <Stack
        component={motion.div}
        layoutId="alerts-modal"
        sx={{
          position: 'absolute',
          bottom: theme => theme.spacing(2),
          left: 0,
          right: 0,
          mx: 'auto',
          width: 'fit-content',
        }}
      >
        <Chip
          icon={critical ? <FireIcon /> : <WarningIcon />}
          label={alerts.length}
          color={critical ? 'error' : 'warning'}
          aria-label={count}
          onClick={() => setOpen(true)}
          sx={{
            fontSize: '1.1rem',
            fontWeight: 'bold',
            // Animation de transform seule : le compositeur la gère sans repeindre.
            '& .MuiChip-icon': {
              animation: critical ? `${pulse} 1s ease-in-out infinite` : '',
            },
          }}
        />
      </Stack>
      <AlertsModal
        id="alerts-modal"
        title="Alertes"
        alerts={alerts}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

const pulse = keyframes`
  50% {
    transform: scale(1.3);
  }
`;
