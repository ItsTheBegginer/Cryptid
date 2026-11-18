import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { parsePlainText, BOX_START } from '../src/engine';

/** Deterministic id factory — avoids crypto.randomUUID() in tests. */
function makeCounter(): () => string {
  let n = 0;
  return () => `id-${++n}`;
}

describe('parsePlainText', () => {
  it('returns [] for blank or all-whitespace input', () => {
    expect(parsePlainText('', 'deck1', 0, makeCounter())).toEqual([]);
    expect(parsePlainText('   ', 'deck1', 0, makeCounter())).toEqual([]);
    expect(parsePlainText('\n\n\n', 'deck1', 0, makeCounter())).toEqual([]);
  });

  it('lines with no colon produce no cards', () => {
    const cards = parsePlainText('no colon here\nalso no colon', 'deck1', 5, makeCounter());
    expect(cards).toEqual([]);
  });

  it('a line with multiple colons splits on the first colon only', () => {
    const cards = parsePlainText('term: def: extra stuff', 'deck1', 0, makeCounter());
    expect(cards).toHaveLength(1);
    expect(cards.at(0)?.prompt).toBe('term');
    expect(cards.at(0)?.answer).toBe('def: extra stuff');
  });

  it('every returned card has box=1, dueDay=today, reviews=0, lapses=0, lastReviewedDay=null', () => {
    fc.assert(
      fc.property(
        fc.array(
          // Generate valid "term: definition" strings
          fc.tuple(
            fc.string({ minLength: 1 }).filter((s) => !s.includes(':') && s.trim().length > 0),
            fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          ),
          { minLength: 1, maxLength: 20 },
        ),
        fc.integer({ min: 0, max: 10_000 }),
        (pairs, today) => {
          const text = pairs.map(([t, d]) => `${t}:${d}`).join('\n');
          const cards = parsePlainText(text, 'deck1', today, makeCounter());
          for (const card of cards) {
            expect(card.box).toBe(1);
            expect(card.dueDay).toBe(today);
            expect(card.reviews).toBe(0);
            expect(card.lapses).toBe(0);
            expect(card.lastReviewedDay).toBeNull();
          }
        },
      ),
    );
  });

  it('output length never exceeds input line count', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string(), { maxLength: 50 }),
        fc.integer({ min: 0, max: 10_000 }),
        (lines, today) => {
          const text = lines.join('\n');
          const cards = parsePlainText(text, 'deck1', today, makeCounter());
          expect(cards.length).toBeLessThanOrEqual(lines.length);
        },
      ),
    );
  });

  it('a valid single line produces the expected card shape', () => {
    const cards = parsePlainText('capital of France: Paris', 'geo', 42, makeCounter());
    expect(cards).toHaveLength(1);
    expect(cards[0]).toMatchObject({
      deckId: 'geo',
      prompt: 'capital of France',
      answer: 'Paris',
      box: BOX_START,
      dueDay: 42,
      reviews: 0,
      lapses: 0,
      lastReviewedDay: null,
    });
  });

  it('blank lines between valid lines are skipped without affecting output', () => {
    const text = '\nterm1: ans1\n\nterm2: ans2\n';
    const cards = parsePlainText(text, 'deck1', 0, makeCounter());
    expect(cards).toHaveLength(2);
    expect(cards.at(0)?.prompt).toBe('term1');
    expect(cards.at(1)?.prompt).toBe('term2');
  });
});
