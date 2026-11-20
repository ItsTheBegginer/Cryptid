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

// Left-side branch paths (from top-left corner, spreading inward/downward)
const LEFT_BRANCHES = [
  { d: 'M0,0 L120,180 L200,310 L260,420', length: 460 },
  { d: 'M0,0 L80,120 L130,190 L90,280 L60,360', length: 400 },
  { d: 'M0,0 L120,180 L150,260 L180,210 L220,290', length: 390 },
  { d: 'M0,0 L80,120 L110,180 L80,250', length: 310 },
  { d: 'M120,180 L170,250 L140,310 L160,370', length: 240 },
  { d: 'M200,310 L240,350 L220,400', length: 110 },
  { d: 'M80,120 L50,170 L70,220', length: 130 },
];

// Right-side branch paths (from top-right corner, spreading inward/downward)
const RIGHT_BRANCHES = [
  { d: 'M1440,0 L1320,180 L1240,310 L1180,420', length: 460 },
  { d: 'M1440,0 L1360,120 L1310,190 L1350,280 L1380,360', length: 400 },
  { d: 'M1440,0 L1320,180 L1290,260 L1260,210 L1220,290', length: 390 },
  { d: 'M1440,0 L1360,120 L1330,180 L1360,250', length: 310 },
  { d: 'M1320,180 L1270,250 L1300,310 L1280,370', length: 240 },
  { d: 'M1240,310 L1200,350 L1220,400', length: 110 },
  { d: 'M1360,120 L1390,170 L1370,220', length: 130 },
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
