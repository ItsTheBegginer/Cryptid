import type { MonsterRenderer } from './MonsterRenderer';

const LABELS = {
  wendigo: 'Wendigo (hunger)',
  banshee: 'Banshee (wails)',
  jerseyDevil: 'Jersey Devil (exam boss)',
  bigfoot: 'Bigfoot (neglect)',
} as const;

/** Deliberately plain: a label and a bar. */
export const placeholderRenderer: MonsterRenderer = (v) => (
  <div style={{ margin: '8px 0', opacity: v.active ? 1 : 0.4 }}>
    <div>{LABELS[v.id]}: {v.strength}/100 {v.active ? '' : '(dormant)'}</div>
    <progress max={100} value={v.strength} />
  </div>
);
