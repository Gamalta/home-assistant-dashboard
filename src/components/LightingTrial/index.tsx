import CloseIcon from '@mui/icons-material/CloseRounded';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {useAppContext} from '../../contexts/AppContext';
import {SimulatedHourRow} from './SimulatedHourRow';

/**
 * Panneau d'essai de l'éclairage, posé sur la vue 3D pour voir la maison
 * pendant qu'on règle l'heure. Le fermer revient à l'heure réelle.
 */
export function LightingTrial() {
  const {setLightingTrial, setSimulatedHour} = useAppContext();

  return (
    <Paper
      component="section"
      aria-label="Essai de l'éclairage"
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
          <Typography variant="subtitle2">Éclairage selon l'heure</Typography>
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
        <SimulatedHourRow />
      </Stack>
    </Paper>
  );
}
