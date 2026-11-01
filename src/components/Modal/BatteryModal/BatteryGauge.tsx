import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import {keyframes} from '@mui/material/styles';
import {motion} from 'framer-motion';
import {isBatteryLow} from '../../../utils/entity/battery';

type BatteryGaugeProps = {
  level: number | null;
};

export function BatteryGauge(props: BatteryGaugeProps) {
  const {level} = props;
  const low = isBatteryLow(level);

  return (
    <Stack direction="row" sx={{alignItems: 'center'}}>
      <Box
        role="progressbar"
        aria-label="Niveau de pile"
        aria-valuenow={level ?? undefined}
        aria-valuemin={0}
        aria-valuemax={100}
        sx={{
          flex: 1,
          height: 56,
          p: '5px',
          border: '3px solid',
          borderColor: 'text.secondary',
          borderRadius: '14px',
        }}
      >
        {/* La jauge se remplit à l'ouverture, puis suit le niveau. */}
        <Box
          component={motion.div}
          initial={{width: 0}}
          animate={{width: `${Math.min(100, Math.max(0, level ?? 0))}%`}}
          transition={{duration: 0.8, ease: 'easeOut'}}
          sx={{
            height: '100%',
            borderRadius: '8px',
            bgcolor: low ? 'error.main' : 'success.main',
            animation: low ? `${blink} 1.5s ease-in-out infinite` : '',
          }}
        />
      </Box>
      <Box
        sx={{
          width: 7,
          height: 22,
          ml: '2px',
          borderRadius: '0 6px 6px 0',
          bgcolor: 'text.secondary',
        }}
      />
    </Stack>
  );
}

const blink = keyframes`
  50% {
    opacity: 0.4;
  }
`;
