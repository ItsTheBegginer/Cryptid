import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { INITIAL_STREAK, recordStudy, rollDay, type Streak } from '../src/engine';

const streakArb: fc.Arbitrary<Streak> = fc
  .record({ current: fc.nat(100), extra: fc.nat(100), last: fc.option(fc.integer({ min: 0, max: 500 }), { nil: null }) })
  .map(({ current, extra, last }) => ({ current, best: current + extra, lastStudyDay: last }));

describe('streak', () => {
  it('rolling a day without studying never increases the streak', () => {
    fc.assert(fc.property(streakArb, fc.integer({ min: 0, max: 600 }), (s, today) => {
      expect(rollDay(s, today).current).toBeLessThanOrEqual(s.current);
    }));
  });

  it('recording study twice on the same day is idempotent', () => {
    fc.assert(fc.property(streakArb, fc.integer({ min: 0, max: 600 }), (s, day) => {
      const once = recordStudy(s, day);
      expect(recordStudy(once, day)).toEqual(once);
    }));
  });

  it('best is never below current', () => {
    fc.assert(fc.property(fc.array(fc.integer({ min: 0, max: 5 }), { maxLength: 60 }), (gaps) => {
      let day = 0;
      let s = INITIAL_STREAK;
      for (const g of gaps) { day += g; s = recordStudy(rollDay(s, day), day); expect(s.best).toBeGreaterThanOrEqual(s.current); }
    }));
  });

  it('studying on consecutive days builds the streak', () => {
    let s = INITIAL_STREAK;
    [10, 11, 12].forEach((d) => { s = recordStudy(s, d); });
    expect(s.current).toBe(3);
  });
});
