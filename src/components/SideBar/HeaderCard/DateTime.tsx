import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {useEffect, useState} from 'react';

export function DateTime() {
  const [now, setNow] = useState(new Date());

  // Seules les minutes sont affichées : on se cale sur le changement de minute
  // au lieu de re-rendre chaque seconde.
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const tick = () => {
      const current = new Date();
      setNow(current);
      timeout = setTimeout(tick, 60000 - (current.getTime() % 60000) + 50);
    };
    tick();
    return () => clearTimeout(timeout);
  }, []);

  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  const date = now
    .toLocaleDateString('fr-FR', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })
    .split(' ')
    .map(capitalize)
    .join(' ');

  const time = now.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return (
    <Stack sx={{justifyContent: 'space-between'}}>
      <Typography variant="h4" color="primary">
        {date}
      </Typography>
      <Typography variant="h5" color="text.secondary">
        {time}
      </Typography>
    </Stack>
  );
}
