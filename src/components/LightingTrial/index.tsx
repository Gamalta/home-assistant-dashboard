import CloseIcon from '@mui/icons-material/CloseRounded';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {useAppContext} from '../../contexts/AppContext';
import {LightingStyleRow} from './LightingStyleRow';
import {SimulatedHourRow} from './SimulatedHourRow';

/**
 * Panneau d'essai des ambiances, posé sur la vue 3D pour voir la maison
 * pendant qu'on règle. Le fermer revient à l'heure réelle.
 */
export function LightingTrial() {
  const {setLightingTrial, setSimulatedHour} = useAppContext();

  return (
    <Paper
      component="section"
      aria-label="Essai des ambiances"
      elevation={6}
      sx={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 360,
        p: 2,
        pb: 0,
        borderRadius: 2,
      }}
    >
      <Stack spacing={1}>
        <Stack
          direction="row"
          sx={{justifyContent: 'space-between', alignItems: 'center'}}
        >
          <Typography variant="subtitle2">Essai des ambiances</Typography>
          <IconButton
            size="small"
            aria-label="Fermer l'essai"
            onClick={() => {
              setLightingTrial(false);
              setSimulatedHour(null);
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
        <LightingStyleRow />
        <SimulatedHourRow />
      </Stack>
    </Paper>
  );
}
