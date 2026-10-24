import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import {Modal, ModalProps} from '..';
import {HouseAlert} from '../../../utils/alerts';

type AlertsModalProps = Omit<ModalProps, 'children'> & {
  alerts: HouseAlert[];
};

export function AlertsModal(props: AlertsModalProps) {
  const {alerts, ...modalProps} = props;

  return (
    <Modal {...modalProps}>
      <Stack spacing={1} sx={{minWidth: 400}}>
        {alerts.map(alert => (
          <Alert
            key={alert.entityId}
            severity={alert.severity === 'critical' ? 'error' : 'warning'}
            variant={alert.severity === 'critical' ? 'filled' : 'standard'}
          >
            {alert.label}
          </Alert>
        ))}
      </Stack>
    </Modal>
  );
}
