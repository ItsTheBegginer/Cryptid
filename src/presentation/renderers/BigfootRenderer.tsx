/**
 * BigfootRenderer — footprints and swaying grass at the bottom of the screen.
 * Purely abstract shapes: ovals and line elements, no anatomy or markings.
 *
 * Prints become visible as strength increases.
 * Grass blades sway with staggered CSS keyframe animations.
 */

interface BigfootRendererProps {
  strength: number;
  defeated: boolean;
}

// Footprint positions: staggered across the bottom, leading right
// Each entry: { cx, cy, rx, ry, rotation }
const PRINTS = [
  { cx: 180, cy: 148, rx: 14, ry: 24, rotation: -10 },
  { cx: 290, cy: 155, rx: 13, ry: 22, rotation: 8  },
  { cx: 420, cy: 142, rx: 14, ry: 24, rotation: -12 },
  { cx: 550, cy: 152, rx: 13, ry: 22, rotation: 10  },
  { cx: 690, cy: 140, rx: 14, ry: 23, rotation: -8  },
  { cx: 840, cy: 150, rx: 13, ry: 22, rotation: 7   },
  { cx: 1000, cy: 143, rx: 14, ry: 24, rotation: -11 },
];

const TOTAL_PRINTS = PRINTS.length;

// Grass blade groups: each blade is a line from ground upward at a slight angle
// Grouped for CSS transform-origin (bottom of line)
const GRASS_GROUPS: Array<{
  blades: Array<{ x1: number; y1: number; x2: number; y2: number }>;
  swayClass: string;
}> = [
  {
    swayClass: 'grass-sway-0',
    blades: [
      { x1: 50,  y1: 180, x2: 44,  y2: 148 },
      { x1: 62,  y1: 180, x2: 68,  y2: 150 },
      { x1: 110, y1: 180, x2: 104, y2: 152 },
    ],
  },
  {
    swayClass: 'grass-sway-1',
    blades: [
      { x1: 220, y1: 180, x2: 214, y2: 150 },
      { x1: 232, y1: 180, x2: 238, y2: 148 },
      { x1: 360, y1: 180, x2: 354, y2: 152 },
    ],
  },
  {
    swayClass: 'grass-sway-2',
    blades: [
      { x1: 480, y1: 180, x2: 474, y2: 148 },
      { x1: 492, y1: 180, x2: 498, y2: 151 },
      { x1: 620, y1: 180, x2: 614, y2: 150 },
      { x1: 755, y1: 180, x2: 749, y2: 148 },
    ],
  },
  {
    swayClass: 'grass-sway-3',
    blades: [
      { x1: 900, y1: 180, x2: 906, y2: 150 },
      { x1: 912, y1: 180, x2: 906, y2: 148 },
      { x1: 1060, y1: 180, x2: 1066, y2: 152 },
      { x1: 1200, y1: 180, x2: 1194, y2: 148 },
      { x1: 1340, y1: 180, x2: 1346, y2: 150 },
    ],
  },
];

export function BigfootRenderer({ strength, defeated }: BigfootRendererProps) {
  const svgStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100vw',
    height: '180px',
    pointerEvents: 'none',
    zIndex: 2,
    opacity: defeated ? 0 : 1,
    transition: defeated ? 'opacity 600ms ease-in-out' : 'none',
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 180"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={svgStyle}
    >
      {/* Footprints — simple elongated ovals, no anatomy */}
      {PRINTS.map((print, i) => {
        const visible = strength >= (i / TOTAL_PRINTS) * 100;
        return (
          <ellipse
            key={i}
            cx={print.cx}
            cy={print.cy}
            rx={print.rx}
            ry={print.ry}
            fill="#111827"
            opacity={visible ? 0.6 : 0}
            transform={`rotate(${print.rotation}, ${print.cx}, ${print.cy})`}
            style={{ transition: 'opacity 0.4s ease-in-out' }}
          />
        );
      })}

      {/* Grass blades in sway groups */}
      {GRASS_GROUPS.map((group) => (
        <g key={group.swayClass} className={group.swayClass}>
          {group.blades.map((blade, j) => (
            <line
              key={j}
              x1={blade.x1}
              y1={blade.y1}
              x2={blade.x2}
              y2={blade.y2}
              stroke="#111827"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ))}
        </g>
      ))}
    </svg>
  );
}
