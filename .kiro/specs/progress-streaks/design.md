# Design: Progress, Streaks, Persistence
- `streak.ts`: `recordStudy` (idempotent per day) and `rollDay` (break on gap).
- `storage.ts`: versioned JSON envelope `{ v, state }`; `deserialize` returns null on any problem.
- UI layer owns localStorage reads/writes and the clock; engine stays pure.
- PBT: idempotence, best >= current, round-trip identity, no-throw on arbitrary strings.
