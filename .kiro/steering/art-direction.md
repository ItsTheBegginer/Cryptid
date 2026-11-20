---
inclusion: manual
---
# Art Direction: Cryptid Study Quest

Status: ACTIVE — applies from Phase 6 onward. All visual work must follow these rules.
See `no-faces.md` for the hard rule on faces; this document covers everything else.

---

## Concept

The app is a haunted study hall. The student is alone at a desk in a forest clearing at night.
Monsters live at the edges — in the fog, the branches, the dark water. They are never seen directly.
Good study habits push them back; neglect lets them creep closer. The world reacts to the student's
choices, not to a score.

---

## Colour palette

| Role | Value | Use |
|---|---|---|
| Background deep | `#0a0d14` | Page background, deepest layer |
| Background mid | `#111827` | Card surfaces, panels |
| Background raised | `#1c2333` | Inputs, elevated cards |
| Fog | `#1e2d3d` | Fog layer, translucent overlays |
| Moon white | `#e8eaf0` | Primary text, moon glow |
| Bone | `#c9cdd8` | Secondary text, labels |
| Mist | `#6b7a99` | Placeholder text, disabled states |
| Blood red | `#c0392b` | Danger: high monster strength, wrong answer flash |
| Ember | `#e67e22` | Warning: approaching exam, rising strength |
| Sage | `#2ecc71` | Relief: correct answer, strength dropping, defeated badge |
| Frost blue | `#5dade2` | Accent: streak, progress bars, links |

No white backgrounds. No bright colours outside the accent roles above. When in doubt, go darker.

---

## Typography

- **Headings:** a serif or slab-serif with slightly uneven weight — suggest old field-notes or a
  naturalist's journal. Fall back to Georgia or a system serif. Never comic or display-script.
- **Body / UI:** a clean sans-serif (system-ui or Inter). Legibility over atmosphere for interactive
  elements.
- **Sizes:** establish a scale (e.g. 12 / 14 / 16 / 20 / 28 / 40px). No arbitrary sizes.
- **Contrast:** all text must pass WCAG AA (4.5:1 for body, 3:1 for large text) against its
  background. Use moon white on deep background; bone on mid background.

---

## Scene layers (home and results screens)

Build the background as stacked SVG/CSS layers, painted back to front:

1. **Sky** — deep `#0a0d14`, faint star-scatter (static SVG dots, no animation under reduced-motion).
2. **Moon** — large off-centre circle, `#e8eaf0` with a soft radial glow; never a face shape, no craters.
3. **Far treeline** — silhouette of dense conifers, `#0d1117`, slightly blurred.
4. **Fog band** — a translucent `#1e2d3d` gradient that drifts slowly left/right (CSS keyframe,
   paused under `prefers-reduced-motion`).
5. **Near treeline** — darker silhouette, slightly larger scale.
6. **Ground** — flat dark strip. Cards and UI panels sit here.

Parallax: on mouse-move or device-tilt (optional), layers shift at different rates (far = slow,
near = fast). Disable under `prefers-reduced-motion`.

---

## Monster visual language

Each monster is a **presence**, not a creature. No outlines, no bodies, no faces (see `no-faces.md`).
Strength maps to how far the presence encroaches on the screen.

### Wendigo — Hunger from skipped days
- Bare antler branches creeping in from the top corners of the screen.
- At strength 0: branches are absent or barely visible at the very edge.
- At strength 100: branches fill the top third, overlapping the UI.
- Branch SVG paths animate growth with `stroke-dashoffset` (paused under reduced-motion).
- Colour: `#1a0a00` (near-black brown) with a faint `#4a2500` glow at the tips.

### Banshee — Wrong answers
- A waveform ribbon across the bottom of the screen, like a sound visualiser.
- At strength 0: flat line, nearly invisible.
- At strength 100: tall, jagged, agitated wave that shakes the bottom UI elements.
- Colour: near-white `#dce8f0` with low opacity (0.15 at rest, up to 0.6 at max strength).
- On a wrong answer: a single ripple pulse animates outward from the card (200 ms, paused under
  reduced-motion).

### Jersey Devil — Exam pressure
- A storm-cloud silhouette in the upper-right, with a faint wing shape visible in the cloud mass.
- Active only within 14 days of an exam. Dormant = cloud is absent.
- Strength maps to cloud size and darkness; lightning is a soft internal glow, never a sharp stroke.
- Colour: `#1c1f2e` cloud body, `#5dade2` internal glow at high strength.
- No hard edges on the lightning — use a blurred radial gradient pulsing in opacity.

### Bigfoot — Neglected cards
- Footprints on the ground layer, leading off the right edge of the screen.
- At strength 0: no prints.
- At strength 100: a full trail of deep prints, with swaying tall grass drawn as SVG lines on either side.
- Colour: `#111827` prints on `#0a0d14` ground (subtle; presence felt more than seen).
- Grass sway: CSS keyframe, staggered per blade (paused under reduced-motion).

---

## Feedback animations

| Event | Animation | Duration | Reduced-motion fallback |
|---|---|---|---|
| Correct answer | Card slides left and fades; fog pulls back slightly | 300 ms | Instant swap |
| Wrong answer | Card shakes horizontally; Banshee ripple | 200 ms | Instant swap, no ripple |
| Monster defeated | Monster presence dissolves (opacity 1 → 0, blur increases) | 600 ms | Instant hide |
| Streak milestone | Frost-blue pulse on the streak counter | 400 ms | None |

All animations are CSS transitions or keyframes. No JS animation libraries.

---

## Sound (stretch goal, Phase 6 end)

- Ambient loop: low wind, distant rustling. Volume 20% default.
- Banshee wail: played on wrong answer (not on every wrong, only when Banshee is active).
- Thunder rumble: played when Jersey Devil strength increases.
- Mute toggle: persistent in localStorage, visible on every screen.
- All audio is disabled by default if `prefers-reduced-motion` is set (motion and audio often
  correlate with vestibular sensitivity).

---

## Component-level rules

- **Cards:** dark surface (`#1c2333`), 8 px border-radius, a 1 px border in `#2a3550`. Slight
  drop-shadow. The prompt text is in heading style; the answer is in body style.
- **Buttons:** filled = blood-red or frost-blue depending on role; outlined = bone border, transparent
  fill. No rounded pill shapes — use 4 px radius to feel grounded, not bubbly.
- **Progress bars:** `<progress>` elements styled with the fog-to-blood-red gradient. Low strength =
  frost-blue; high strength = ember → blood-red.
- **Monster strength bars:** same gradient. Active label in ember; Dormant in mist.
- **Inputs:** dark fill (`#1c2333`), bone border on focus, no glowing blue browser default outline.
- **Spacing:** 4 px base unit. Prefer multiples of 4.

---

## Accessibility constraints

- `prefers-reduced-motion`: all CSS animations and transitions must be wrapped in
  `@media (prefers-reduced-motion: no-preference)` or disabled via a class. The app must be fully
  usable with zero motion.
- No strobing: any repeating flash must be < 3 Hz and low-contrast. Lightning is a slow pulse, never
  a snap.
- Contrast: verify with a contrast checker before shipping. Blood-red on deep background fails AA
  for body text — use it only for large text, icons, and decorative elements.
- Focus indicators: visible on all interactive elements. Use a frost-blue 2 px outline offset.

---

## What not to do

- No gradients that go bright → bright (keep one end always dark).
- No neon or oversaturated colours.
- No clip-art, stock icons, or raster images anywhere in the UI.
- No emoji with faces (see `no-faces.md`).
- No drop shadows that make elements look lifted off a bright surface — this is a dark world.
- No bounce or spring easing — use ease-in-out or linear for a heavier, deliberate feel.
