import { SAVE_VERSION } from './constants';
import { INITIAL_MONSTERS } from './monsters';
import { INITIAL_STREAK } from './streak';
import type { AppState } from './types';

export const emptyState = (): AppState => ({
  decks: [], cards: [], streak: INITIAL_STREAK, monsters: INITIAL_MONSTERS, defeated: [],
});

export const serialize = (state: AppState): string => JSON.stringify({ v: SAVE_VERSION, state });

/** Returns null for corrupt or unknown-version data so the caller can fall back safely. */
export function deserialize(raw: string): AppState | null {
  try {
    const parsed = JSON.parse(raw) as { v?: number; state?: AppState };
    if (parsed.v !== SAVE_VERSION || !parsed.state) return null;
    const s = parsed.state;
    if (!Array.isArray(s.decks) || !Array.isArray(s.cards) || !s.streak || !s.monsters) return null;
    return s;
  } catch {
    return null;
  }
}
