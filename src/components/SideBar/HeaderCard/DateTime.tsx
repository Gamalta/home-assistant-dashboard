import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {useEffect, useState} from 'react';

export function DateTime() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
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
    <Stack justifyContent="space-between">
      <Typography variant="h4" color="primary">
        {date}
      </Typography>
      <Typography variant="h5" color="text.secondary">
        {time}
      </Typography>
    </Stack>
  );
}
