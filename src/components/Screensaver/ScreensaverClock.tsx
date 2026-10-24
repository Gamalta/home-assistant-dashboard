import Typography from '@mui/material/Typography';
import {useEffect, useState} from 'react';

export function ScreensaverClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Typography variant="h1" sx={{color: 'grey.600', fontWeight: 300}}>
        {now.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}
      </Typography>
      <Typography variant="h5" sx={{color: 'grey.800'}}>
        {now.toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}
      </Typography>
    </>
  );
}
