import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {useEffect, useState} from 'react';

export function Header() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const date = now.toLocaleDateString('fr-FR', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const time = now.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // TODO: Add an icon for displaying the current weather
  // TODO: Add a display for the outside temperature
  // TODO: Add a display for the house temperature
  return (
    <Stack
      component="header"
      mx={5}
      py={3}
      borderBottom="1px solid"
      sx={{borderBottomColor: 'text.secondary'}}
    >
      <Typography variant="h2" textAlign="center" color="primary">
        {date}
      </Typography>
      <Typography variant="h4" textAlign="center" color="text.secondary">
        {time}
      </Typography>
    </Stack>
  );
}
