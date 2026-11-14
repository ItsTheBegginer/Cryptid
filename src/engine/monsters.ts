import {
  BANSHEE_RELIEF_PER_CORRECT, BANSHEE_WAIL_PER_MISS, BOSS_ACTIVE_WINDOW_DAYS, MASTERED_BOX,
  MONSTER_MAX, NEGLECT_THRESHOLD_DAYS, WENDIGO_HUNGER_PER_MISSED_DAY, WENDIGO_RELIEF_PER_CORRECT,
} from './constants';
import type { AppState, Card, Day, Deck, MonsterEvent, MonsterId, MonsterView, Monsters } from './types';

export const clamp = (n: number): number => Math.max(0, Math.min(MONSTER_MAX, n));

export const INITIAL_MONSTERS: Monsters = { wendigo: 0, banshee: 0 };

/** Event-driven monsters. Wendigo = hunger from missed days. Banshee = wails from wrong answers. */
export function reduceMonsters(m: Monsters, e: MonsterEvent): Monsters {
  if (e.type === 'answer') {
    return e.correct
      ? { wendigo: clamp(m.wendigo - WENDIGO_RELIEF_PER_CORRECT), banshee: clamp(m.banshee - BANSHEE_RELIEF_PER_CORRECT) }
      : { ...m, banshee: clamp(m.banshee + BANSHEE_WAIL_PER_MISS) };
  }
  return e.studied ? m : { ...m, wendigo: clamp(m.wendigo + WENDIGO_HUNGER_PER_MISSED_DAY) };
}

const ratio = (num: number, den: number): number => (den === 0 ? 0 : num / den);

/** Jersey Devil: share of an exam deck not yet mastered; only active inside the exam window. */
export function bossView(deck: Deck, cards: Card[], today: Day): MonsterView {
  const mine = cards.filter((c) => c.deckId === deck.id);
  const unmastered = mine.filter((c) => c.box < MASTERED_BOX).length;
  const daysLeft = deck.examDay === null ? null : deck.examDay - today;
  const active = daysLeft !== null && daysLeft >= 0 && daysLeft <= BOSS_ACTIVE_WINDOW_DAYS && mine.length > 0;
  return { id: 'jerseyDevil', strength: active ? clamp(Math.round(ratio(unmastered, mine.length) * MONSTER_MAX)) : 0, active };
}

/** Bigfoot: share of cards never reviewed or not reviewed recently. */
export function bigfootView(cards: Card[], today: Day): MonsterView {
  const neglected = cards.filter((c) => c.lastReviewedDay === null || today - c.lastReviewedDay > NEGLECT_THRESHOLD_DAYS).length;
  const strength = clamp(Math.round(ratio(neglected, cards.length) * MONSTER_MAX));
  return { id: 'bigfoot', strength, active: strength > 0 };
}

/** Everything the presentation layer needs, in one call. */
export function monsterViews(state: AppState, today: Day): MonsterView[] {
  const boss = state.decks.map((d) => bossView(d, state.cards, today)).filter((v) => v.active);
  const strongestBoss = boss.sort((a, b) => b.strength - a.strength)[0] ?? { id: 'jerseyDevil' as MonsterId, strength: 0, active: false };
  return [
    { id: 'wendigo', strength: state.monsters.wendigo, active: state.monsters.wendigo > 0 },
    { id: 'banshee', strength: state.monsters.banshee, active: state.monsters.banshee > 0 },
    strongestBoss,
    bigfootView(state.cards, today),
  ];
}
