import type { Day, Streak } from './types';

export const INITIAL_STREAK: Streak = { current: 0, best: 0, lastStudyDay: null };

/** Call after a study session on `today`. Idempotent within a day. */
export function recordStudy(s: Streak, today: Day): Streak {
  if (s.lastStudyDay === today) return s;
  const current = s.lastStudyDay === today - 1 ? s.current + 1 : 1;
  return { current, best: Math.max(s.best, current), lastStudyDay: today };
}

/** Call when a new day starts without studying; breaks the streak if a day was skipped. */
export function rollDay(s: Streak, today: Day): Streak {
  if (s.lastStudyDay === null || s.lastStudyDay >= today - 1) return s;
  return { ...s, current: 0 };
}
