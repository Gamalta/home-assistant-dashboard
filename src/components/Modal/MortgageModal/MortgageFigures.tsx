import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  formatEuros,
  type Mortgage,
  type MortgageStatus,
} from '../../../utils/mortgage';

type MortgageFiguresProps = {
  mortgage: Mortgage;
  status: MortgageStatus;
};

export function MortgageFigures(props: MortgageFiguresProps) {
  const {mortgage, status} = props;
  const insurance = mortgage.monthlyInsurance;
  const figures = [
    {
      label: 'Mensualité',
      value: formatEuros(status.monthlyPayment),
      detail: insurance ? `+ ${formatEuros(insurance)} d'assurance` : '',
    },
    {
      label: 'Fin du prêt',
      value: status.endDate.toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric',
      }),
      detail: `${status.paymentsMade} / ${mortgage.durationMonths} échéances`,
    },
    {label: 'Intérêts payés', value: formatEuros(status.paidInterest)},
    {label: 'Intérêts restants', value: formatEuros(status.remainingInterest)},
  ];

  return (
    <Stack spacing={3} sx={{width: 300, justifyContent: 'center'}}>
      <Stack>
        <Typography color="textSecondary">Capital restant dû</Typography>
        <Typography variant="h3" component="span">
          {formatEuros(status.remainingPrincipal)}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          sur {formatEuros(mortgage.principal)} empruntés
        </Typography>
      </Stack>
      <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2}}>
        {figures.map(figure => (
          <Stack key={figure.label}>
            <Typography variant="body2" color="textSecondary">
              {figure.label}
            </Typography>
            <Typography variant="h5" component="span">
              {figure.value}
            </Typography>
            {figure.detail && (
              <Typography variant="caption" color="textSecondary">
                {figure.detail}
              </Typography>
            )}
          </Stack>
        ))}
      </Box>
    </Stack>
  );
}
