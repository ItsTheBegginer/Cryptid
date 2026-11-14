import type { Card, Deck, Day } from '../engine';

export const demoDeck = (today: Day): { deck: Deck; cards: Card[] } => {
  const deck: Deck = { id: 'demo', name: 'Demo: Cell Biology', examDay: today + 10 };
  const qa: Array<[string, string]> = [
    ['Powerhouse of the cell?', 'Mitochondria'],
    ['Site of photosynthesis?', 'Chloroplast'],
    ['Molecule that carries genetic code?', 'DNA'],
    ['Organelle that makes proteins?', 'Ribosome'],
    ['Barrier around the cell?', 'Cell membrane'],
  ];
  const cards = qa.map(([prompt, answer], i): Card => ({
    id: `demo-${i}`, deckId: deck.id, prompt, answer, box: 1, dueDay: today,
    reviews: 0, lapses: 0, lastReviewedDay: null,
  }));
  return { deck, cards };
};
