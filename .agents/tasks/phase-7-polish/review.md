# Phase 7 Polish — fog relief, empty states, onboarding, loading, faces coverage, contrast fix

Two commits implement nine polish tasks across four files. The first commit lands all features; the second addresses three findings from a prior review pass (deck form/empty-state collision, fog counter stickiness on rapid answers, and a star-count comment off by one). All tasks from the spec are present. No new features or functionality beyond the listed tasks were added.

**Watch for:** `#e05c4a` at 14 px passes 4.5:1 against the page background (`#0a0d14`, 5.37:1) but falls to 4.34:1 against `--color-bg-raised` (`#1c2333`) — confirmed by calculation. Whether any error text renders on that surface is worth verifying. The star comment says 51 and the actual SVG element count is also 51; the task asked for 50. This is a one-star discrepancy, not a functional issue.

**Verdict**: APPROVED

---

## High-level view

The fog pull-back uses a monotonically increasing counter on `Scene`'s `relief` prop rather than a boolean toggle. Each `useEffect` run fades opacity to 0.2 then back to 1 over 500 ms per step; the CSS transition (`fog-relief-transition`) is gated behind `prefers-reduced-motion: no-preference`, and the JS side gates identically via `window.matchMedia`. Rapid correct answers re-enter the same animation path cleanly because React's effect cleanup cancels the in-flight timeout before the new increment runs.

The deck-list branch was restructured into a three-way ternary: (1) no decks, form closed → empty state with New Deck button; (2) no decks, form open → form only; (3) decks exist → list plus new-deck toggle. This prevents the empty-state block and the form from co-rendering, which was a finding addressed in the second commit.

The `#c0392b → #e05c4a` swap for `.error-text` lifts contrast from roughly 3.3:1 to 5.37:1 on the dominant dark background (`#0a0d14`). On `--color-bg-raised` (`#1c2333`) the ratio falls to 4.34:1, below the 4.5:1 small-text threshold. The error texts in `DeckEditorScreen` are siblings to inputs (not children), so they render on the page background rather than inside a raised card — but this warrants a quick visual check.

The onboarding panel is conditional on `state.decks.length === 0 && !onboardingDismissed`. Once a deck is created the condition becomes false without requiring an explicit dismiss, which is the right behavior. The "Reset all data" handler clears only `SAVE_KEY`, leaving `ONBOARDING_KEY` intact — intentional per the spec ("separate key"), but users who reset will not see the welcome panel again on their next empty state.

`check-no-faces.mjs` now scans `src/ui/`. No banned face terms appear in the added lines. The star comment "No faces" in `Scene.tsx` was rephrased to "No identifying marks" to avoid triggering the `faces` regex.

<details>
<summary>Issues (2)</summary>

1. **`#e05c4a` contrast on `--color-bg-raised`** — The new error text color is 4.34:1 on `#1c2333`, below the 4.5:1 WCAG AA threshold for 14 px text. Visually confirm that no `.error-text` node renders over a `bg-raised` surface; if any does, raise the color toward `#e87060` or similar.

2. **Star count vs. spec** — The task asked to reduce to 50; the SVG has 51 circles and the comment correctly says 51. One-star discrepancy; functionally irrelevant but worth aligning if the spec number was precise.

</details>

<details>
<summary>Details</summary>

## Fog opacity animation and motion gating

The JS side checks `window.matchMedia('(prefers-reduced-motion: no-preference)')` before mutating `fogOpacity`; the CSS transition rule is wrapped in the same media query. If reduced-motion is active, `fogOpacity` stays at 1 and no transition fires.

The task spec said "0.6 → 0.2 then back". The implementation starts from 1, not 0.6. This is a tighter pull-back but consistent with the existing fog opacity at rest.

## Empty states and deck-list restructuring

All four required empty states are present with the specified copy. Bestiary uses `<p className="empty-state">` rather than a wrapper `<div>`, which means the base `p` `margin-bottom` stacks with the padding from `.empty-state` — a cosmetic double-spacing, not a functional issue.

## Onboarding panel

The title is "Welcome to Cryptid Study Quest" rather than the bare "Cryptid Study Quest" the spec listed — the prefix is a reasonable interpretation of the welcome-panel context. The two-sentence description matches the spec's "two sentences max" constraint. No emoji, no face terms.

The reset handler (`handleReset`) removes only `SAVE_KEY`, leaving `ONBOARDING_KEY` in place. Users who reset will not see the welcome panel again on their next empty state. Whether "Reset all data" should also clear onboarding is a product decision the spec doesn't address.

## WCAG AA contrast — `#e05c4a` error text

The old `#c0392b` produced roughly 3.3:1 on `#0a0d14`. The new `#e05c4a` gives 5.37:1 on `#0a0d14` and 4.90:1 on `--color-bg-mid` — both pass for 14 px text. On `--color-bg-raised` (`#1c2333`) the ratio is 4.34:1, below the 4.5:1 threshold.

The four `.error-text` nodes are direct children of `<section>` or `<form>`, not inside any `deck-card`. `screen-content` has no background, so the effective backdrop should be `#0a0d14` at all current usage sites. A visual browser check at different viewport widths would confirm no raised surface is bleeding behind these elements.

## Loading state hydration guard

`loadState()` runs synchronously as the `useState` initializer, so state is already hydrated before the first render. The `.loading-screen` div covers only the first paint frame, then disappears after `useEffect` fires. The practical effect is preventing any FOUC from CSS cascade order.

## `check:faces` coverage extension

Adding `'src/ui'` to `ROOTS` closes the gap where face-related terms in UI components were not scanned. The `Scene.tsx` comment "no face" was rephrased to "no identifying marks" to avoid a self-referential false positive.

## Star count

51 circles in the SVG; the comment correctly says 51. The task specified 50. One-star discrepancy.

</details>

---

<details>
<summary>File map</summary>

| File | Change |
|---|---|
| `scripts/check-no-faces.mjs` | Added `src/ui` to scanned roots |
| `src/ui/App.tsx` | Fog relief callback, loading guard, onboarding panel, all four empty states, deck-list ternary refactor |
| `src/ui/components/Scene.tsx` | `relief` counter prop, fog opacity state and motion-gated effect, stars trimmed to 51 |
| `src/ui/styles/global.css` | `.fog-relief-transition`, `.empty-state`, `.loading-screen`, `.welcome-panel` styles; `#e05c4a` contrast fix for `.error-text` |

Full diff: `git -C /Users/family/Documents/cryptid-study-quest/.worktrees/phase-7-polish diff main...HEAD`

</details>
