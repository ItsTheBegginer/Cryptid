import type { ReactNode } from 'react';
import type { MonsterView } from '../engine';

/**
 * The ONLY seam between game logic and visuals. Phase 3 supplies a plain placeholder;
 * Phase 6 supplies the real art by implementing this same type. Engine code never changes.
 */
export type MonsterRenderer = (view: MonsterView) => ReactNode;
