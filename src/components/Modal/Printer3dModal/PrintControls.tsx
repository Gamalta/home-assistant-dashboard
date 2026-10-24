import {useEntity} from '@hakit/core';
import PauseIcon from '@mui/icons-material/PauseRounded';
import PlayArrowIcon from '@mui/icons-material/PlayArrowRounded';
import StopIcon from '@mui/icons-material/StopRounded';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {useState} from 'react';
import type {Printer3dEntityIds} from '../../../utils/entity/printer3d';

type PrintControlsProps = {
  ids: Printer3dEntityIds;
};

const options = {returnNullIfNotFound: true} as const;

export function PrintControls(props: PrintControlsProps) {
  const {ids} = props;
  const status = useEntity(ids.status, options);
  const pause = useEntity(ids.pause, options);
  const resume = useEntity(ids.resume, options);
  const stop = useEntity(ids.stop, options);
  const [confirmStop, setConfirmStop] = useState(false);

  const running = status?.state === 'running';
  if (!running && status?.state !== 'pause') return null;

  // Un arrêt ne se reprend pas : on le confirme.
  if (confirmStop)
    return (
      <Stack spacing={1}>
        <Typography>Arrêter l'impression ?</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            sx={{flex: 1}}
            onClick={() => setConfirmStop(false)}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            color="error"
            sx={{flex: 1}}
            onClick={() => {
              stop?.service.press();
              setConfirmStop(false);
            }}
          >
            Oui, arrêter
          </Button>
        </Stack>
      </Stack>
    );

  return (
    <Stack direction="row" spacing={1}>
      {running ? (
        <Button
          variant="contained"
          startIcon={<PauseIcon />}
          sx={{flex: 1}}
          onClick={() => pause?.service.press()}
        >
          Pause
        </Button>
      ) : (
        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          sx={{flex: 1}}
          onClick={() => resume?.service.press()}
        >
          Reprendre
        </Button>
      )}
      <Button
        variant="outlined"
        color="error"
        startIcon={<StopIcon />}
        sx={{flex: 1}}
        onClick={() => setConfirmStop(true)}
      >
        Arrêter
      </Button>
    </Stack>
  );
}
