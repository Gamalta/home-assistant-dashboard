import type {PlugStatus} from '../../../utils/entity/plug';

type PlugViewProps = {
  status: PlugStatus;
};

const LED_COLORS: Record<PlugStatus, string> = {
  on: '#2f8cff',
  standby: '#ff9f0a',
  off: '#c7c7cc',
};
const ANTHRACITE = '#2c2c2e';

// Prise murale vue de face. La plaque reste blanche en mode sombre, comme une vraie prise.
export function PlugView(props: PlugViewProps) {
  const {status} = props;
  const plugged = status !== 'off';
  const led = LED_COLORS[status];

  return (
    <svg width={260} height={300} viewBox="0 0 260 300" aria-hidden>
      <defs>
        <filter id="plug-shadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx={0} dy={8} stdDeviation={9} floodOpacity={0.22} />
        </filter>
        <filter
          id="plug-fiche-shadow"
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
        >
          <feDropShadow dx={0} dy={5} stdDeviation={5} floodOpacity={0.35} />
        </filter>
        <filter id="plug-glow" x="-100%" y="-200%" width="300%" height="500%">
          <feGaussianBlur stdDeviation={6} />
        </filter>
        <linearGradient id="plug-plate" x2={0} y2={1}>
          <stop offset={0} stopColor="#ffffff" />
          <stop offset={1} stopColor="#f0f0f2" />
        </linearGradient>
        <linearGradient id="plug-frame" x2={0} y2={1}>
          <stop offset={0} stopColor="#ececef" />
          <stop offset={1} stopColor="#f8f8fa" />
        </linearGradient>
        <radialGradient id="plug-well" cy={0.62} r={0.6}>
          <stop offset={0.55} stopColor="#ffffff" />
          <stop offset={1} stopColor="#d6d6db" />
        </radialGradient>
        <radialGradient id="plug-screw" cx={0.35} cy={0.3} r={0.8}>
          <stop offset={0} stopColor="#fafafa" />
          <stop offset={1} stopColor="#9a9aa0" />
        </radialGradient>
        <radialGradient id="plug-body" cx={0.4} cy={0.3} r={0.8}>
          <stop offset={0} stopColor="#5a5a5f" />
          <stop offset={1} stopColor="#2a2a2d" />
        </radialGradient>
        <linearGradient id="plug-grip" x2={0} y2={1}>
          <stop offset={0} stopColor="#4a4a4f" />
          <stop offset={1} stopColor="#2a2a2d" />
        </linearGradient>
        <linearGradient id="plug-relief">
          <stop offset={0} stopColor="#2a2a2d" />
          <stop offset={0.45} stopColor="#55555a" />
          <stop offset={1} stopColor="#2a2a2d" />
        </linearGradient>
        {/* Le câble s'efface en sortant de l'illustration. */}
        <linearGradient
          id="plug-cable"
          y1={230}
          x2={0}
          y2={296}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset={0} stopColor={ANTHRACITE} />
          <stop offset={1} stopColor={ANTHRACITE} stopOpacity={0} />
        </linearGradient>
        <linearGradient
          id="plug-cable-light"
          y1={230}
          x2={0}
          y2={296}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset={0} stopColor="#fff" stopOpacity={0.22} />
          <stop offset={1} stopColor="#fff" stopOpacity={0} />
        </linearGradient>
      </defs>

      <rect
        x={20}
        y={12}
        width={220}
        height={220}
        rx={13}
        fill="url(#plug-plate)"
        stroke="#e3e3e8"
        filter="url(#plug-shadow)"
      />
      <rect
        x={48}
        y={40}
        width={164}
        height={164}
        rx={9}
        fill="none"
        stroke="#000"
        strokeOpacity={0.06}
      />
      <rect
        x={49}
        y={41}
        width={162}
        height={162}
        rx={8}
        fill="url(#plug-frame)"
        stroke="#fff"
        strokeWidth={2}
      />

      <circle
        cx={130}
        cy={122}
        r={45}
        fill="url(#plug-well)"
        stroke="#cfcfd4"
      />
      <rect x={123} y={80} width={14} height={6} rx={2} fill="#b4b4b9" />
      <rect x={123} y={158} width={14} height={6} rx={2} fill="#b4b4b9" />
      <circle cx={110} cy={122} r={6.5} fill="#1d1d1f" />
      <circle cx={150} cy={122} r={6.5} fill="#1d1d1f" />
      <circle
        cx={130}
        cy={122}
        r={5}
        fill="url(#plug-screw)"
        stroke="#8e8e93"
        strokeWidth={0.6}
      />
      <path
        d="M127.3 122h5.4M130 119.3v5.4"
        stroke="#636366"
        strokeWidth={1.2}
        strokeLinecap="round"
      />

      <ellipse
        cx={130}
        cy={26.5}
        rx={24}
        ry={9}
        filter="url(#plug-glow)"
        style={{
          fill: led,
          opacity: {on: 0.8, standby: 0.6, off: 0}[status],
          transition: 'fill 0.4s, opacity 0.4s',
        }}
      />
      <rect
        data-testid="voyant"
        x={119}
        y={23}
        width={22}
        height={7}
        rx={3.5}
        stroke="#000"
        strokeOpacity={0.08}
        style={{fill: led, transition: 'fill 0.4s'}}
      />
      <rect
        x={122.5}
        y={24.3}
        width={15}
        height={2}
        rx={1}
        fill="#fff"
        opacity={0.5}
      />

      <g
        data-testid="fiche"
        filter="url(#plug-fiche-shadow)"
        style={{
          opacity: plugged ? 1 : 0,
          // Débranchée, la fiche s'éloigne du mur, vers le bas.
          transform: plugged ? 'none' : 'translateY(16px) scale(1.1)',
          transformOrigin: '130px 122px',
          transition:
            'opacity 0.4s, transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        <path d="M130 200V300" stroke="url(#plug-cable)" strokeWidth={11} />
        <path
          d="M127.5 200V300"
          stroke="url(#plug-cable-light)"
          strokeWidth={2}
        />
        <path d="M119 168h22l-4 36h-14z" fill="url(#plug-relief)" />
        <path
          d="M121 176h18M121.7 182h16.6M122.3 188h15.4M123 194h14M123.7 200h12.6"
          stroke="#1c1c1e"
          strokeWidth={1.5}
        />
        <rect
          x={70}
          y={100}
          width={24}
          height={44}
          rx={9}
          fill="url(#plug-grip)"
        />
        <rect
          x={166}
          y={100}
          width={24}
          height={44}
          rx={9}
          fill="url(#plug-grip)"
        />
        <circle
          cx={130}
          cy={122}
          r={50}
          fill="url(#plug-body)"
          stroke="#1c1c1e"
        />
        <circle
          cx={130}
          cy={122}
          r={43}
          fill="none"
          stroke="#fff"
          strokeOpacity={0.07}
          strokeWidth={1.5}
        />
        <path
          d="M91 108a41 41 0 0 1 30-27"
          fill="none"
          stroke="#fff"
          strokeOpacity={0.18}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <rect
          x={121}
          y={80}
          width={18}
          height={90}
          rx={9}
          fill="url(#plug-relief)"
          stroke="#1c1c1e"
          strokeOpacity={0.6}
        />
        <path
          d="M126 90v70M134 90v70"
          stroke="#1c1c1e"
          strokeOpacity={0.7}
          strokeWidth={1.2}
        />
      </g>
    </svg>
  );
}
