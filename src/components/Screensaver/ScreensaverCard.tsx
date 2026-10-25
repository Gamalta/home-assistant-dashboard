import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type {ReactNode} from 'react';

type ScreensaverCardProps = {
  icon: ReactNode;
  title: string;
  children: ReactNode;
};

export function ScreensaverCard(props: ScreensaverCardProps) {
  const {icon, title, children} = props;

  return (
    <Stack
      spacing={1.5}
      sx={{
        p: 2.5,
        minWidth: 260,
        borderRadius: 2,
        bgcolor: 'rgba(8, 14, 32, 0.35)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{alignItems: 'center', color: 'text.secondary'}}
      >
        {icon}
        <Typography variant="subtitle2" component="span">
          {title}
        </Typography>
      </Stack>
      {children}
    </Stack>
  );
}
