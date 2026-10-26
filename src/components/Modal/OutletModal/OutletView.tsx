type OutletViewProps = {
  on: boolean;
};

const LED_ON = '#399fff';
const LED_OFF = '#9da2a9';

// Prise murale française vue de face. La plaque reste blanche en mode sombre, comme une vraie prise.
export function OutletView(props: OutletViewProps) {
  const {on} = props;
  const glow = {
    fill: 'url(#outlet-glow)',
    style: {opacity: on ? 1 : 0, transition: 'opacity 0.4s'},
  };

  return (
    <svg width={300} height={345} viewBox="96 90 348 400" aria-hidden>
      <defs>
        <filter id="outlet-shadow" x="-20%" y="-20%" width="150%" height="150%">
          <feDropShadow dx={6} dy={12} stdDeviation={11} floodOpacity={0.47} />
        </filter>
        {/* Halo et ombre de la fiche en dégradés : un filtre serait recalculé à chaque image de l'animation. */}
        <radialGradient id="outlet-glow">
          {[1, 0.4, 0.1, 0].map((opacity, i) => (
            <stop
              key={i}
              offset={i / 3}
              stopColor={LED_ON}
              stopOpacity={opacity}
            />
          ))}
        </radialGradient>
        <linearGradient id="outlet-plate" x2={0.6} y2={1}>
          <stop offset={0} stopColor="#fefefe" />
          <stop offset={1} stopColor="#e8e8e6" />
        </linearGradient>
        <linearGradient id="outlet-frame" x2={0.6} y2={1}>
          <stop offset={0} stopColor="#fefefe" />
          <stop offset={1} stopColor="#ececea" />
        </linearGradient>
        <radialGradient id="outlet-well" cx={0.4} cy={0.3} r={0.8}>
          <stop offset={0} stopColor="#ececea" />
          <stop offset={0.35} stopColor="#e6e6e3" />
          <stop offset={1} stopColor="#cbcbc9" />
        </radialGradient>
        {/* Ombre portée par le bord haut du puits, enfoncé dans la plaque. */}
        <radialGradient id="outlet-well-rim" cx={0.53} cy={0.57} r={0.55}>
          <stop offset={0.86} stopOpacity={0} />
          <stop offset={0.95} stopOpacity={0.1} />
          <stop offset={1} stopOpacity={0.35} />
        </radialGradient>
        <radialGradient id="outlet-pin" cx={0.38} cy={0.3} r={0.7}>
          <stop offset={0} stopColor="#f8f8f7" />
          <stop offset={0.5} stopColor="#e2e2e0" />
          <stop offset={0.85} stopColor="#b9b9b7" />
          <stop offset={1} stopColor="#8a8a88" />
        </radialGradient>
        <radialGradient id="outlet-hole" cx={0.45} cy={0.3} r={0.7}>
          <stop offset={0} stopColor="#444442" />
          <stop offset={1} stopColor="#161615" />
        </radialGradient>
        <radialGradient id="plug-shadow">
          <stop offset={0.75} stopOpacity={0.45} />
          <stop offset={1} stopOpacity={0} />
        </radialGradient>
        <linearGradient id="plug-cable-shadow">
          <stop offset={0} stopOpacity={0.25} />
          <stop offset={1} stopOpacity={0} />
        </linearGradient>
        {/* Le câble s'efface en sortant de l'illustration. */}
        <linearGradient
          id="plug-cable-fade"
          y1={462}
          x2={0}
          y2={490}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset={0} stopColor="#fff" />
          <stop offset={1} stopColor="#000" />
        </linearGradient>
        <mask id="plug-cable-mask">
          <rect
            x={250}
            y={450}
            width={50}
            height={90}
            fill="url(#plug-cable-fade)"
          />
        </mask>
        <linearGradient id="plug-body" x2={0.6} y2={1}>
          <stop offset={0} stopColor="#4b5054" />
          <stop offset={1} stopColor="#3a3e41" />
        </linearGradient>
        <linearGradient id="plug-bevel" x2={0} y2={1}>
          <stop offset={0} stopColor="#62676b" />
          <stop offset={1} stopColor="#2a2d30" />
        </linearGradient>
        {/* Arête, col, crans et câble : des cylindres éclairés de face. */}
        <linearGradient id="plug-cylinder">
          <stop offset={0} stopColor="#33373a" />
          <stop offset={0.5} stopColor="#565b60" />
          <stop offset={1} stopColor="#2e3235" />
        </linearGradient>
        <linearGradient id="plug-grip">
          <stop offset={0} stopColor="#282b2d" />
          <stop offset={0.5} stopColor="#373b3e" />
          <stop offset={1} stopColor="#2b2e31" />
        </linearGradient>
      </defs>

      {/* La lumière du voyant déborde sur le mur, au-dessus de la plaque. */}
      <ellipse
        cx={270}
        cy={128}
        rx={130}
        ry={32}
        fillOpacity={0.45}
        {...glow}
      />
      <rect
        x={114}
        y={114}
        width={312}
        height={312}
        rx={14}
        fill="url(#outlet-plate)"
        stroke="#000"
        strokeOpacity={0.05}
        filter="url(#outlet-shadow)"
      />
      <rect
        x={115}
        y={115}
        width={310}
        height={310}
        rx={13}
        fill="none"
        stroke="#fff"
        strokeOpacity={0.6}
      />
      <rect
        x={150}
        y={167}
        width={240}
        height={223}
        rx={10}
        fill="url(#outlet-frame)"
        stroke="#000"
        strokeOpacity={0.07}
      />

      <ellipse cx={270} cy={141} rx={44} ry={24} {...glow} />
      <rect
        data-testid="led"
        x={251}
        y={137}
        width={38}
        height={8}
        rx={4}
        stroke={LED_ON}
        strokeWidth={6}
        style={{
          fill: on ? LED_ON : LED_OFF,
          // Le trait, à moitié hors du voyant, l'auréole.
          strokeOpacity: on ? 0.3 : 0,
          transition: 'fill 0.4s, stroke-opacity 0.4s',
        }}
      />
      <rect
        x={253}
        y={138}
        width={34}
        height={3.5}
        rx={1.75}
        fill="#fff"
        opacity={0.15}
      />

      <circle cx={270} cy={277} r={80} fill="url(#outlet-well)" />
      <circle cx={270} cy={277} r={80} fill="url(#outlet-well-rim)" />
      <circle cx={236} cy={277} r={12} fill="url(#outlet-hole)" />
      <circle cx={304} cy={277} r={12} fill="url(#outlet-hole)" />
      <circle cx={272} cy={237} r={14} fill="url(#plug-shadow)" />
      <circle cx={270} cy={232} r={12.5} fill="url(#outlet-pin)" />

      <g
        data-testid="plug"
        style={{
          opacity: on ? 1 : 0,
          // Débranchée, la fiche s'éloigne du mur, vers le bas.
          transform: on ? 'none' : 'translateY(16px) scale(1.1)',
          transformOrigin: '270px 277px',
          transition:
            'opacity 0.4s, transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        <circle cx={276} cy={284} r={92} fill="url(#plug-shadow)" />
        <ellipse cx={282} cy={368} rx={46} ry={64} fill="url(#plug-shadow)" />
        <g mask="url(#plug-cable-mask)">
          <rect
            x={281}
            y={455}
            width={14}
            height={35}
            fill="url(#plug-cable-shadow)"
          />
          <rect
            x={259}
            y={455}
            width={22}
            height={35}
            fill="url(#plug-cylinder)"
          />
        </g>
        <path d="M250 404h40l-3 58h-34z" fill="#2b2f32" />
        {[403, 412, 421, 430, 439, 448].map(y => (
          <rect
            key={y}
            x={246}
            y={y - 3}
            width={48}
            height={6}
            rx={3}
            fill="url(#plug-cylinder)"
          />
        ))}
        <rect
          x={251}
          y={454}
          width={38}
          height={6}
          rx={3}
          fill="url(#plug-cylinder)"
        />

        <circle
          cx={270}
          cy={277}
          r={72}
          fill="url(#plug-body)"
          stroke="url(#plug-bevel)"
          strokeWidth={3}
        />
        {/* L'arête suit le bord du corps. */}
        <path
          d="M245 208a73.5 73.5 0 0 1 50 0V314h-50z"
          fill="url(#plug-cylinder)"
          stroke="#232628"
        />
        <rect
          x={191}
          y={248}
          width={27}
          height={59}
          rx={10}
          fill="url(#plug-grip)"
        />
        <rect
          x={322}
          y={248}
          width={27}
          height={59}
          rx={10}
          fill="url(#plug-grip)"
        />

        <path
          d="M240 306h60l11 28v60q0 10-10 10h-62q-10 0-10-10v-60z"
          fill="url(#plug-cylinder)"
          stroke="#232628"
          strokeOpacity={0.6}
        />
        <path d="M240 306h60l11 28h-82z" fill="#fff" opacity={0.04} />
      </g>
    </svg>
  );
}
