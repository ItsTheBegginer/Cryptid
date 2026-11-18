import type { Card, Day } from './types';
import { BOX_START } from './constants';

/**
 * Parse a plain-text note dump into Card objects.
 *
 * Lines must contain at least one colon. The first colon is the split point:
 * everything before it becomes `prompt`, everything after becomes `answer`.
 * Lines with no colon, and blank lines, are silently ignored.
 *
 * No I/O, no Date.now, no Math.random — all non-determinism is injected.
 */
export function parsePlainText(
  text: string,
  deckId: string,
  today: Day,
  makeId: () => string,
): Card[] {
  if (text.trim().length === 0) return [];

  const cards: Card[] = [];

  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (line.length === 0) continue;

    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const prompt = line.slice(0, colonIndex).trim();
    const answer = line.slice(colonIndex + 1).trim();

    // Both sides must be non-empty after trimming
    if (prompt.length === 0 || answer.length === 0) continue;

    cards.push({
      id: makeId(),
      deckId,
      prompt,
      answer,
      box: BOX_START,
      dueDay: today,
      reviews: 0,
      lapses: 0,
      lastReviewedDay: null,
    });
  }

  return cards;
}
