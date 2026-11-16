# Phase 3 Functional UI

All eight required screens are implemented with correctly wired engine calls, immutable state flow, and missed-card retry logic that matches the spec. Daily rollover and defeated-monster updates run on load. No faces, no direct engine imports, no `any`. Manual testing can proceed.

**Watch for:** `onNavigate` and `onStateChange` are recreated on every App render and are listed as useEffect dependencies in StudyScreen. The queue-exhaustion effect fires more often than necessary (confirmed by reading the deps array). Not a functional bug, but worth cleaning up before the next phase.

**Verdict:** APPROVED

## High-level view

The `onNavigate` and `onStateChange` callbacks are defined as plain functions in the App root body. They are recreated on every render and passed to child screens. The study session's queue-exhaustion detector lists `onNavigate` as a dep, so it reruns on every App render while the session is active. `useCallback` with empty deps at the App root would eliminate this.

DeckEditorScreen resets form state on `deckId` change via `useEffect([deckId])`, deliberately excluding `deck?.name` from deps to avoid a reset loop on each rename keystroke. The eslint-disable comment explains the trade-off. The edge case to verify: if a user edits the deck name, the input field holds the uncommitted value until blur/Enter; a navigation away and back resets it, which is the intended behavior.

Session queue construction passes `SESSION_QUEUE_LIMIT = 1000` to `buildQueue` both on the home-screen due-count display and in the session initializer. Prior to the fix commits, the home screen used the default limit of 20, displaying the wrong due-count for large decks. Both call sites now use the same limit.

The study session tracks `correctIds` and `wrongIds` as Sets of card ids rather than incrementing counters on each answer. This means a card missed and then correctly answered on retry counts once in `correctIds`, not once in each. The final results screen totals reflect the per-card outcome rather than the per-event count.

<details>
<summary>Issues (1)</summary>

1. **Unstable callback references** — `handleNavigate` and `handleStateChange` are recreated every render and listed as useEffect deps in child screens; wrap both in `useCallback` with empty deps at the App root.

</details>

<details>
<summary>Details</summary>

## Unstable callback references in App root

`handleNavigate` and `handleStateChange` are defined as plain functions inside the App component body. They are recreated on every render and passed down to every screen component.

The study session's queue-exhaustion detector lists `onNavigate` in its dependency array:

```typescript
useEffect(() => {
  if (session.queue.length > 0 && session.currentIndex >= session.queue.length) {
    onNavigate({ name: 'results', correct: session.correctIds.size, wrong: session.wrongIds.size });
  }
}, [session.currentIndex, session.queue.length, session.correctIds, session.wrongIds, onNavigate]);
```

Because `onNavigate` is a fresh function reference on every App render, this effect re-runs on every state update during the study session. The guard condition becomes false immediately after navigating to results, so the navigation doesn't fire twice. But the effect runs the guard check on every render, and any future change that updates App state mid-session (e.g. a periodic save) will re-run this hook.

Wrapping both handlers in `useCallback` with empty deps fixes this:

```typescript
const handleStateChange = useCallback((next: AppState) => { setState(next); }, []);
const handleNavigate = useCallback((s: Screen) => { setScreen(s); }, []);
```

</details>

<details>
<summary>File map</summary>

**src/engine/constants.ts** — Added `MS_PER_DAY = 86_400_000` for UI clock conversion.

**src/ui/App.tsx** — Replaced minimal shell with 8 screens: Home (deck list, new deck form, two-step reset), Deck Editor (inline rename, exam setter, card list with add/remove, export), Study Session (snapshot queue, once-per-card missed requeue, correct/wrong buttons, navigate to results), Session Results (counts, streak, MonsterPanel), Bestiary (defeated/active/dormant groupings), Progress (per-deck box breakdown + overall totals). MonsterPanel reusable component. Screen discriminated union for navigation. `applyDailyRollover` + `updateDefeated` on load. All engine imports via barrel.

Full diff: `git -C /Users/family/Documents/cryptid-study-quest/.worktrees/phase3-ui diff main...HEAD`

</details>
