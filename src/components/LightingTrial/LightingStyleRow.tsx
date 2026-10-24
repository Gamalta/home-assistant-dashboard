import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {useAppContext} from '../../contexts/AppContext';
import {
  lightingStyles,
  type LightingStyleId,
} from '../../rendering/lightingStyles';

export function LightingStyleRow() {
  const {configuration, setConfiguration} = useAppContext();

  return (
    <Stack
      direction="row"
      sx={{justifyContent: 'space-between', alignItems: 'center'}}
    >
      <Typography id="lighting-style-label">Ambiance</Typography>
      <Select
        size="small"
        labelId="lighting-style-label"
        value={configuration.lightingStyle}
        onChange={event =>
          setConfiguration(prev => ({
            ...prev,
            lightingStyle: event.target.value as LightingStyleId,
          }))
        }
      >
        {Object.entries(lightingStyles).map(([id, style]) => (
          <MenuItem key={id} value={id}>
            {style.label}
          </MenuItem>
        ))}
      </Select>
    </Stack>
  );
}
