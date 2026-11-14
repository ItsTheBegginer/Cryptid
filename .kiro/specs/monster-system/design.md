# Design: Monster System
- Event-driven (Wendigo, Banshee): `reduceMonsters(state, event)` in monsters.ts.
- Derived (Jersey Devil, Bigfoot): computed from cards and today, never stored, so they cannot drift out of sync.
- `monsterViews(state, today)` is the single read model for the UI.
- Rendering seam: `src/presentation/MonsterRenderer.ts`. Placeholder now; real faceless art in Phase 6.
- Planned faceless visuals: Wendigo = creeping antler branches; Banshee = waveform ripple and mist;
  Jersey Devil = storm cloud and wing silhouette; Bigfoot = footprints and swaying trees.
- PBT: bounds for any event sequence; correct answers never increase strength; views in range for any state.
