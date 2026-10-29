import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {formatEuros, type LoansStatus} from '../../../utils/mortgage';

type MortgageFiguresProps = {
  status: LoansStatus;
};

export function MortgageFigures(props: MortgageFiguresProps) {
  const {status} = props;
  const insurance = status.monthlyInsurance;
  const figures = [
    {
      label: 'Mensualité',
      value: formatEuros(status.monthlyPayment),
      detail: insurance ? `+ ${formatEuros(insurance)} d'assurance` : '',
    },
    {
      label: 'Dernière échéance',
      value: status.endDate.toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric',
      }),
      detail: `${status.paymentsMade} / ${status.paymentsTotal} échéances`,
    },
    {label: 'Intérêts payés', value: formatEuros(status.paidInterest)},
    {label: 'Intérêts restants', value: formatEuros(status.remainingInterest)},
  ];

  return (
    <Stack
      spacing={3}
      sx={{width: {xs: '100%', sm: 300}, justifyContent: 'center'}}
    >
      <Stack>
        <Typography color="textSecondary">Capital restant dû</Typography>
        <Typography variant="h3" component="span">
          {formatEuros(status.remainingPrincipal)}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          sur {formatEuros(status.principal)} empruntés
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
