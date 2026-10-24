import {useProgress} from '@react-three/drei';
import {CircularProgress, Typography, Stack} from '@mui/material';

export function ModelLoader() {
  const {progress} = useProgress();
  // Une fois les fichiers téléchargés, il reste à compiler les shaders.
  const downloading = progress < 100;
  return (
    <Stack
      spacing={1}
      sx={{height: '100%', justifyContent: 'center', alignItems: 'center'}}
    >
      <CircularProgress
        aria-label="Chargement de la vue 3D"
        variant={downloading ? 'determinate' : 'indeterminate'}
        value={progress}
      />
      {downloading && (
        <Typography variant="caption">{Math.round(progress)} %</Typography>
      )}
    </Stack>
  );
}
