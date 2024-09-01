import {HouseConfig} from './config';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import {useHouseContext} from '../../contexts/HouseContext';
import {Room} from './Room';
import {useEffect, useState} from 'react';
import {useThemeMode} from '../../hooks/useThemeMode';
import {useColorScheme} from '@mui/material/styles';

export function House() {
  const config = HouseConfig;
  const {room, setRoom} = useHouseContext();
  const [nightOpacity, setNightOpacity] = useState(0);
  const {mode: customMode} = useThemeMode();
  const {mode: themeMode, setMode} = useColorScheme();

  useEffect(() => {
    const updateOpacity = () => {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 8) {
        setNightOpacity(1 - (hour - 6) / 2);
        if (customMode === 'auto' && themeMode !== 'dark') setMode('dark');
      } else if (hour >= 8 && hour < 16) {
        setNightOpacity(0);
        if (customMode === 'auto' && themeMode !== 'dark') setMode('dark');
      } else if (hour >= 16 && hour < 18) {
        setNightOpacity((hour - 16) / 2);
        if (customMode === 'auto' && themeMode !== 'light') setMode('light');
      } else if (hour >= 18 || hour < 6) {
        setNightOpacity(1);
        if (customMode === 'auto' && themeMode !== 'light') setMode('light');
      }
    };

    updateOpacity();
    const interval = setInterval(updateOpacity, 60000);

    return () => clearInterval(interval);
  }, [customMode, themeMode, setMode]);

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
          objectFit: 'cover',
        },
      }}
    >
      <img src={config.day_floor_plan} />
      <img src={config.night_floor_plan} style={{opacity: nightOpacity}} />
      {config.rooms.map(room => (
        <Room key={room.id} room={room} />
      ))}
      {room && (
        <Button
          onClick={() => setRoom(null)}
          sx={{position: 'absolute', top: 0, left: 0}}
        >
          <ArrowBackRoundedIcon />
        </Button>
      )}
    </Stack>
  );
}
