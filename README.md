# Cryptid Study Quest

Study habits, mirrored by faceless cryptids. Correct answers and steady streaks weaken the monsters;
cramming and neglect feed them. Built for **Kiroween 2026** (Costume Contest) with Kiro.

> Status: Phase 2 (engine) in progress. Functionality first, art second.

## Run it
```bash
npm install
npm run dev          # start the app
npm test             # property-based + unit tests
npm run typecheck
npm run check:faces  # enforce the no-faces rule on visuals
```

## Architecture
```
src/engine/        pure game logic (no UI, no clock, no randomness)
src/presentation/  MonsterRenderer seam: placeholder now, real art in Phase 6
src/ui/            React screens (own the clock and localStorage)
tests/             Vitest + fast-check property tests
.kiro/             steering, hooks, specs (required by Kiroween; never gitignore)
```

## Monsters (all faceless)
| Monster | Reflects | Driven by |
|---|---|---|
| Wendigo | Hunger from skipped days | events |
| Banshee | Wrong answers | events |
| Jersey Devil | Exam readiness (active within 14 days) | derived |
| Bigfoot | Neglected cards | derived |

## Roadmap
- [x] Phase 0: repo, license, steering, hooks
- [x] Phase 1: specs for 4 features
- [~] Phase 2: engine + property tests (scaffolded, see `.kiro/specs/*/tasks.md`)
- [ ] Phase 3: functional UI -> Phase 4: content input -> Phase 5: freeze (`functional-v1`)
- [ ] Phase 6: art transformation -> Phase 7: polish -> Phase 8: submit (Dec 3)

## License
MIT
