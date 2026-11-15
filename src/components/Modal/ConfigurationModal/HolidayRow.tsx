import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {HolidayMode, useAppContext} from '../../../contexts/AppContext';

const MODES: {value: HolidayMode; label: string}[] = [
  {value: 'auto', label: 'Du 1er déc. au 6 janv.'},
  {value: 'on', label: 'Toujours'},
  {value: 'off', label: 'Jamais'},
];

export function HolidayRow() {
  const {configuration, setConfiguration} = useAppContext();

  return (
    <Stack
      direction="row"
      sx={{justifyContent: 'space-between', alignItems: 'center'}}
    >
      <Typography id="holiday-label">Mode fêtes</Typography>
      <Select
        size="small"
        labelId="holiday-label"
        value={configuration.holidayMode}
        onChange={event =>
          setConfiguration(prev => ({
            ...prev,
            holidayMode: event.target.value,
          }))
        }
      >
        {MODES.map(mode => (
          <MenuItem key={mode.value} value={mode.value}>
            {mode.label}
          </MenuItem>
        ))}
      </Select>
    </Stack>
  );
}
