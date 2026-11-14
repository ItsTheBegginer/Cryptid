import { MAX_ROLLOVER_DAYS } from './constants';
import { reduceMonsters } from './monsters';
import type { AppState, Day } from './types';

/** Fires missed-day events for every day skipped since lastStudyDay, capped at MAX_ROLLOVER_DAYS. */
export function applyDailyRollover(state: AppState, today: Day): AppState {
  const { lastStudyDay } = state.streak;

  // No skipped days on fresh install, same day, or consecutive days
  const skipped =
    lastStudyDay === null || today - lastStudyDay <= 1
      ? 0
      : Math.min(today - lastStudyDay - 1, MAX_ROLLOVER_DAYS);

  if (skipped === 0) return state;

  let monsters = state.monsters;
  for (let i = 0; i < skipped; i++) {
    monsters = reduceMonsters(monsters, { type: 'dayPassed', studied: false });
  }

  return { ...state, monsters };
}
