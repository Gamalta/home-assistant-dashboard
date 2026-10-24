import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {useAppContext} from '../../contexts/AppContext';

const formatHour = (hour: number) =>
  `${String(Math.floor(hour)).padStart(2, '0')}:${String(Math.round((hour % 1) * 60)).padStart(2, '0')}`;

// Pour essayer les ambiances de jour comme de nuit ; l'heure n'est pas
// mémorisée, la tablette revient à l'heure réelle au rechargement.
export function SimulatedHourRow() {
  const {simulatedHour, setSimulatedHour} = useAppContext();
  const now = new Date();
  const hour = simulatedHour ?? now.getHours() + now.getMinutes() / 60;

  return (
    <Stack spacing={0.5} sx={{pb: 2.5}}>
      <Stack
        direction="row"
        sx={{justifyContent: 'space-between', alignItems: 'center'}}
      >
        <Typography id="simulated-hour-label">
          Heure {simulatedHour === null ? 'réelle' : formatHour(simulatedHour)}
        </Typography>
        <Button
          size="small"
          disabled={simulatedHour === null}
          onClick={() => setSimulatedHour(null)}
        >
          Réelle
        </Button>
      </Stack>
      <Slider
        aria-labelledby="simulated-hour-label"
        min={0}
        max={24}
        step={0.25}
        marks={[6, 12, 18].map(value => ({value, label: `${value} h`}))}
        value={hour}
        getAriaValueText={formatHour}
        onChange={(_, value) => setSimulatedHour(value as number)}
      />
    </Stack>
  );
}
