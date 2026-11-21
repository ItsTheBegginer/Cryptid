/**
 * Scene — fixed full-viewport atmospheric background.
 * Rendered behind all UI content (z-index 0).
 * Layers: sky → stars → moon glow → moon → far treeline → fog → near treeline
 * No identifying marks, no symmetric decorative pairs.
 *
 * relief prop: a monotonically increasing counter; each increment triggers a fresh
 * fog-dim animation (correct-answer feedback). Using a counter rather than a boolean
 * ensures rapid consecutive correct answers each fire the effect.
 * Gated behind prefers-reduced-motion — under reduced-motion the opacity stays stable.
 */
import { useEffect, useState } from 'react';

interface SceneProps {
  relief?: number;
}

export function Scene({ relief = 0 }: SceneProps) {
  // Fog opacity: normally 1; pulses down to 0.2 and back when relief increments.
  // Only applies when motion is acceptable — mediaReducedMotion check below.
  const [fogOpacity, setFogOpacity] = useState(1);

  useEffect(() => {
    // Skip on initial mount (relief === 0 means no answer yet).
    if (relief === 0) return;
    // Respect prefers-reduced-motion: skip the animation entirely if the user
    // has requested reduced motion.
    const mq = window.matchMedia('(prefers-reduced-motion: no-preference)');
    if (!mq.matches) return;

    // Fade fog out …
    setFogOpacity(0.2);
    // … then back in after 500 ms (animation is 1 s total split across two steps)
    const t = setTimeout(() => setFogOpacity(1), 500);
    return () => clearTimeout(t);
  }, [relief]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <defs>
        {/* Moon glow radial gradient */}
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e8eaf0" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#e8eaf0" stopOpacity="0" />
        </radialGradient>

        {/* Moon glow blur filter */}
        <filter id="moonBlur" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="18" />
        </filter>

        {/* Far treeline blur filter */}
        <filter id="farTreeBlur" x="-2%" y="-2%" width="104%" height="104%">
          <feGaussianBlur stdDeviation="2" />
        </filter>

        {/* Fog gradient — left transparent, mid fog colour, right transparent */}
        <linearGradient id="fogGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e2d3d" stopOpacity="0" />
          <stop offset="50%" stopColor="#1e2d3d" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#1e2d3d" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ── Layer 1: Sky ──────────────────────────────────────────────────── */}
      <rect x="0" y="0" width="1440" height="900" fill="#0a0d14" />

      {/* ── Layer 2: Stars (51 circles, upper 2/3, hardcoded positions) ───── */}
      {/* Stars distributed so no symmetric pair of two circles sit close together */}
      <circle cx="42"   cy="38"  r="1"   fill="#e8eaf0" opacity="0.5" />
      <circle cx="119"  cy="72"  r="1.5" fill="#e8eaf0" opacity="0.4" />
      <circle cx="183"  cy="22"  r="1"   fill="#e8eaf0" opacity="0.6" />
      <circle cx="257"  cy="55"  r="1"   fill="#e8eaf0" opacity="0.3" />
      <circle cx="318"  cy="14"  r="1.5" fill="#e8eaf0" opacity="0.5" />
      <circle cx="401"  cy="43"  r="1"   fill="#e8eaf0" opacity="0.4" />
      <circle cx="463"  cy="88"  r="1"   fill="#e8eaf0" opacity="0.6" />
      <circle cx="539"  cy="29"  r="1.5" fill="#e8eaf0" opacity="0.3" />
      <circle cx="612"  cy="61"  r="1"   fill="#e8eaf0" opacity="0.5" />
      <circle cx="678"  cy="17"  r="1"   fill="#e8eaf0" opacity="0.4" />
      <circle cx="745"  cy="47"  r="1.5" fill="#e8eaf0" opacity="0.6" />
      <circle cx="821"  cy="33"  r="1"   fill="#e8eaf0" opacity="0.3" />
      <circle cx="894"  cy="78"  r="1"   fill="#e8eaf0" opacity="0.5" />
      <circle cx="967"  cy="20"  r="1.5" fill="#e8eaf0" opacity="0.4" />
      <circle cx="1038" cy="52"  r="1"   fill="#e8eaf0" opacity="0.6" />
      <circle cx="1197" cy="38"  r="1"   fill="#e8eaf0" opacity="0.3" />
      <circle cx="1264" cy="67"  r="1.5" fill="#e8eaf0" opacity="0.5" />
      <circle cx="1331" cy="24"  r="1"   fill="#e8eaf0" opacity="0.4" />
      <circle cx="1402" cy="49"  r="1"   fill="#e8eaf0" opacity="0.6" />
      <circle cx="77"   cy="130" r="1"   fill="#e8eaf0" opacity="0.3" />
      <circle cx="145"  cy="158" r="1.5" fill="#e8eaf0" opacity="0.5" />
      <circle cx="219"  cy="105" r="1"   fill="#e8eaf0" opacity="0.4" />
      <circle cx="289"  cy="142" r="1"   fill="#e8eaf0" opacity="0.6" />
      <circle cx="358"  cy="118" r="1.5" fill="#e8eaf0" opacity="0.3" />
      <circle cx="431"  cy="163" r="1"   fill="#e8eaf0" opacity="0.5" />
      <circle cx="503"  cy="124" r="1"   fill="#e8eaf0" opacity="0.4" />
      <circle cx="571"  cy="97"  r="1.5" fill="#e8eaf0" opacity="0.6" />
      <circle cx="643"  cy="151" r="1"   fill="#e8eaf0" opacity="0.3" />
      <circle cx="717"  cy="109" r="1"   fill="#e8eaf0" opacity="0.5" />
      <circle cx="789"  cy="138" r="1.5" fill="#e8eaf0" opacity="0.4" />
      <circle cx="861"  cy="116" r="1"   fill="#e8eaf0" opacity="0.6" />
      <circle cx="933"  cy="157" r="1"   fill="#e8eaf0" opacity="0.3" />
      <circle cx="1005" cy="122" r="1.5" fill="#e8eaf0" opacity="0.5" />
      <circle cx="1077" cy="143" r="1"   fill="#e8eaf0" opacity="0.4" />
      <circle cx="1149" cy="98"  r="1"   fill="#e8eaf0" opacity="0.6" />
      <circle cx="1221" cy="135" r="1.5" fill="#e8eaf0" opacity="0.3" />
      <circle cx="1293" cy="162" r="1"   fill="#e8eaf0" opacity="0.5" />
      <circle cx="1365" cy="119" r="1"   fill="#e8eaf0" opacity="0.4" />
      <circle cx="29"   cy="215" r="1.5" fill="#e8eaf0" opacity="0.6" />
      <circle cx="174"  cy="198" r="1"   fill="#e8eaf0" opacity="0.5" />
      <circle cx="317"  cy="207" r="1"   fill="#e8eaf0" opacity="0.6" />
      <circle cx="487"  cy="219" r="1.5" fill="#e8eaf0" opacity="0.5" />
      <circle cx="672"  cy="202" r="1.5" fill="#e8eaf0" opacity="0.3" />
      <circle cx="814"  cy="223" r="1"   fill="#e8eaf0" opacity="0.4" />
      <circle cx="956"  cy="239" r="1"   fill="#e8eaf0" opacity="0.3" />
      <circle cx="1098" cy="252" r="1.5" fill="#e8eaf0" opacity="0.4" />
      <circle cx="1240" cy="228" r="1"   fill="#e8eaf0" opacity="0.3" />
      <circle cx="1382" cy="203" r="1"   fill="#e8eaf0" opacity="0.4" />
      <circle cx="273"  cy="332" r="1"   fill="#e8eaf0" opacity="0.4" />
      <circle cx="629"  cy="339" r="1"   fill="#e8eaf0" opacity="0.6" />
      <circle cx="1055" cy="319" r="1"   fill="#e8eaf0" opacity="0.5" />

      {/* ── Layer 3: Moon glow (blurred) ──────────────────────────────────── */}
      <circle
        cx="1100"
        cy="120"
        r="130"
        fill="url(#moonGlow)"
        filter="url(#moonBlur)"
      />

      {/* ── Layer 3: Moon ─────────────────────────────────────────────────── */}
      {/* Plain circle, no markings, no craters */}
      <circle cx="1100" cy="120" r="70" fill="#e8eaf0" />

      {/* ── Layer 4: Far treeline (blurred conifer silhouette) ────────────── */}
      {/*
        Jagged zigzag conifers from x=0 to x=1440, tops around y=580, base at y=900.
        Each "tree" is a sharp V-spike. No smooth curves that could read as heads.
      */}
      <path
        d="
          M0,900
          L0,750 L20,680 L40,750
          L50,700 L70,620 L90,700
          L100,660 L120,580 L140,660
          L150,700 L170,630 L190,700
          L200,660 L220,590 L240,660
          L250,700 L270,640 L290,700
          L300,650 L320,575 L340,650
          L350,700 L370,625 L390,700
          L400,660 L420,585 L440,660
          L450,700 L470,635 L490,700
          L500,655 L520,578 L540,655
          L550,700 L570,628 L590,700
          L600,660 L620,580 L640,660
          L650,700 L670,630 L690,700
          L700,655 L720,575 L740,655
          L750,700 L770,625 L790,700
          L800,660 L820,582 L840,660
          L850,695 L870,630 L890,695
          L900,655 L920,578 L940,655
          L950,700 L970,628 L990,700
          L1000,658 L1020,581 L1040,658
          L1050,700 L1070,632 L1090,700
          L1100,660 L1120,582 L1140,660
          L1150,700 L1170,628 L1190,700
          L1200,655 L1220,576 L1240,655
          L1250,700 L1270,626 L1290,700
          L1300,660 L1320,580 L1340,660
          L1350,700 L1370,630 L1390,700
          L1400,655 L1420,578 L1440,650
          L1440,900
          Z
        "
        fill="#0d1117"
        filter="url(#farTreeBlur)"
      />

      {/* ── Layer 5: Fog band ──────────────────────────────────────────────── */}
      {/*
        fogOpacity is controlled by the relief prop (correct-answer feedback).
        The CSS transition for opacity is gated in global.css under
        @media (prefers-reduced-motion: no-preference) via .fog-relief-transition.
      */}
      <rect
        x="-100"
        y="500"
        width="1640"
        height="150"
        fill="url(#fogGradient)"
        className="fog-drift fog-relief-transition"
        style={{ opacity: fogOpacity }}
      />

      {/* ── Layer 6: Near treeline (sharper, taller, darker) ─────────────── */}
      {/*
        Second row of conifer spikes, slightly larger scale, no blur.
        Tops around y=620, base at y=900.
      */}
      <path
        d="
          M0,900
          L0,780 L25,700 L50,780
          L60,720 L85,640 L110,720
          L120,760 L145,672 L170,760
          L180,710 L205,625 L230,710
          L240,760 L265,672 L290,760
          L300,715 L325,632 L350,715
          L360,760 L385,675 L410,760
          L420,710 L445,628 L470,710
          L480,760 L505,672 L530,760
          L540,715 L565,630 L590,715
          L600,760 L625,675 L650,760
          L660,710 L685,626 L710,710
          L720,760 L745,671 L770,760
          L780,712 L805,628 L830,712
          L840,760 L865,675 L890,760
          L900,715 L925,630 L950,715
          L960,760 L985,672 L1010,760
          L1020,710 L1045,626 L1070,710
          L1080,760 L1105,672 L1130,760
          L1140,712 L1165,628 L1190,712
          L1200,760 L1225,673 L1250,760
          L1260,715 L1285,629 L1310,715
          L1320,760 L1345,672 L1370,760
          L1380,710 L1405,627 L1430,710
          L1440,760 L1440,900
          Z
        "
        fill="#0a0d14"
      />
    </svg>
  );
}
