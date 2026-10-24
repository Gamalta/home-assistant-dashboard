import Box from '@mui/material/Box';
import {keyframes} from '@mui/material/styles';
import {Leds} from '../../../theme/Leds';
import {isBatteryLow} from '../../../utils/entity/battery';

type WallSwitchViewProps = {
  level: number | null;
};

// Interrupteur mural sans fil : son voyant clignote en rouge quand la pile faiblit.
export function WallSwitchView(props: WallSwitchViewProps) {
  const {level} = props;
  const low = isBatteryLow(level);
  const led = Leds[level === null ? 'off' : low ? 'red' : 'green'];

  return (
    <Box
      role="img"
      aria-label={`Interrupteur sans fil, voyant ${led.name}`}
      sx={{
        width: 240,
        flexShrink: 0,
        filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.35))',
        '& .led': {
          animation: low ? `${blink} 1.5s steps(1) infinite` : '',
        },
      }}
    >
      <svg viewBox="0 0 200 200" width="100%" style={{display: 'block'}}>
        <defs>
          <linearGradient id="switch-plate" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#dfe2e6" />
          </linearGradient>
          <linearGradient id="switch-rocker" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fdfdfe" />
            <stop offset="1" stopColor="#e9ebee" />
          </linearGradient>
        </defs>
        <rect
          x="20"
          y="20"
          width="160"
          height="160"
          rx="24"
          fill="url(#switch-plate)"
          stroke="#cfd2d7"
        />
        <rect
          x="46"
          y="46"
          width="108"
          height="108"
          rx="14"
          fill="url(#switch-rocker)"
          stroke="#d6d9dd"
        />
        <path d="M52 100h96" stroke="#d6d9dd" strokeWidth="1.5" />
        <g className="led">
          <circle cx="100" cy="60" r="7" fill={led.color} opacity={0.3} />
          <circle cx="100" cy="60" r="3.5" fill={led.color} />
        </g>
      </svg>
    </Box>
  );
}

const blink = keyframes`
  50% {
    opacity: 0;
  }
`;
