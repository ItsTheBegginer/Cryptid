export const MAX_BOX = 5;
/** Days until a card is due again, indexed by Leitner box (1..5). */
export const BOX_INTERVAL_DAYS: Readonly<Record<number, number>> = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 14 };

export const MONSTER_MAX = 100;
export const WENDIGO_HUNGER_PER_MISSED_DAY = 20;
export const WENDIGO_RELIEF_PER_CORRECT = 3;
export const BANSHEE_WAIL_PER_MISS = 5;
export const BANSHEE_RELIEF_PER_CORRECT = 2;

/** The Jersey Devil only manifests this many days before an exam. */
export const BOSS_ACTIVE_WINDOW_DAYS = 14;
/** A card at or above this box counts as mastered. */
export const MASTERED_BOX = 4;
/** Bigfoot tracks cards not reviewed within this many days. */
export const NEGLECT_THRESHOLD_DAYS = 7;

export const SAVE_VERSION = 1;
