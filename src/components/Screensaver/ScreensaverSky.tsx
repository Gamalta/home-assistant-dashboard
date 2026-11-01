import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type {ReactNode} from 'react';
import {useDaylight} from '../../hooks/useDaylight';

const NIGHT = 'linear-gradient(#060a18, #1b2042)';
const DAY = 'linear-gradient(#173f69, #44739f)';
const TWILIGHT =
  'radial-gradient(ellipse at 50% 120%, rgba(255, 138, 76, 0.55), transparent 70%)';

type ScreensaverSkyProps = {
  children: ReactNode;
};

/** Ciel qui suit le jour, plus clair le jour et orangé à l'aube et au crépuscule. */
export function ScreensaverSky(props: ScreensaverSkyProps) {
  const {children} = props;
  const day = useDaylight();
  const layer = {position: 'absolute', inset: 0} as const;

  return (
    <Box sx={{...layer, background: NIGHT}}>
      <Box sx={{...layer, background: DAY, opacity: day}} />
      <Box
        sx={{
          ...layer,
          background: TWILIGHT,
          opacity: 1 - Math.abs(2 * day - 1),
        }}
      />
      {/* Plus discret la nuit, pour ne pas éclairer la pièce. */}
      <Stack
        spacing={6}
        sx={{
          ...layer,
          p: 4,
          justifyContent: 'center',
          alignItems: 'center',
          opacity: 0.6 + 0.4 * day,
        }}
      >
        {children}
      </Stack>
    </Box>
  );
}
