# Phase 4 — Content input: plain-text import and JSON import

This change adds two ways to get cards into a deck: paste raw notes (`term: definition` per line) and import a JSON deck export. `parsePlainText` is a new pure engine function that splits lines on the first colon and returns `Card[]` with all fields initialised to their starting values. `importDeck` gains stricter validation that now checks `prompt`, `answer`, `reviews`, `lapses`, and `lastReviewedDay` in addition to the previously checked structural fields. The DeckEditorScreen gains the UI for both flows, plus a draft-card editing step between generation and persistence.

Watch for: a magic-number `box: 1` in `handleAddCard` that is pre-existing but left unaddressed; a test-factory call pattern that is correct but easy to misread; and a stale error display in the draft list after "Remove".

**Verdict**: APPROVED

---

## High-level view

`parsePlainText` is a pure function with all non-determinism injected via `makeId`. The two-pass approach (parse into draft, then edit and save) gives users a correction step before anything touches persistent state.

The `importDeck` validator fills in the semantic gaps left by the original structural checks — empty strings, non-integer counts, negative values. One gap remains: the error message is the same for every validation failure (`'Invalid card in import: missing required fields'`), so a user hitting a semantic failure like `reviews: -1` gets no actionable information.

The draft save loop stops on the first `addCard` error and surfaces the message, but `onStateChange` is never called on failure, so no partial state is committed. The stale `draftError` after a "Remove" click is the one UX rough edge: after a failed "Save all", removing the offending card leaves the error message visible.

The `makeCounter()` factory in the generate tests is called once per call site, which correctly returns a fresh `() => string`. The pattern is functionally right but visually looks like a pre-invoked string is being passed — a comment at the first use would prevent a future reader from introducing a shared-counter bug.

---

<details>
<summary>Issues (3)</summary>

1. **Magic number `box: 1` in `handleAddCard`** — pre-existing in `main`, but this PR introduces `BOX_START` and migrates `generate.ts` without updating `handleAddCard`. Replace `box: 1` with `BOX_START` to complete the migration. (confirmed)

2. **Stale `draftError` after removing a card** — the "Remove" handler does not call `setDraftError('')`. After a failed "Save all", removing the bad card leaves the error message visible until the user clicks "Save all" again. (confirmed)

3. **`makeCounter()` call site looks like a string argument** — `parsePlainText` expects `makeId: () => string`; tests pass `makeCounter()`, which correctly returns a fresh factory. A future reader may read this as a pre-invoked string and introduce a shared-counter bug. Add a brief comment at the first use site. (likely)

</details>

<details>
<summary>Details</summary>

### Generic error message in `importDeck`

All thirteen validation conditions in the new guard block return the same error string: `'Invalid card in import: missing required fields'`. For structural failures (missing `id`, wrong type for `box`) this is accurate. For semantic failures — `reviews: -1`, `lapses: 1.5`, `prompt: ''` — the message is misleading. A user who exports a deck, hand-edits a field value, and tries to re-import gets no indication of which field is wrong or why. This is not a correctness gap (the import fails safely), but it will generate support noise if users ever share decks as JSON.

### Test gaps in `generate.test.ts`

Not tested: lines where only the prompt side is empty after trimming (e.g. `: answer`); `\r\n` line endings (the split is on `\n` only; `\r` survives into `raw` and is then stripped by `raw.trim()`, so the behaviour is correct but untested); a `deckId` argument that itself contains a colon.

</details>

---

<details>
<summary>Files changed</summary>

- `src/engine/constants.ts` — added `BOX_START = 1`
- `src/engine/generate.ts` — new `parsePlainText` function
- `src/engine/index.ts` — re-exported `generate.ts`
- `src/engine/decks.ts` — extended card validation in `importDeck`
- `src/ui/App.tsx` — added Import JSON and Paste notes sections to `DeckEditorScreen`
- `tests/generate.test.ts` — new test file for `parsePlainText`
- `tests/decks.test.ts` — five new unit tests for `importDeck` validation

Full diff: `git -C /Users/family/Documents/cryptid-study-quest/.worktrees/phase4-content-input diff main...HEAD`

</details>
