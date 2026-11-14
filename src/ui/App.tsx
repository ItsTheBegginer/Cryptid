import { useEffect, useMemo, useState } from 'react';
import {
  buildQueue, deserialize, emptyState, monsterViews, recordStudy, reduceMonsters, reviewCard,
  rollDay, serialize, type AppState,
} from '../engine';
import { placeholderRenderer } from '../presentation/PlaceholderRenderer';
import { demoDeck } from './demoDeck';

const SAVE_KEY = 'cryptid-study-quest';
const todayIndex = (): number => Math.floor(Date.now() / 86_400_000); // clock lives in the UI layer only

const load = (today: number): AppState => {
  const raw = localStorage.getItem(SAVE_KEY);
  const saved = raw ? deserialize(raw) : null;
  if (saved) return { ...saved, streak: rollDay(saved.streak, today) };
  const { deck, cards } = demoDeck(today);
  return { ...emptyState(), decks: [deck], cards };
};

/** Phase 3 shell: intentionally plain. Real screens and art come later. */
export function App() {
  const today = useMemo(todayIndex, []);
  const [state, setState] = useState<AppState>(() => load(today));
  const [shown, setShown] = useState(false);

  useEffect(() => { localStorage.setItem(SAVE_KEY, serialize(state)); }, [state]);

  const current = buildQueue(state.cards, today)[0];

  const answer = (correct: boolean) => {
    if (!current) return;
    setState((s) => ({
      ...s,
      cards: s.cards.map((c) => (c.id === current.id ? reviewCard(c, correct, today) : c)),
      monsters: reduceMonsters(s.monsters, { type: 'answer', correct }),
      streak: recordStudy(s.streak, today),
    }));
    setShown(false);
  };

  return (
    <main style={{ fontFamily: 'sans-serif', maxWidth: 520, margin: '2rem auto' }}>
      <h1>Cryptid Study Quest</h1>
      <p>Streak: {state.streak.current} (best {state.streak.best})</p>
      {current ? (
        <section>
          <h2>{current.prompt}</h2>
          {shown ? (
            <>
              <p><strong>{current.answer}</strong></p>
              <button onClick={() => answer(true)}>I knew it</button>{' '}
              <button onClick={() => answer(false)}>I missed it</button>
            </>
          ) : (
            <button onClick={() => setShown(true)}>Show answer</button>
          )}
        </section>
      ) : (
        <p>No cards due. The woods are quiet.</p>
      )}
      <h3>Monsters</h3>
      {monsterViews(state, today).map((v) => <div key={v.id}>{placeholderRenderer(v)}</div>)}
    </main>
  );
}
