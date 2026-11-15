import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {useAppContext} from '../../../contexts/AppContext';
import {
  HEATMAP_SCALES,
  type HeatmapScale,
} from '../../../rendering/shaders/HeatmapGroundMaterial/common';

const LABELS: Record<HeatmapScale, string> = {
  contrasted: 'Contrastée',
  balanced: 'Équilibrée',
  soft: 'Douce',
};

export function HeatmapScaleRow(props: {disabled: boolean}) {
  const {configuration, setConfiguration} = useAppContext();

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{justifyContent: 'space-between', alignItems: 'center'}}
    >
      <Typography
        id="heatmap-scale-label"
        color={props.disabled ? 'textDisabled' : undefined}
      >
        Échelle des températures
      </Typography>
      <Select
        size="small"
        labelId="heatmap-scale-label"
        disabled={props.disabled}
        value={configuration.heatmapScale}
        onChange={event =>
          setConfiguration(prev => ({
            ...prev,
            heatmapScale: event.target.value as HeatmapScale,
          }))
        }
      >
        {(Object.keys(HEATMAP_SCALES) as HeatmapScale[]).map(scale => (
          <MenuItem key={scale} value={scale}>
            {`${LABELS[scale]} (${HEATMAP_SCALES[scale]} °C)`}
          </MenuItem>
        ))}
      </Select>
    </Stack>
  );
}
