import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { INITIAL_MONSTERS, MONSTER_MAX, monsterViews, reduceMonsters, type MonsterEvent } from '../src/engine';
import { stateArb } from './helpers';

const eventArb: fc.Arbitrary<MonsterEvent> = fc.oneof(
  fc.boolean().map((correct) => ({ type: 'answer', correct }) as const),
  fc.boolean().map((studied) => ({ type: 'dayPassed', studied }) as const),
);

describe('monsters', () => {
  it('event-driven strengths always stay within 0..MONSTER_MAX', () => {
    fc.assert(fc.property(fc.array(eventArb, { maxLength: 200 }), (events) => {
      const m = events.reduce(reduceMonsters, INITIAL_MONSTERS);
      for (const v of Object.values(m)) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(MONSTER_MAX);
      }
    }));
  });

  it('a correct answer never increases any monster', () => {
    fc.assert(fc.property(fc.array(eventArb, { maxLength: 50 }), (events) => {
      const before = events.reduce(reduceMonsters, INITIAL_MONSTERS);
      const after = reduceMonsters(before, { type: 'answer', correct: true });
      expect(after.wendigo).toBeLessThanOrEqual(before.wendigo);
      expect(after.banshee).toBeLessThanOrEqual(before.banshee);
    }));
  });

  it('every derived monster view is in range, for any state', () => {
    fc.assert(fc.property(stateArb, fc.integer({ min: 0, max: 1100 }), (state, today) => {
      const views = monsterViews(state, today);
      expect(views).toHaveLength(4);
      for (const v of views) {
        expect(v.strength).toBeGreaterThanOrEqual(0);
        expect(v.strength).toBeLessThanOrEqual(MONSTER_MAX);
      }
    }));
  });
});
