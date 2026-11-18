import type { AppState, Card, Day, Deck } from './types';

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export function createDeck(id: string, name: string): Deck {
  return { id, name, examDay: null };
}

export function addCard(state: AppState, card: Card): Result<AppState> {
  if (!state.decks.some((d) => d.id === card.deckId)) {
    return { ok: false, error: `Deck "${card.deckId}" not found` };
  }
  if (state.cards.some((c) => c.id === card.id)) {
    return { ok: false, error: `Card "${card.id}" already exists` };
  }
  return { ok: true, value: { ...state, cards: [...state.cards, card] } };
}

export function removeCard(state: AppState, cardId: string): AppState {
  return { ...state, cards: state.cards.filter((c) => c.id !== cardId) };
}

export function setExamDay(state: AppState, deckId: string, examDay: Day, today: Day): Result<AppState> {
  if (!state.decks.some((d) => d.id === deckId)) {
    return { ok: false, error: `Deck "${deckId}" not found` };
  }
  // Reject past dates — exam must be today or in the future
  if (examDay < today) {
    return { ok: false, error: `examDay ${examDay} is in the past (today is ${today})` };
  }
  return {
    ok: true,
    value: { ...state, decks: state.decks.map((d) => (d.id === deckId ? { ...d, examDay } : d)) },
  };
}

interface DeckExport {
  deck: Deck;
  cards: Card[];
}

export function exportDeck(state: AppState, deckId: string): Result<string> {
  const deck = state.decks.find((d) => d.id === deckId);
  if (!deck) {
    return { ok: false, error: `Deck "${deckId}" not found` };
  }
  const cards = state.cards.filter((c) => c.deckId === deckId);
  const payload: DeckExport = { deck, cards };
  return { ok: true, value: JSON.stringify(payload) };
}

export function importDeck(state: AppState, json: string): Result<AppState> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: 'Invalid JSON' };
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('deck' in parsed) ||
    !('cards' in parsed)
  ) {
    return { ok: false, error: 'Missing required fields: deck and cards' };
  }

  const { deck, cards } = parsed as { deck: unknown; cards: unknown };

  if (typeof deck !== 'object' || deck === null || !('id' in deck) || !('name' in deck)) {
    return { ok: false, error: 'Invalid deck object' };
  }
  if (!Array.isArray(cards)) {
    return { ok: false, error: 'cards must be an array' };
  }

  const importedDeck = deck as Deck;

  // Validate each card element has the minimum required fields before merging.
  // A malformed element (missing deckId, box, dueDay, etc.) would silently produce
  // corrupted state that crashes buildQueue and the scheduler.
  for (const element of cards) {
    if (typeof element !== 'object' || element === null) {
      return { ok: false, error: 'Invalid card in import: missing required fields' };
    }
    const e = element as Record<string, unknown>;
    const lastReviewed = e['lastReviewedDay'];
    if (
      typeof e['id'] !== 'string' ||
      typeof e['deckId'] !== 'string' ||
      typeof e['dueDay'] !== 'number' ||
      ![1, 2, 3, 4, 5].includes(e['box'] as number) ||
      typeof e['prompt'] !== 'string' || (e['prompt'] as string).length === 0 ||
      typeof e['answer'] !== 'string' || (e['answer'] as string).length === 0 ||
      typeof e['reviews'] !== 'number' || !Number.isInteger(e['reviews']) || (e['reviews'] as number) < 0 ||
      typeof e['lapses'] !== 'number' || !Number.isInteger(e['lapses']) || (e['lapses'] as number) < 0 ||
      !(lastReviewed === null || (typeof lastReviewed === 'number' && Number.isInteger(lastReviewed) && lastReviewed >= 0))
    ) {
      return { ok: false, error: 'Invalid card in import: missing required fields' };
    }
  }
  const importedCards = cards as Card[];

  // Skip deck if its id already exists; skip each card whose id already exists
  const newDecks = state.decks.some((d) => d.id === importedDeck.id)
    ? state.decks
    : [...state.decks, importedDeck];

  const existingCardIds = new Set(state.cards.map((c) => c.id));
  const newCards = [
    ...state.cards,
    ...importedCards.filter((c) => !existingCardIds.has(c.id)),
  ];

  return { ok: true, value: { ...state, decks: newDecks, cards: newCards } };
}
