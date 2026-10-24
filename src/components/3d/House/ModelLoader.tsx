import {useProgress} from '@react-three/drei';
import {CircularProgress, Typography, Stack} from '@mui/material';

export function ModelLoader() {
  const {progress} = useProgress();
  return (
    <Stack
      spacing={1}
      sx={{height: '100%', justifyContent: 'center', alignItems: 'center'}}
    >
      <CircularProgress
        variant={progress === undefined ? 'indeterminate' : 'determinate'}
        value={progress}
      />
      {progress !== undefined && (
        <Typography variant="caption">{Math.round(progress)} %</Typography>
      )}
    </Stack>
  );
}
