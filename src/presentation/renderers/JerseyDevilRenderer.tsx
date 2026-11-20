/**
 * JerseyDevilRenderer — a storm-cloud silhouette in the upper-right.
 * Active only when the jerseyDevil MonsterView has active=true.
 * Purely abstract shapes: an organic asymmetric cloud blob, no identifying markings.
 *
 * Cloud is an organic asymmetric blob using cubic bezier curves.
 * Internal glow is a single blurred circle (not a symmetric pair).
 */

interface JerseyDevilRendererProps {
  strength: number;
  defeated: boolean;
  active: boolean;
}

export function JerseyDevilRenderer({ strength, defeated, active }: JerseyDevilRendererProps) {
  if (!active) return null;

  const cloudOpacity = 0.4 + (strength / 100) * 0.6;
  const glowOpacity = (strength / 100) * 0.5;

  // Inline style holds only layout and the CSS custom property for the pulse keyframe.
  // Defeat dissolve and the opacity transition are handled via CSS classes to ensure
  // they are properly gated behind @media (prefers-reduced-motion: no-preference).
  const svgStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '400px',
    height: '300px',
    pointerEvents: 'none',
    zIndex: 2,
    // opacity is set here only when not defeated, so the CSS class can take over on defeat.
    // The jd-pulse CSS animation will override this during the pulse cycle.
    opacity: defeated ? undefined : cloudOpacity,
    ['--jd-opacity-base' as string]: cloudOpacity,
  };

  const classes = [
    active && !defeated ? 'jd-pulse-anim' : '',
    defeated ? 'defeated-dissolve-heavy' : '',
  ].filter(Boolean).join(' ') || undefined;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 300"
      aria-hidden="true"
      style={svgStyle}
      className={classes}
    >
      <defs>
        {/* Internal frost-blue glow — blurred radial gradient */}
        <radialGradient id="jd-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#5dade2" stopOpacity={glowOpacity} />
          <stop offset="100%" stopColor="#5dade2" stopOpacity="0" />
        </radialGradient>

        {/* Glow blur filter */}
        <filter id="jd-glow-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="20" />
        </filter>
      </defs>

      {/*
        Cloud body: a single organic blob path using cubic beziers.
        Intentionally asymmetric so it reads as a storm cloud.
        No symmetric pairs of bumps at the same height.
      */}
      <path
        d="
          M60,220
          C40,220 20,200 25,175
          C10,170 5,150 20,138
          C15,125 22,108 40,108
          C45,88 65,75 88,82
          C98,60 125,52 148,65
          C162,45 190,42 210,58
          C228,38 260,38 278,55
          C302,42 330,52 338,75
          C362,78 375,100 365,120
          C385,130 390,155 372,168
          C388,182 382,205 360,210
          C358,228 335,238 315,228
          C300,245 272,248 255,235
          C238,250 208,250 192,237
          C175,252 148,250 134,238
          C115,250 88,245 78,232
          Z
        "
        fill="#1c1f2e"
      />

      {/* Internal glow — single off-centre blurred circle, not a symmetric pair */}
      <circle
        cx="200"
        cy="140"
        r="60"
        fill="url(#jd-glow)"
        filter="url(#jd-glow-blur)"
      />

      {/* Wing shape — an abstract curved stroke inside the cloud, fill only */}
      <path
        d="
          M120,160
          C140,130 175,118 210,125
          C240,118 275,128 290,155
          C265,145 240,140 210,145
          C180,140 150,148 120,160
          Z
        "
        fill="#12141e"
      />
    </svg>
  );
}
