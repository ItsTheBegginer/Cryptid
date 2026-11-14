import fc from 'fast-check';
import type { AppState, Card, Box, Deck } from '../src/engine';
import { INITIAL_MONSTERS, INITIAL_STREAK } from '../src/engine';

export const boxArb = fc.integer({ min: 1, max: 5 }).map((n) => n as Box);

export const cardArb: fc.Arbitrary<Card> = fc.record({
  id: fc.uuid(),
  deckId: fc.constantFrom('d1', 'd2'),
  prompt: fc.string({ minLength: 1 }),
  answer: fc.string({ minLength: 1 }),
  box: boxArb,
  dueDay: fc.integer({ min: 0, max: 1000 }),
  reviews: fc.nat(50),
  lapses: fc.nat(20),
  lastReviewedDay: fc.option(fc.integer({ min: 0, max: 1000 }), { nil: null }),
});

export const deckArb: fc.Arbitrary<Deck> = fc.record({
  id: fc.constantFrom('d1', 'd2'),
  name: fc.string({ minLength: 1 }),
  examDay: fc.option(fc.integer({ min: 0, max: 1100 }), { nil: null }),
});

export const stateArb: fc.Arbitrary<AppState> = fc.record({
  decks: fc.array(deckArb, { maxLength: 3 }),
  cards: fc.array(cardArb, { maxLength: 30 }),
  streak: fc.constant(INITIAL_STREAK),
  monsters: fc.constant(INITIAL_MONSTERS),
  defeated: fc.constant([]),
});
