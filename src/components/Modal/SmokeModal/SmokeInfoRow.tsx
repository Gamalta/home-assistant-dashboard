import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type {ReactNode} from 'react';

type SmokeInfoRowProps = {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  color?: string;
};

export function SmokeInfoRow(props: SmokeInfoRowProps) {
  const {icon, label, children, color} = props;

  return (
    <Stack direction="row" spacing={1} sx={{alignItems: 'center'}}>
      <Stack sx={{color: 'text.secondary'}}>{icon}</Stack>
      <Typography sx={{flex: 1}}>{label}</Typography>
      <Typography component="div" sx={{color}}>
        {children}
      </Typography>
    </Stack>
  );
}
