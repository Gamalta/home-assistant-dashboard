import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {useTheme} from '@mui/material/styles';
import {motion} from 'framer-motion';
import {useId} from 'react';

type MortgageHouseProps = {
  /** Part du capital remboursée, de 0 à 1. */
  ratio: number;
};

// Toit, cheminée et murs.
const HOUSE =
  'M100 22 L130 47.7 V34 H148 V63.1 L184 94 H164 V182 H36 V94 H16 Z';
const DOOR = 'M88 182 V146 Q88 140 94 140 H106 Q112 140 112 146 V182';
const TOP = 22;
const BOTTOM = 182;

export function MortgageHouse(props: MortgageHouseProps) {
  const {ratio} = props;
  const theme = useTheme();
  const id = useId();
  const palette = (theme.vars ?? theme).palette;
  const percent = Math.floor(ratio * 100);
  const level = BOTTOM - (BOTTOM - TOP) * ratio;
  const outline = {
    fill: 'none',
    stroke: palette.text.secondary,
    strokeWidth: 3,
    strokeLinejoin: 'round',
  } as const;

  return (
    <Stack spacing={1} sx={{width: 240, alignItems: 'center', flexShrink: 0}}>
      <svg
        viewBox="12 18 176 168"
        role="img"
        aria-label={`${percent} % remboursé`}
        style={{display: 'block', width: '100%'}}
      >
        <defs>
          <clipPath id={`${id}-house`}>
            <path d={HOUSE} />
          </clipPath>
          <linearGradient id={`${id}-fill`} x2="0" y2="1">
            <stop
              offset="0"
              stopColor={palette.primary.main}
              stopOpacity={0.6}
            />
            <stop
              offset="1"
              stopColor={palette.primary.main}
              stopOpacity={0.25}
            />
          </linearGradient>
        </defs>
        <path d={HOUSE} fill={palette.background.tertiary} />
        <g clipPath={`url(#${id}-house)`}>
          <motion.g
            initial={{y: BOTTOM - level}}
            animate={{y: 0}}
            transition={{duration: 1.2, delay: 0.2, ease: 'easeOut'}}
          >
            <rect
              y={level}
              width={200}
              height={BOTTOM - level}
              fill={`url(#${id}-fill)`}
            />
            <line
              x2={200}
              y1={level}
              y2={level}
              stroke={palette.primary.main}
              strokeWidth={3}
            />
          </motion.g>
        </g>
        <path d={DOOR} {...outline} />
        <path d={HOUSE} {...outline} />
      </svg>
      <Stack sx={{alignItems: 'center'}}>
        <Typography variant="h3" component="span">
          {percent} %
        </Typography>
        <Typography color="textSecondary" component="span">
          remboursé
        </Typography>
      </Stack>
    </Stack>
  );
}
