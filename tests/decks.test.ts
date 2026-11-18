import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  addCard,
  createDeck,
  emptyState,
  exportDeck,
  importDeck,
  removeCard,
  setExamDay,
} from '../src/engine';
import { cardArb, deckArb } from './helpers';

describe('decks', () => {
  it('addCard rejects cards whose deckId is not in state.decks', () => {
    fc.assert(
      fc.property(cardArb, (card) => {
        // emptyState has no decks, so any card's deckId is always absent
        const result = addCard(emptyState(), card);
        expect(result.ok).toBe(false);
      }),
    );
  });

  it('addCard rejects duplicate card ids', () => {
    fc.assert(
      fc.property(cardArb, (card) => {
        const deck = createDeck(card.deckId, 'Test');
        const state = { ...emptyState(), decks: [deck], cards: [card] };
        const result = addCard(state, card);
        expect(result.ok).toBe(false);
      }),
    );
  });

  it('addCard with a valid card adds it and does not change decks', () => {
    fc.assert(
      fc.property(cardArb, (card) => {
        const deck = createDeck(card.deckId, 'Test');
        const state = { ...emptyState(), decks: [deck] };
        const result = addCard(state, card);
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.cards).toContainEqual(card);
          expect(result.value.decks).toEqual(state.decks);
        }
      }),
    );
  });

  it('setExamDay rejects past exam dates (examDay < today)', () => {
    fc.assert(
      fc.property(deckArb, fc.integer({ min: 1, max: 1000 }), (deck, today) => {
        const state = { ...emptyState(), decks: [deck] };
        // examDay strictly less than today
        const examDay = today - 1;
        const result = setExamDay(state, deck.id, examDay, today);
        expect(result.ok).toBe(false);
      }),
    );
  });

  it('setExamDay accepts today and future dates', () => {
    fc.assert(
      fc.property(deckArb, fc.integer({ min: 0, max: 1000 }), fc.integer({ min: 0, max: 500 }), (deck, today, offset) => {
        const state = { ...emptyState(), decks: [deck] };
        const examDay = today + offset;
        const result = setExamDay(state, deck.id, examDay, today);
        expect(result.ok).toBe(true);
      }),
    );
  });

  it('setExamDay rejects unknown deckId', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1000 }), (today) => {
        const result = setExamDay(emptyState(), 'nonexistent', today + 1, today);
        expect(result.ok).toBe(false);
      }),
    );
  });

  it('exportDeck then importDeck into a fresh state is identity for the deck and its cards', () => {
    fc.assert(
      fc.property(cardArb, (card) => {
        const deck = createDeck(card.deckId, 'Export Test');
        const state = { ...emptyState(), decks: [deck], cards: [card] };
        const exported = exportDeck(state, deck.id);
        expect(exported.ok).toBe(true);
        if (!exported.ok) return;

        const imported = importDeck(emptyState(), exported.value);
        expect(imported.ok).toBe(true);
        if (!imported.ok) return;

        expect(imported.value.decks).toContainEqual(deck);
        expect(imported.value.cards).toContainEqual(card);
      }),
    );
  });

  it('importDeck skips deck and card ids that already exist', () => {
    fc.assert(
      fc.property(cardArb, (card) => {
        const deck = createDeck(card.deckId, 'Original');
        const state = { ...emptyState(), decks: [deck], cards: [card] };
        const exported = exportDeck(state, deck.id);
        expect(exported.ok).toBe(true);
        if (!exported.ok) return;

        // Import into a state that already has the same deck and card
        const result = importDeck(state, exported.value);
        expect(result.ok).toBe(true);
        if (!result.ok) return;

        // No duplication — counts must stay the same
        const deckCount = result.value.decks.filter((d) => d.id === deck.id).length;
        const cardCount = result.value.cards.filter((c) => c.id === card.id).length;
        expect(deckCount).toBe(1);
        expect(cardCount).toBe(1);
      }),
    );
  });

  it('removeCard leaves no card with that id in state.cards', () => {
    fc.assert(
      fc.property(cardArb, fc.array(cardArb, { maxLength: 10 }), (card, otherCards) => {
        const allCards = [card, ...otherCards];
        const state = { ...emptyState(), cards: allCards };
        const after = removeCard(state, card.id);
        expect(after.cards.some((c) => c.id === card.id)).toBe(false);
      }),
    );
  });

  it('importDeck returns err on invalid JSON', () => {
    const result = importDeck(emptyState(), 'not json at all');
    expect(result.ok).toBe(false);
  });

  it('importDeck returns err on JSON missing deck or cards fields', () => {
    const result = importDeck(emptyState(), JSON.stringify({ deck: { id: 'x', name: 'y', examDay: null } }));
    expect(result.ok).toBe(false);
  });

  it('importDeck rejects a card with an empty prompt', () => {
    const payload = JSON.stringify({
      deck: { id: 'd1', name: 'D', examDay: null },
      cards: [{ id: 'c1', deckId: 'd1', prompt: '', answer: 'answer', box: 1, dueDay: 0, reviews: 0, lapses: 0, lastReviewedDay: null }],
    });
    expect(importDeck(emptyState(), payload).ok).toBe(false);
  });

  it('importDeck rejects a card with an empty answer', () => {
    const payload = JSON.stringify({
      deck: { id: 'd1', name: 'D', examDay: null },
      cards: [{ id: 'c1', deckId: 'd1', prompt: 'prompt', answer: '', box: 1, dueDay: 0, reviews: 0, lapses: 0, lastReviewedDay: null }],
    });
    expect(importDeck(emptyState(), payload).ok).toBe(false);
  });

  it('importDeck rejects a card with negative reviews', () => {
    const payload = JSON.stringify({
      deck: { id: 'd1', name: 'D', examDay: null },
      cards: [{ id: 'c1', deckId: 'd1', prompt: 'p', answer: 'a', box: 1, dueDay: 0, reviews: -1, lapses: 0, lastReviewedDay: null }],
    });
    expect(importDeck(emptyState(), payload).ok).toBe(false);
  });

  it('importDeck rejects a card with a float lapses value', () => {
    const payload = JSON.stringify({
      deck: { id: 'd1', name: 'D', examDay: null },
      cards: [{ id: 'c1', deckId: 'd1', prompt: 'p', answer: 'a', box: 1, dueDay: 0, reviews: 0, lapses: 1.5, lastReviewedDay: null }],
    });
    expect(importDeck(emptyState(), payload).ok).toBe(false);
  });

  it('importDeck rejects a card with a negative lastReviewedDay', () => {
    const payload = JSON.stringify({
      deck: { id: 'd1', name: 'D', examDay: null },
      cards: [{ id: 'c1', deckId: 'd1', prompt: 'p', answer: 'a', box: 1, dueDay: 0, reviews: 0, lapses: 0, lastReviewedDay: -1 }],
    });
    expect(importDeck(emptyState(), payload).ok).toBe(false);
  });
});
