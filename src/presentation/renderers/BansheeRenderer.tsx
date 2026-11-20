/**
 * BansheeRenderer — a sound waveform ribbon across the bottom of the screen.
 * Purely abstract waveform: no body, no anatomy, no identifying markings.
 *
 * At strength 0: flat line near y=100.
 * At strength 100: tall jagged wave with ~80px amplitude.
 * ripple: triggers a pulse animation on wrong answer.
 */

interface BansheeRendererProps {
  strength: number;
  ripple: boolean;
  defeated: boolean;
}

// x-positions spread across width=1440, with per-point amplitude factors
const WAVE_POINTS: Array<{ x: number; factor: number }> = [
  { x: 0,    factor: 0.0  },
  { x: 90,   factor: 0.4  },
  { x: 180,  factor: 0.8  },
  { x: 270,  factor: 0.6  },
  { x: 360,  factor: 1.0  },
  { x: 450,  factor: 0.5  },
  { x: 540,  factor: 0.9  },
  { x: 630,  factor: 0.3  },
  { x: 720,  factor: 0.7  },
  { x: 810,  factor: 1.0  },
  { x: 900,  factor: 0.4  },
  { x: 990,  factor: 0.8  },
  { x: 1080, factor: 0.6  },
  { x: 1170, factor: 1.0  },
  { x: 1260, factor: 0.5  },
  { x: 1350, factor: 0.3  },
  { x: 1440, factor: 0.0  },
];

const BASE_Y = 100;
const MAX_AMPLITUDE = 80;

function buildWavePath(strength: number): string {
  const points = WAVE_POINTS.map(({ x, factor }, i) => {
    // Alternate up/down for a waveform look
    const direction = i % 2 === 0 ? 1 : -1;
    const yOffset = direction * (strength / 100) * MAX_AMPLITUDE * factor;
    return `${x},${BASE_Y + yOffset}`;
  });
  return 'M' + points.join(' L');
}

export function BansheeRenderer({ strength, ripple, defeated }: BansheeRendererProps) {
  const opacity = 0.15 + (strength / 100) * 0.45;
  const wavePath = buildWavePath(strength);

  const svgStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100vw',
    height: '200px',
    pointerEvents: 'none',
    zIndex: 2,
    opacity: defeated ? 0 : 1,
    filter: defeated ? 'blur(8px)' : 'none',
    transition: defeated ? 'opacity 600ms ease-in-out, filter 600ms ease-in-out' : 'none',
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 200"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={ripple ? 'banshee-ripple' : undefined}
      style={svgStyle}
    >
      <path
        d={wavePath}
        stroke="#dce8f0"
        strokeWidth="1.5"
        fill="none"
        opacity={opacity}
      />
    </svg>
  );
}
