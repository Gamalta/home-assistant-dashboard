import {useTheme} from '@mui/material/styles';
import {motion} from 'framer-motion';
import {useId} from 'react';

// Automotrice TER de profil, cabine à gauche, puis deux caisses.
const LEAD = 'M236 10 H46 C30 10 19 15 14 25 L7 41 Q5 50 14 50 H236 Z';
const WINDSHIELD = 'M45 14 C32 14 24 18 19 27 L15 35 H42 Q45 35 45 32 Z';
const CARS = [240, 444];
const BOGIES = [36, 206, 272, 412, 476, 616];

const range = (start: number, count: number) =>
  Array.from({length: count}, (_, index) => start + index * 28);
const WINDOWS = [...range(64, 5), ...CARS.flatMap(x => range(x + 36, 5))];
const DOORS = [208, ...CARS.flatMap(x => [x + 8, x + 176])];

type TrainViewProps = {
  height: number;
};

// Blanche dans les deux thèmes, comme une vraie rame : seul le liseré suit le
// thème. Recadrée à droite selon la largeur disponible.
export function TrainView(props: TrainViewProps) {
  const {height} = props;
  const theme = useTheme();
  const id = useId();
  const palette = (theme.vars ?? theme).palette;
  const body = {
    fill: `url(#${id}-body)`,
    stroke: 'rgba(0, 0, 0, 0.12)',
    strokeWidth: 0.8,
  };
  const glass = `url(#${id}-glass)`;

  return (
    <svg
      viewBox="-12 0 712 64"
      preserveAspectRatio="xMinYMax slice"
      aria-hidden
      data-testid="train-view"
      // Sans largeur propre : la rame prend celle du parent, sans l'élargir.
      style={{display: 'block', width: '100%', height, contain: 'inline-size'}}
    >
      <defs>
        <linearGradient id={`${id}-body`} x2={0} y2={1}>
          <stop offset={0} stopColor="#fdfdfd" />
          <stop offset={1} stopColor="#cfd3d9" />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x2={0} y2={1}>
          <stop offset={0} stopColor="#55606f" />
          <stop offset={1} stopColor="#1d2127" />
        </linearGradient>
        <clipPath id={`${id}-lead`}>
          <path d={LEAD} />
        </clipPath>
      </defs>
      <rect
        x={-12}
        y={60}
        width={712}
        height={2.5}
        fill={palette.text.secondary}
      />
      {/* La rame arrive de la droite et freine jusqu'au quai. */}
      <motion.g
        initial={{x: 160}}
        animate={{x: 0}}
        transition={{duration: 1.4, ease: 'easeOut'}}
      >
        <rect x={64} y={6} width={96} height={5} rx={2} fill="#c4c8ce" />
        <path
          d="M98 6 L108 1 L118 6 M102 0.8 H114"
          fill="none"
          stroke="#7a7f87"
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
        {CARS.map(x => (
          <rect
            key={x}
            x={x - 8}
            y={14}
            width={12}
            height={32}
            fill="#2b2e33"
          />
        ))}
        {BOGIES.map(x => (
          <g key={x}>
            <rect
              x={x - 15}
              y={48}
              width={30}
              height={7}
              rx={2}
              fill="#4b4f56"
            />
            {[x - 8, x + 8].map(cx => (
              <circle
                key={cx}
                cx={cx}
                cy={55}
                r={4.6}
                fill="#2f3237"
                stroke="#8a9098"
                strokeWidth={1.2}
              />
            ))}
          </g>
        ))}
        <path d={LEAD} {...body} />
        <g clipPath={`url(#${id}-lead)`}>
          <rect y={38} width={240} height={5} fill={palette.primary.main} />
          <rect y={47} width={240} height={3} fill="#9ba1a9" />
        </g>
        <path d={WINDSHIELD} fill={glass} />
        <ellipse cx={10.5} cy={44} rx={2.6} ry={1.5} fill="#fff6cc" />
        {CARS.map(x => (
          <g key={x}>
            <rect x={x} y={10} width={200} height={40} rx={3} {...body} />
            <rect
              x={x}
              y={38}
              width={200}
              height={5}
              fill={palette.primary.main}
            />
            <rect x={x} y={47} width={200} height={3} fill="#9ba1a9" />
          </g>
        ))}
        {WINDOWS.map(x => (
          <rect
            key={x}
            x={x}
            y={17}
            width={20}
            height={14}
            rx={3}
            fill={glass}
          />
        ))}
        {DOORS.map(x => (
          <g key={x}>
            <rect
              x={x}
              y={14}
              width={18}
              height={32}
              rx={2}
              fill="none"
              stroke="#b0b5bc"
            />
            {[x + 2.5, x + 10].map(leaf => (
              <rect
                key={leaf}
                x={leaf}
                y={18}
                width={5.5}
                height={16}
                rx={1.5}
                fill={glass}
              />
            ))}
          </g>
        ))}
      </motion.g>
    </svg>
  );
}
