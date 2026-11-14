---
inclusion: always
---
# Tech stack and architecture
- React 18 + TypeScript (strict) + Vite. Tests: Vitest + fast-check (property-based).
- Persistence: localStorage via src/engine/storage.ts (versioned JSON).
- Visuals: SVG / Canvas / CSS only. No raster character art.

## Layers (dependencies point downward only)
1. src/engine: pure functions, no I/O, no Date.now, no Math.random. Time is passed in as an
   integer `day` (days since epoch). Randomness is injected.
2. src/presentation: MonsterRenderer interface + implementations (placeholder now, art later).
3. src/ui: React screens. May import engine + presentation.

State is immutable. Every engine function returns new objects.
