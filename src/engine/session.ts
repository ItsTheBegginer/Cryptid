import { isDue } from './scheduler';
import type { Card, Day } from './types';

/** Due cards, most overdue first, ties broken by id for determinism. */
export function buildQueue(cards: Card[], today: Day, limit = 20): Card[] {
  return cards
    .filter((c) => isDue(c, today))
    .sort((a, b) => a.dueDay - b.dueDay || a.id.localeCompare(b.id))
    .slice(0, limit);
}
