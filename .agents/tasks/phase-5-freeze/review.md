# Phase 5 functionality freeze — five fixes

Five targeted fixes to `src/ui/App.tsx` and `src/engine/constants.ts`: replace a magic number, clear stale error state on draft removal, harden a user-facing error message, memoize two root callbacks, and rebalance the Banshee constant with a documented scenario simulation.

Watch for: **(confirmed)** the `BANSHEE_WAIL_PER_MISS` comment labels days 18–20 as missed days and cramming as days 21–24, while the task spec calls the entire 18–24 block "cramming days". The math is self-consistent, but future readers comparing the comment to the spec will see the split and may doubt the calculation.

**Verdict**: APPROVED

---

## High-level view

The `box: BOX_START` swap and `setDraftError('')` on Remove are correctness fixes with no observable change today, but they close two silent failure modes: a hardcoded `1` would diverge from the constant if `BOX_START` ever moved, and the stale error banner after removing a draft card gives misleading UI feedback.

The import error message replaces a dynamic `result.error` string with a fixed, field-enumerating message. This prevents internal engine error vocabulary from leaking to users and makes the string stable under engine refactors.

The `useCallback` wrapping of `handleStateChange` and `handleNavigate` is correct. Both close only over `setState` and `setScreen`, which React guarantees stable, so the empty dependency arrays won't produce stale closures.

The balance pass on `BANSHEE_WAIL_PER_MISS` reduces the value from 5 to 2. The old value produced +116 net per cramming session, capping Banshee on day 21 alone. The new value produces +32 per session, giving a four-step ramp across the cramming block. The scenario arithmetic in the comment is internally consistent. The labelling concern: the comment treats days 18–20 as a continuation of the missed-day phase and starts cramming on day 21, whereas the task spec phrases "cramming days 18–24" as a single block. The numbers are correct; the label diverges from the spec wording.

---

<details>
<summary>Issues (1)</summary>

1. **Phase 3 / Phase 3b label mismatch** — The task spec describes "cramming days 18–24" as a single block, but the comment splits it into missed days 18–20 (Phase 3) and cramming 21–24 (Phase 3b). The math is internally correct. Clarify the comment to note that cramming begins on day 21 and explain why the split differs from the spec wording, so future readers don't doubt the calculation.

</details>

---

<details>
<summary>Details</summary>

### Fixed import error message

`importDeck` returns `Result<AppState>`, where the `{ ok: false }` branch previously passed `result.error` directly to the UI. That string is now replaced with a fixed message:

> "Import failed: invalid or unrecognised deck format. Check that prompt, answer, reviews, lapses, and box are all valid."

This matches the task specification verbatim. Beyond spec compliance, it also prevents the engine's internal error vocabulary from reaching the user and keeps the message stable if `importDeck`'s error strings change.

### Balance pass comment labelling

The core tension in the comment is that days 18–20 are described as three additional missed days (Wendigo stays at 100, no study) and cramming only begins on day 21. The task spec uses "cramming days 18–24" as a single phrase. A reader comparing the two will see that the comment's scenario effectively has the student missing days through day 20 before cramming — a stricter scenario than the spec implies. This is a defensible choice (it exercises the rollover-cap behaviour on day 21), but the comment does not explain the discrepancy, leaving the reader to wonder if it's an error.

</details>

---

<details>
<summary>Files changed</summary>

- `src/engine/constants.ts` — added 60-line balance-pass comment; reduced `BANSHEE_WAIL_PER_MISS` from 5 to 2
- `src/ui/App.tsx` — added `useCallback`/`BOX_START` imports; fixed `box: BOX_START`, `setDraftError('')` on Remove, fixed import error message, wrapped `handleStateChange` and `handleNavigate` in `useCallback`

Full diff: `git -C .worktrees/phase-5-freeze diff main...HEAD`

</details>
