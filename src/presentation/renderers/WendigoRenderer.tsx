/**
 * WendigoRenderer — bare antler branches creeping in from the top corners.
 * Purely abstract branch silhouettes: no anatomy, no identifying markings.
 *
 * stroke-dashoffset controls visibility: at strength 0 branches are invisible,
 * at strength 100 they are fully extended.
 */

interface WendigoRendererProps {
  strength: number;
  defeated: boolean;
}

// Each path has a hardcoded approximate length used for dash calculations.
// These are rough lengths computed from the segment geometry.
// All endpoint y-values are ≤ 300 (top-third of the 900-unit-high viewBox).

// Left-side branch paths (from top-left corner, spreading inward/downward)
const LEFT_BRANCHES = [
  { d: 'M0,0 L120,150 L200,240 L260,300', length: 410 },
  { d: 'M0,0 L80,110 L130,170 L90,240 L60,290', length: 360 },
  { d: 'M0,0 L120,150 L150,220 L180,180 L220,260', length: 360 },
  { d: 'M0,0 L80,110 L110,160 L80,220', length: 280 },
  { d: 'M120,150 L170,210 L140,265 L160,295', length: 180 },
  { d: 'M200,240 L240,275 L220,295', length: 80 },
  { d: 'M80,110 L50,155 L70,200', length: 120 },
];

// Right-side branch paths (from top-right corner, spreading inward/downward)
const RIGHT_BRANCHES = [
  { d: 'M1440,0 L1320,150 L1240,240 L1180,300', length: 410 },
  { d: 'M1440,0 L1360,110 L1310,170 L1350,240 L1380,290', length: 360 },
  { d: 'M1440,0 L1320,150 L1290,220 L1260,180 L1220,260', length: 360 },
  { d: 'M1440,0 L1360,110 L1330,160 L1360,220', length: 280 },
  { d: 'M1320,150 L1270,210 L1300,265 L1280,295', length: 180 },
  { d: 'M1240,240 L1200,275 L1220,295', length: 80 },
  { d: 'M1360,110 L1390,155 L1370,200', length: 120 },
];

export function WendigoRenderer({ strength, defeated }: WendigoRendererProps) {
  const visibility = strength / 100;

  const svgStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: 2,
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={svgStyle}
      // CSS class controls the dissolve transition — gated inside
      // @media (prefers-reduced-motion: no-preference) in global.css
      className={defeated ? 'defeated-dissolve' : undefined}
    >
      <defs>
        <filter id="wendigo-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#4a2500" floodOpacity="0.6" />
        </filter>
      </defs>

      {/* Left branches */}
      <g filter="url(#wendigo-glow)">
        {LEFT_BRANCHES.map((branch, i) => {
          const offset = branch.length * (1 - visibility);
          return (
            <path
              key={`left-${i}`}
              d={branch.d}
              stroke="#1a0a00"
              strokeWidth={i === 0 ? 3 : i < 3 ? 2 : 1.5}
              fill="none"
              strokeDasharray={branch.length}
              strokeDashoffset={offset}
              strokeLinecap="round"
              // CSS class gates this transition behind prefers-reduced-motion
              className="branch-animated"
            />
          );
        })}
      </g>

      {/* Right branches */}
      <g filter="url(#wendigo-glow)">
        {RIGHT_BRANCHES.map((branch, i) => {
          const offset = branch.length * (1 - visibility);
          return (
            <path
              key={`right-${i}`}
              d={branch.d}
              stroke="#1a0a00"
              strokeWidth={i === 0 ? 3 : i < 3 ? 2 : 1.5}
              fill="none"
              strokeDasharray={branch.length}
              strokeDashoffset={offset}
              strokeLinecap="round"
              // CSS class gates this transition behind prefers-reduced-motion
              className="branch-animated"
            />
          );
        })}
      </g>
    </svg>
  );
}
