import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { buildQueue } from '../src/engine';
import { cardArb } from './helpers';

describe('session – buildQueue', () => {
  it('only due cards are included (every result card has dueDay <= today)', () => {
    fc.assert(
      fc.property(fc.array(cardArb, { maxLength: 30 }), fc.integer({ min: 0, max: 1000 }), (cards, today) => {
        const queue = buildQueue(cards, today);
        for (const card of queue) {
          expect(card.dueDay).toBeLessThanOrEqual(today);
        }
      }),
    );
  });

  it('result length never exceeds the limit argument', () => {
    fc.assert(
      fc.property(
        fc.array(cardArb, { maxLength: 50 }),
        fc.integer({ min: 0, max: 1000 }),
        fc.integer({ min: 0, max: 30 }),
        (cards, today, limit) => {
          const queue = buildQueue(cards, today, limit);
          expect(queue.length).toBeLessThanOrEqual(limit);
        },
      ),
    );
  });

  it('result is sorted by dueDay ascending, ties broken by id lexicographic order', () => {
    fc.assert(
      fc.property(fc.array(cardArb, { maxLength: 30 }), fc.integer({ min: 0, max: 1000 }), (cards, today) => {
        const queue = buildQueue(cards, today);
        for (let i = 1; i < queue.length; i++) {
          const prev = queue[i - 1]!;
          const curr = queue[i]!;
          const dueDiff = prev.dueDay - curr.dueDay;
          // Earlier entries must have smaller (or equal) dueDay
          expect(dueDiff).toBeLessThanOrEqual(0);
          // On equal dueDay, id must be lexicographically non-decreasing
          if (dueDiff === 0) {
            expect(prev.id.localeCompare(curr.id)).toBeLessThanOrEqual(0);
          }
        }
      }),
    );
  });
});
