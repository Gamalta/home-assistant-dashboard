import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {useAppContext} from '../../../contexts/AppContext';

const DELAYS = [0, 1, 5, 10, 30];

export function ScreensaverRow() {
  const {configuration, setConfiguration} = useAppContext();

  return (
    <Stack
      direction="row"
      sx={{justifyContent: 'space-between', alignItems: 'center'}}
    >
      <Typography id="screensaver-label">Veille</Typography>
      <Select
        size="small"
        labelId="screensaver-label"
        value={configuration.screensaverMinutes}
        onChange={event =>
          setConfiguration(prev => ({
            ...prev,
            screensaverMinutes: Number(event.target.value),
          }))
        }
      >
        {DELAYS.map(minutes => (
          <MenuItem key={minutes} value={minutes}>
            {minutes ? `Après ${minutes} min` : 'Jamais'}
          </MenuItem>
        ))}
      </Select>
    </Stack>
  );
}
