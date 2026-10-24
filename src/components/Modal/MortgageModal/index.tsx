import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {Modal, ModalProps} from '..';
import {
  formatEuros,
  type Mortgage,
  type mortgageStatus,
} from '../../../utils/mortgage';
import {InfoRow} from '../SystemModal/InfoRow';
import {MortgageChart} from './MortgageChart';

type MortgageModalProps = Omit<ModalProps, 'children'> & {
  mortgage: Mortgage;
  status: ReturnType<typeof mortgageStatus>;
};

export function MortgageModal(props: MortgageModalProps) {
  const {mortgage, status, ...modalProps} = props;
  const repaid = Math.floor(status.repaidRatio * 100);
  const insurance = mortgage.monthlyInsurance;

  return (
    <Modal {...modalProps}>
      <Stack spacing={2} sx={{width: 420, maxWidth: '100%'}}>
        <Stack spacing={1}>
          <Stack direction="row" sx={{justifyContent: 'space-between'}}>
            <Typography variant="h4">
              {formatEuros(status.remainingPrincipal)}
            </Typography>
            <Typography color="text.secondary">{repaid} % remboursé</Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Capital restant dû sur {formatEuros(mortgage.principal)}
          </Typography>
          <LinearProgress variant="determinate" value={repaid} />
        </Stack>
        <MortgageChart mortgage={mortgage} />
        <Stack spacing={1}>
          <InfoRow
            label="Mensualité"
            value={
              formatEuros(status.monthlyPayment) +
              (insurance ? ` + ${formatEuros(insurance)} d'assurance` : '')
            }
          />
          <InfoRow
            label="Échéances payées"
            value={`${status.paymentsMade} / ${mortgage.durationMonths}`}
          />
          <InfoRow
            label="Intérêts payés"
            value={formatEuros(status.paidInterest)}
          />
          <InfoRow
            label="Intérêts restants"
            value={formatEuros(status.remainingInterest)}
          />
          <InfoRow
            label="Fin du prêt"
            value={status.endDate.toLocaleDateString('fr-FR', {
              month: 'long',
              year: 'numeric',
            })}
          />
        </Stack>
      </Stack>
    </Modal>
  );
}
