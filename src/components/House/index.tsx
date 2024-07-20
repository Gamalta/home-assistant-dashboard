import {HouseConfig} from './config';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import {useHouseContext} from '../../contexts/HouseContext';
import {Room} from './Room';

export function House() {
  const config = HouseConfig;
  const {room, setRoom} = useHouseContext();
  return (
    <Stack
      position="relative"
      height="100vh"
      width="100%"
      overflow="hidden"
      sx={{
        '& img': {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        },
      }}
    >
      <img src={config.floor_plan} />
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
