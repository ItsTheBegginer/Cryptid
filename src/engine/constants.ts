export const MAX_BOX = 5;
/** The starting Leitner box for newly created cards. */
export const BOX_START = 1;
/** Days until a card is due again, indexed by Leitner box (1..5). */
export const BOX_INTERVAL_DAYS: Readonly<Record<number, number>> = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 14 };

export const MONSTER_MAX = 100;

/*
 * Balance pass — 30-day scenario simulation (confirmed against these constants)
 *
 * Setup
 * -----
 * WENDIGO_HUNGER_PER_MISSED_DAY = 20   (unchanged)
 * WENDIGO_RELIEF_PER_CORRECT    = 3    (unchanged)
 * BANSHEE_WAIL_PER_MISS         = 2    (was 5; see note below)
 * BANSHEE_RELIEF_PER_CORRECT    = 2    (unchanged)
 * MONSTER_MAX                   = 100
 * BOSS_ACTIVE_WINDOW_DAYS       = 14
 * Exam day = 32. 10 cards reviewed per day unless noted.
 *
 * Phase 1 — Days 1–10: daily study, 8 correct + 2 wrong per session
 *   Wendigo net/day: 8 × (−3) = −24 → clamps to 0 immediately (starts at 0).
 *   Banshee net/day: 2 × 2 − 8 × 2 = 4 − 16 = −12 → clamps to 0 immediately.
 *   End of day 10: Wendigo = 0, Banshee = 0.
 *
 * Phase 2 — Days 11–17: 7 consecutive missed days (no study)
 *   Rollover fires one missed-day event per skipped day.
 *   Wendigo after each day: +20/day.
 *   Day 11: 20 | Day 12: 40 | Day 13: 60 | Day 14: 80 | Day 15: 100 (cap).
 *   Days 16–17: stays at 100.
 *   End of day 17: Wendigo = 100, Banshee = 0.
 *
 * Phase 3 — Days 18–20: still no study (3 more missed days)
 *   Wendigo already at 100; remains 100.
 *   Jersey Devil activates on day 18 (exam day 32 − today 18 = 14 = BOSS_ACTIVE_WINDOW_DAYS). ✓
 *
 * Phase 3b — Days 21–24: cramming, 40 cards/day, 12 correct + 28 wrong per session
 *   Rollover on day 21 fires for days 11–20 (10 missed, capped at 10): Wendigo still 100.
 *   Wendigo net/session: 12 × (−3) = −36.
 *     Day 21: 100 − 36 = 64 | Day 22: 64 − 36 = 28 | Day 23: 28 − 36 = 0 (clamp) | Day 24: 0.
 *   Banshee net/session: 28 × 2 − 12 × 2 = 56 − 24 = +32.
 *     Day 21: 0 + 32 = 32 | Day 22: 32 + 32 = 64 | Day 23: 64 + 32 = 96 | Day 24: 96 + 32 = 100 (cap).
 *   End of day 24: Wendigo = 0, Banshee = 100.
 *
 * Phase 4 — Days 25–30: recovery, 10 cards/day, 9 correct + 1 wrong per session
 *   Wendigo: already 0, stays 0 (no missed days, net/session is negative).
 *   Banshee net/session: 1 × 2 − 9 × 2 = 2 − 18 = −16.
 *     Day 25: 100 − 16 = 84 | Day 26: 68 | Day 27: 52 | Day 28: 36 | Day 29: 20 | Day 30: 4.
 *   End of day 30: Wendigo = 0, Banshee = 4.
 *
 * Checks
 * ------
 * 1. Wendigo rises during missed days (days 11–17): 0 → 100. Falls during cramming (12 correct/day × 3
 *    sessions = −36/session): 100 → 0 by day 23. Recovery phase keeps it at 0. ✓
 * 2. Banshee spikes across the full cramming period (days 21–24): 0 → 32 → 64 → 96 → 100.
 *    Falls during recovery to 4 by day 30. ✓
 * 3. Jersey Devil activates on day 18 (32 − 14 = 18). ✓
 *
 * Change from prior constants
 * ---------------------------
 * BANSHEE_WAIL_PER_MISS was 5. With that value, a single cramming session produced
 * 28 × 5 − 12 × 2 = 140 − 24 = +116 per day, capping Banshee instantly. The value is
 * reduced to 2 so the spike builds steadily across the 4-day cramming block instead.
 */
export const WENDIGO_HUNGER_PER_MISSED_DAY = 20;
export const WENDIGO_RELIEF_PER_CORRECT = 3;
export const BANSHEE_WAIL_PER_MISS = 2;
export const BANSHEE_RELIEF_PER_CORRECT = 2;

/** The Jersey Devil only manifests this many days before an exam. */
export const BOSS_ACTIVE_WINDOW_DAYS = 14;
/** A card at or above this box counts as mastered. */
export const MASTERED_BOX = 4;
/** Bigfoot tracks cards not reviewed within this many days. */
export const NEGLECT_THRESHOLD_DAYS = 7;

export const SAVE_VERSION = 1;

/** Milliseconds in one day — used by the UI to convert Date.now() to a day index. */
export const MS_PER_DAY = 86_400_000;

export const MAX_ROLLOVER_DAYS = 30;
