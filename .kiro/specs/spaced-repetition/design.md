# Design: Spaced Repetition
- Implemented in `src/engine/scheduler.ts` and `session.ts` (already scaffolded).
- Intervals (days) by box 1..5: 0, 1, 3, 7, 14 (see constants.ts).
- Time is an injected integer `day`; the UI computes it once per session.
- Future option: swap to SM-2 behind the same `reviewCard` signature.
- PBT: monotonic interval on correct, reset on wrong, immutability.
