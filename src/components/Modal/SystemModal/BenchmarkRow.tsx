import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import {useState} from 'react';

export function BenchmarkRow() {
  const [results, setResults] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  const run = async () => {
    const benchmark = window.__dashboardBenchmark;
    const motionBenchmark = window.__dashboardMotionBenchmark;
    if (!benchmark || !motionBenchmark) return;
    setRunning(true);
    setResults([]);
    const motion = await motionBenchmark();
    setResults([
      `Rotation réelle (×${motion.pixelRatio}) : ${motion.fps} img/s · ` +
        `pire image ${motion.worstMs} ms`,
    ]);
    const pixelRatios = [undefined, 1, 0.5, 0.25];
    for (const pixelRatio of pixelRatios) {
      const r = await benchmark(60, pixelRatio);
      setResults(prev => [
        ...prev,
        `×${r.pixelRatio} : ${r.msPerFrame} ms (${r.fps} img/s) · ` +
          `CPU ${r.cpuMs} ms · GPU ${r.gpuMs} ms · navigateur ${r.browserFps} img/s`,
      ]);
    }
    setRunning(false);
  };

  return (
    <Stack spacing={0.5}>
      <Button variant="outlined" disabled={running} onClick={run}>
        {running ? 'Mesure en cours…' : 'Mesurer les performances'}
      </Button>
      {results.map(result => (
        <Typography key={result} variant="caption">
          {result}
        </Typography>
      ))}
    </Stack>
  );
}
