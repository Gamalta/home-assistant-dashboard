import Stack from '@mui/material/Stack';
import {useHouseContext} from '../../contexts/HouseContext';
import {Room} from './Room';
import {useEffect, useState} from 'react';
import Alert from '@mui/material/Alert';
import {CircularProgress} from '@mui/material';

export function House() {
  const {config} = useHouseContext();
  const houseConfig = config?.house;
  const [nightOpacity, setNightOpacity] = useState(0);
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const updateOpacity = () => {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 8) {
        setNightOpacity(1 - (hour - 6) / 2);
      } else if (hour >= 8 && hour < 16) {
        setNightOpacity(0);
      } else if (hour >= 16 && hour < 18) {
        setNightOpacity((hour - 16) / 2);
      } else if (hour >= 18 || hour < 6) {
        setNightOpacity(1);
      }
    };

    updateOpacity();
    const interval = setInterval(updateOpacity, 60000);

    return () => clearInterval(interval);
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!houseConfig) {
    if (showLoading) {
      return (
        <Stack height="100%" justifyContent="center" alignItems="center">
          <CircularProgress />
        </Stack>
      );
    } else {
      return (
        <Stack height="100%" justifyContent="center" alignItems="center">
          <Alert severity="error" variant="filled">
            Impossible de charger la configuration.
          </Alert>
        </Stack>
      );
    }
  }

  return (
    <Stack
      position="relative"
      height="100vh"
      width="100%"
      overflow="hidden"
      sx={{
        '& img': {
          transition: 'opacity 3s',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        },
      }}
    >
      <img src={houseConfig.day_floor_plan} />
      <img src={houseConfig.night_floor_plan} style={{opacity: nightOpacity}} />
      {houseConfig.rooms.map(room => (
        <Room key={room.id} room={room} />
      ))}
    </Stack>
  );
}
