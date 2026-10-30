import Box from '@mui/material/Box';
import {keyframes} from '@mui/material/styles';
import {Leds} from '../../../theme/Leds';
import {SMOKE_STATUSES, type SmokeStatus} from '../../../utils/entity/smoke';

type SmokeDetectorViewProps = {
  status: SmokeStatus;
};

const ring = {
  position: 'absolute',
  inset: '7%',
  borderRadius: '50%',
  border: '4px solid',
  borderColor: 'error.main',
  opacity: 0,
} as const;

// Détecteur vu de dessous. En alarme, son voyant clignote et des ondes s'en échappent.
export function SmokeDetectorView(props: SmokeDetectorViewProps) {
  const {status} = props;
  const alarm = status === 'smoke' || status === 'heat';
  const led = Leds[SMOKE_STATUSES[status].led];

  return (
    <Box
      role="img"
      aria-label={`Détecteur de fumée, voyant ${led.name}`}
      sx={{position: 'relative', width: 240, flexShrink: 0}}
    >
      {/* Animations de transform et d'opacité seules : le compositeur les gère sans repeindre. */}
      {alarm && (
        <>
          <Box sx={{...ring, animation: `${wave} 2s ease-out infinite`}} />
          <Box sx={{...ring, animation: `${wave} 2s ease-out 1s infinite`}} />
        </>
      )}
      <svg
        viewBox="0 0 200 200"
        width="100%"
        style={{
          position: 'relative',
          display: 'block',
          filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.35))',
        }}
      >
        <defs>
          <radialGradient id="smoke-body" cx="0.4" cy="0.35" r="0.75">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#d9dce1" />
          </radialGradient>
          <radialGradient id="smoke-button" cx="0.4" cy="0.35" r="0.8">
            <stop offset="0" stopColor="#fbfbfc" />
            <stop offset="1" stopColor="#e1e4e8" />
          </radialGradient>
        </defs>
        <circle
          cx="100"
          cy="100"
          r="86"
          fill="url(#smoke-body)"
          stroke="#cdd0d5"
        />
        <circle
          cx="100"
          cy="100"
          r="70"
          fill="none"
          stroke="#d3d6db"
          strokeWidth="1.5"
        />
        {Array.from({length: 24}, (_, i) => (
          <rect
            key={i}
            x="98"
            y="36"
            width="4"
            height="16"
            rx="2"
            fill="#c2c6cc"
            transform={`rotate(${i * 15} 100 100)`}
          />
        ))}
        <circle
          cx="100"
          cy="100"
          r="28"
          fill="url(#smoke-button)"
          stroke="#cfd2d7"
        />
        <Box
          component="g"
          sx={{
            animation: alarm ? `${blink} 0.8s steps(1) infinite` : '',
          }}
        >
          <circle cx="100" cy="100" r="12" fill={led.color} opacity={0.3} />
          <circle cx="100" cy="100" r="6" fill={led.color} />
        </Box>
      </svg>
    </Box>
  );
}

const wave = keyframes`
  from {
    transform: scale(1);
    opacity: 0.7;
  }
  to {
    transform: scale(1.3);
    opacity: 0;
  }
`;

const blink = keyframes`
  50% {
    opacity: 0;
  }
`;
