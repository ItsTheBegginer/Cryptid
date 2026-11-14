import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { intervalFor, reviewCard } from '../src/engine';
import { cardArb } from './helpers';

describe('scheduler', () => {
  it('correct answer never lowers the box or shortens the interval', () => {
    fc.assert(fc.property(cardArb, fc.integer({ min: 0, max: 1000 }), (card, today) => {
      const next = reviewCard(card, true, today);
      expect(next.box).toBeGreaterThanOrEqual(card.box);
      expect(intervalFor(next.box)).toBeGreaterThanOrEqual(intervalFor(card.box));
    }));
  });

  it('wrong answer always resets to box 1 and is due today', () => {
    fc.assert(fc.property(cardArb, fc.integer({ min: 0, max: 1000 }), (card, today) => {
      const next = reviewCard(card, false, today);
      expect(next.box).toBe(1);
      expect(next.dueDay).toBe(today);
      expect(next.lapses).toBe(card.lapses + 1);
    }));
  });

  it('never mutates the input card', () => {
    fc.assert(fc.property(cardArb, fc.boolean(), (card, correct) => {
      const copy = structuredClone(card);
      reviewCard(card, correct, 10);
      expect(card).toEqual(copy);
    }));
  });
});
