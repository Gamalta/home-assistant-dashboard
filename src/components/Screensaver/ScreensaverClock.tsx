import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {useEffect, useState} from 'react';

export function ScreensaverClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Stack sx={{alignItems: 'center'}}>
      <Typography
        sx={{
          fontSize: {xs: '6rem', md: '9rem'},
          fontWeight: 200,
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {now.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}
      </Typography>
      <Typography
        variant="h5"
        sx={{opacity: 0.7, '&::first-letter': {textTransform: 'uppercase'}}}
      >
        {now.toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}
      </Typography>
    </Stack>
  );
}
