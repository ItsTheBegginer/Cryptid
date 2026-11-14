export type Day = number; // integer days since epoch; injected, never read from a clock here
export type Box = 1 | 2 | 3 | 4 | 5;

export interface Card {
  id: string;
  deckId: string;
  prompt: string;
  answer: string;
  box: Box;
  dueDay: Day;
  reviews: number;
  lapses: number;
  lastReviewedDay: Day | null;
}

export interface Deck {
  id: string;
  name: string;
  examDay: Day | null;
}

export interface Streak {
  current: number;
  best: number;
  lastStudyDay: Day | null;
}

export type MonsterId = 'wendigo' | 'banshee' | 'jerseyDevil' | 'bigfoot';

/** What the presentation layer receives. Strength is always 0..MONSTER_MAX. */
export interface MonsterView {
  id: MonsterId;
  strength: number;
  active: boolean;
}

export interface Monsters {
  wendigo: number;
  banshee: number;
}

export interface AppState {
  decks: Deck[];
  cards: Card[];
  streak: Streak;
  monsters: Monsters;
  defeated: MonsterId[]; // bestiary
}

export type MonsterEvent =
  | { type: 'answer'; correct: boolean }
  | { type: 'dayPassed'; studied: boolean };
