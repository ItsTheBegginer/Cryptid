# Phase 2 engine: decks, rollover, updateDefeated

This PR adds the deck management layer (`src/engine/decks.ts`), the daily rollover logic (`src/engine/rollover.ts`), and the defeated-monster tracker (`updateDefeated` in `monsters.ts`). All new engine functions are pure with no I/O imports. The two-commit history shows a first-pass implementation followed by a targeted fix pass that added an `active` guard to `updateDefeated` and per-element card validation to `importDeck`. All 27 tests passed post-fix.

Watch for: **possible** — `importDeck` validates `id`, `deckId`, `dueDay`, and `box` on each imported card but skips `prompt`, `answer`, `reviews`, `lapses`, and `lastReviewedDay`; a crafted import could inject cards with missing display fields that render blank or crash the UI layer. **likely** — the rollover property test always starts wendigo at 0 (from `INITIAL_MONSTERS`), so the `before === MONSTER_MAX` branch of that test never fires; the cap behaviour is untested by property test. **confirmed** — `setExamDay` with `examDay === today` (offset 0) succeeds, which matches the task spec but is worth confirming as intended.

**Verdict**: APPROVED

---

## High-level view

`decks.ts` introduces `Result<T>` as the discriminated union for fallible operations and uses it consistently across `addCard`, `setExamDay`, `exportDeck`, and `importDeck`. All five constraint rules from the task spec (deckId exists, no duplicate id, past date rejection, unknown deckId, no-overwrite on import) are enforced. `removeCard` returns a filtered `AppState` unconditionally, matching the spec's intent (silent no-op if the id is absent).

`importDeck` validates structural shape at two levels: the outer `deck`/`cards` envelope and then each card element for the four fields that engine functions operate on (`id`, `deckId`, `dueDay`, `box`). The fields the UI needs (`prompt`, `answer`, `reviews`, `lapses`, `lastReviewedDay`) are accepted without checking; importing a JSON blob with those fields missing or mistyped produces a structurally valid `AppState` from the engine's perspective but potentially broken data for callers.

`applyDailyRollover` fires `{ type: 'dayPassed', studied: false }` once per skipped day, capped at `MAX_ROLLOVER_DAYS = 30`. It does not update `streak.lastStudyDay`, which is the right scope — that update belongs to the session commit path. Callers must handle both independently.

The session tests cover all three `buildQueue` properties specified in the task. The deck tests cover all four required property scenarios plus three additional unit cases. The rollover test appends to `monsters.test.ts` without touching the existing three tests, but the property test always starts wendigo at 0 (via `stateArb`), so the `before === MONSTER_MAX` branch is dead code in every generated run.

---

<details>
<summary>Issues (2)</summary>

1. **importDeck partial card validation** — `prompt`, `answer`, `reviews`, `lapses`, and `lastReviewedDay` are not validated on import. A malformed JSON blob (e.g. from a different app version or a hand-edited file) can inject cards that pass the engine's guard but render blank or throw in the UI. Add type checks for the remaining `Card` fields, or document that callers must re-validate before display.

2. **Rollover test never exercises the cap** — `stateArb` fixes `monsters` at `INITIAL_MONSTERS` (wendigo: 0), so `before < MONSTER_MAX` is always true in the property test and the `else` branch (`before === MONSTER_MAX`) never runs. Add a variant that seeds wendigo at `MONSTER_MAX` to confirm that capped state is returned unchanged.

</details>

<details>
<summary>Details</summary>

### importDeck partial card validation

The second commit added validation for `id: string`, `deckId: string`, `dueDay: number`, and `box in 1..5`. The full `Card` interface also requires `prompt: string`, `answer: string`, `reviews: number`, `lapses: number`, and `lastReviewedDay: Day | null`. None of those are checked. A well-crafted import with those fields absent or mistyped will pass `importDeck`'s guard and enter `state.cards` as a `Card` by TypeScript cast. Engine functions that read `lastReviewedDay` (e.g. `bigfootView`) and `box` downstream will behave unexpectedly on `undefined` values. This is confirmed by reading lines 56–68 of `decks.ts`.

### Rollover test coverage gap

In `tests/monsters.test.ts`, `stateArb` uses `fc.constant(INITIAL_MONSTERS)`, which is `{ wendigo: 0, banshee: 0 }`. The rollover property test checks:

```ts
if (before < MONSTER_MAX) {
  expect(after.monsters.wendigo).toBeGreaterThan(before);
} else {
  expect(after.monsters.wendigo).toBe(MONSTER_MAX);
}
```

Because `before` is always 0, the `else` branch is dead code for every generated case. The cap logic in `applyDailyRollover` (the `Math.min(..., MAX_ROLLOVER_DAYS)` and the `clamp` inside `reduceMonsters`) is exercised indirectly through the loop, but the property that "a fully-maxed wendigo stays at MONSTER_MAX after rollover" is never asserted. It's a low-risk gap but easy to close with a fixed-input test.

</details>

---

<details>
<summary>File map</summary>

| File | Change |
|---|---|
| `src/engine/decks.ts` | New file: `Result<T>` type + `createDeck`, `addCard`, `removeCard`, `setExamDay`, `exportDeck`, `importDeck` |
| `src/engine/rollover.ts` | New file: `applyDailyRollover` |
| `src/engine/monsters.ts` | Added `updateDefeated` |
| `src/engine/constants.ts` | Added `MAX_ROLLOVER_DAYS = 30` |
| `src/engine/index.ts` | Re-exports `decks` and `rollover` |
| `tests/decks.test.ts` | New file: 8 property + unit tests for deck operations |
| `tests/session.test.ts` | New file: 3 property tests for `buildQueue` |
| `tests/monsters.test.ts` | Appended `applyDailyRollover` property test |

Full diff: `git -C /Users/family/Documents/cryptid-study-quest/.worktrees/phase2-engine diff main...HEAD`

</details>
