import Typography from '@mui/material/Typography';
import {Html} from './Html';
import {useProgress} from '@react-three/drei';

export function Loader() {
  const {progress} = useProgress();

  return (
    <Html center>
      <Typography variant="h1">{progress} % loaded</Typography>
    </Html>
  );
}
