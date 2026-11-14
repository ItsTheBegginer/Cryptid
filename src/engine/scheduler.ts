import { BOX_INTERVAL_DAYS, MAX_BOX } from './constants';
import type { Box, Card, Day } from './types';

export const intervalFor = (box: Box): number => BOX_INTERVAL_DAYS[box] ?? 0;

/** Leitner: correct moves up one box (capped); wrong drops to box 1 and returns today. */
export function reviewCard(card: Card, correct: boolean, today: Day): Card {
  const box = (correct ? Math.min(card.box + 1, MAX_BOX) : 1) as Box;
  return {
    ...card,
    box,
    dueDay: today + intervalFor(box),
    reviews: card.reviews + 1,
    lapses: card.lapses + (correct ? 0 : 1),
    lastReviewedDay: today,
  };
}

export const isDue = (card: Card, today: Day): boolean => card.dueDay <= today;
