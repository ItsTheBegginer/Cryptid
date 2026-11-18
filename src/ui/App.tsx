import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  applyDailyRollover,
  BOX_START,
  buildQueue,
  createDeck,
  deserialize,
  emptyState,
  exportDeck,
  importDeck,
  MASTERED_BOX,
  MS_PER_DAY,
  monsterViews,
  parsePlainText,
  recordStudy,
  reduceMonsters,
  removeCard,
  reviewCard,
  rollDay,
  serialize,
  setExamDay,
  updateDefeated,
  addCard,
  type AppState,
  type Box,
  type Card,
  type MonsterId,
} from '../engine';
import { placeholderRenderer } from '../presentation/PlaceholderRenderer';
import { demoDeck } from './demoDeck';

// ─── constants ────────────────────────────────────────────────────────────────
const SAVE_KEY = 'cryptid-study-quest';
const BOXES: Box[] = [1, 2, 3, 4, 5];
/** Upper bound for the study session queue. Large enough to never silently truncate a deck. */
const SESSION_QUEUE_LIMIT = 1000;

const MONSTER_NAMES: Record<MonsterId, string> = {
  wendigo: 'Wendigo',
  banshee: 'Banshee',
  jerseyDevil: 'Jersey Devil',
  bigfoot: 'Bigfoot',
};

// ─── screen discriminated union ───────────────────────────────────────────────
type Screen =
  | { name: 'home' }
  | { name: 'editor'; deckId: string }
  | { name: 'study'; deckId: string }
  | { name: 'results'; correct: number; wrong: number }
  | { name: 'bestiary' }
  | { name: 'progress' };

// ─── persistence helpers ──────────────────────────────────────────────────────
const today = (): number => Math.floor(Date.now() / MS_PER_DAY);

function loadState(day: number): AppState {
  const raw = localStorage.getItem(SAVE_KEY);
  const saved = raw ? deserialize(raw) : null;
  let s = saved ?? (() => {
    const { deck, cards } = demoDeck(day);
    return { ...emptyState(), decks: [deck], cards };
  })();
  s = applyDailyRollover(s, day);
  s = updateDefeated(s, day);
  return { ...s, streak: rollDay(s.streak, day) };
}

function persist(s: AppState): void {
  localStorage.setItem(SAVE_KEY, serialize(s));
}

// ─── MonsterPanel ─────────────────────────────────────────────────────────────
function MonsterPanel({ state, day }: { state: AppState; day: number }) {
  const views = monsterViews(state, day);
  return (
    <section>
      <h3>Monsters</h3>
      {views.map((v) => <div key={v.id}>{placeholderRenderer(v)}</div>)}
    </section>
  );
}

// ─── HomeScreen ───────────────────────────────────────────────────────────────
function HomeScreen({
  state, day, onNavigate, onStateChange,
}: {
  state: AppState;
  day: number;
  onNavigate: (s: Screen) => void;
  onStateChange: (s: AppState) => void;
}) {
  const [showNewDeck, setShowNewDeck] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [resetStep, setResetStep] = useState<'idle' | 'confirm'>('idle');

  function handleCreateDeck(e: React.FormEvent) {
    e.preventDefault();
    const name = newDeckName.trim();
    if (!name) return;
    const deck = createDeck(crypto.randomUUID(), name);
    const next: AppState = { ...state, decks: [...state.decks, deck] };
    onStateChange(next);
    setNewDeckName('');
    setShowNewDeck(false);
  }

  function handleReset() {
    if (resetStep === 'idle') {
      setResetStep('confirm');
      return;
    }
    localStorage.removeItem(SAVE_KEY);
    let fresh = emptyState();
    fresh = applyDailyRollover(fresh, day);
    fresh = updateDefeated(fresh, day);
    onStateChange(fresh);
    setResetStep('idle');
  }

  return (
    <main>
      <h1>Cryptid Study Quest</h1>
      <p>Streak: {state.streak.current} day(s) &nbsp;|&nbsp; Best: {state.streak.best}</p>

      <MonsterPanel state={state} day={day} />

      <section>
        <h2>Decks</h2>
        {state.decks.length === 0 && <p>No decks yet.</p>}
        {state.decks.map((deck) => {
          const deckCards = state.cards.filter((c) => c.deckId === deck.id);
          const dueCount = buildQueue(deckCards, day, SESSION_QUEUE_LIMIT).length;
          const daysLeft = deck.examDay !== null ? deck.examDay - day : null;
          const examLabel = daysLeft !== null
            ? (daysLeft >= 0 ? `Exam in ${daysLeft} day(s)` : 'Exam passed')
            : 'No exam set';
          return (
            <div key={deck.id} style={{ margin: '8px 0', padding: '8px', border: '1px solid #ccc' }}>
              <strong>{deck.name}</strong>
              {' — '}
              {deckCards.length} card(s), {dueCount} due, {examLabel}
              {' '}
              <button onClick={() => onNavigate({ name: 'study', deckId: deck.id })}>
                Study
              </button>
              {' '}
              <button onClick={() => onNavigate({ name: 'editor', deckId: deck.id })}>
                Edit
              </button>
            </div>
          );
        })}

        {showNewDeck ? (
          <form onSubmit={handleCreateDeck} style={{ marginTop: '8px' }}>
            <input
              type="text"
              placeholder="Deck name"
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              autoFocus
            />
            {' '}
            <button type="submit">Create</button>
            {' '}
            <button type="button" onClick={() => { setShowNewDeck(false); setNewDeckName(''); }}>
              Cancel
            </button>
          </form>
        ) : (
          <button onClick={() => setShowNewDeck(true)} style={{ marginTop: '8px' }}>
            New deck
          </button>
        )}
      </section>

      <section style={{ marginTop: '16px' }}>
        <button onClick={() => onNavigate({ name: 'bestiary' })}>Bestiary</button>
        {' '}
        <button onClick={() => onNavigate({ name: 'progress' })}>Progress</button>
      </section>

      <section style={{ marginTop: '24px' }}>
        {resetStep === 'confirm' ? (
          <>
            <span>All data will be wiped. </span>
            <button onClick={handleReset}>Yes, reset</button>
            {' '}
            <button onClick={() => setResetStep('idle')}>Cancel</button>
          </>
        ) : (
          <button onClick={handleReset}>Reset all data</button>
        )}
      </section>
    </main>
  );
}

// ─── DeckEditorScreen ─────────────────────────────────────────────────────────
function DeckEditorScreen({
  state, day, deckId, onNavigate, onStateChange,
}: {
  state: AppState;
  day: number;
  deckId: string;
  onNavigate: (s: Screen) => void;
  onStateChange: (s: AppState) => void;
}) {
  const deck = state.decks.find((d) => d.id === deckId);
  const deckCards = state.cards.filter((c) => c.deckId === deckId);

  const [deckName, setDeckName] = useState(deck?.name ?? '');
  const [examInput, setExamInput] = useState('');
  const [examError, setExamError] = useState('');
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [addError, setAddError] = useState('');
  const [exportText, setExportText] = useState('');

  // Import JSON state
  const [showImport, setShowImport] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState('');

  // Paste notes (plain text) state
  const [notesText, setNotesText] = useState('');
  const [draftCards, setDraftCards] = useState<Card[]>([]);
  const [draftError, setDraftError] = useState('');

  // Reset form state when navigating to a different deck (safe to run in strict mode)
  useEffect(() => {
    setDeckName(deck?.name ?? '');
    setExamInput('');
    setExamError('');
    setPrompt('');
    setAnswer('');
    setAddError('');
    setExportText('');
    setShowImport(false);
    setImportJsonText('');
    setImportError('');
    setNotesText('');
    setDraftCards([]);
    setDraftError('');
    // deck?.name intentionally excluded: we only want to reset on deckId change,
    // not on every rename keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId]);

  if (!deck) {
    return (
      <main>
        <p>Deck not found.</p>
        <button onClick={() => onNavigate({ name: 'home' })}>Back</button>
      </main>
    );
  }

  function saveDeckName() {
    const trimmed = deckName.trim();
    if (!trimmed || trimmed === deck!.name) return;
    const next: AppState = {
      ...state,
      decks: state.decks.map((d) => d.id === deckId ? { ...d, name: trimmed } : d),
    };
    onStateChange(next);
  }

  function handleSetExam(e: React.FormEvent) {
    e.preventDefault();
    setExamError('');
    const days = parseInt(examInput, 10);
    if (isNaN(days) || days < 0) {
      setExamError('Enter a non-negative number of days from today.');
      return;
    }
    const result = setExamDay(state, deckId, day + days, day);
    if (!result.ok) {
      setExamError(result.error);
      return;
    }
    onStateChange(result.value);
    setExamInput('');
  }

  function handleAddCard(e: React.FormEvent) {
    e.preventDefault();
    setAddError('');
    const p = prompt.trim();
    const a = answer.trim();
    if (!p || !a) {
      setAddError('Both prompt and answer are required.');
      return;
    }
    const card: Card = {
      id: crypto.randomUUID(),
      deckId,
      prompt: p,
      answer: a,
      box: BOX_START,
      dueDay: day,
      reviews: 0,
      lapses: 0,
      lastReviewedDay: null,
    };
    const result = addCard(state, card);
    if (!result.ok) {
      setAddError(result.error);
      return;
    }
    onStateChange(result.value);
    setPrompt('');
    setAnswer('');
  }

  function handleRemoveCard(cardId: string) {
    onStateChange(removeCard(state, cardId));
  }

  function handleExport() {
    if (!deck) return;
    const result = exportDeck(state, deckId);
    if (!result.ok) {
      setExportText(`Error: ${result.error}`);
      return;
    }
    // Try a file download; fall back to showing the text
    try {
      const blob = new Blob([result.value], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${deck.name.replace(/\s+/g, '_')}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setExportText(result.value);
    }
  }

  const examDaysLeft = deck.examDay !== null ? deck.examDay - day : null;

  return (
    <main>
      <button onClick={() => onNavigate({ name: 'home' })}>Back</button>
      <h2>
        <input
          type="text"
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
          onBlur={saveDeckName}
          onKeyDown={(e) => { if (e.key === 'Enter') saveDeckName(); }}
          style={{ fontSize: 'inherit', fontWeight: 'inherit', border: 'none', borderBottom: '1px solid #999' }}
        />
      </h2>

      <section>
        <strong>Exam: </strong>
        {examDaysLeft !== null ? `${examDaysLeft} day(s) from today` : 'Not set'}
        <form onSubmit={handleSetExam} style={{ display: 'inline', marginLeft: '8px' }}>
          <input
            type="number"
            min={0}
            value={examInput}
            onChange={(e) => setExamInput(e.target.value)}
            placeholder="Days from today"
            style={{ width: '120px' }}
          />
          {' '}
          <button type="submit">Set exam</button>
          {examError && <span style={{ color: 'red', marginLeft: '8px' }}>{examError}</span>}
        </form>
      </section>

      <section style={{ marginTop: '16px' }}>
        <h3>Cards ({deckCards.length})</h3>
        {deckCards.length === 0 && <p>No cards yet.</p>}
        {deckCards.map((card) => (
          <div key={card.id} style={{ margin: '4px 0', padding: '4px', border: '1px solid #ddd' }}>
            <strong>{card.prompt}</strong> — {card.answer}
            {' '}
            <small>(box {card.box})</small>
            {' '}
            <button onClick={() => handleRemoveCard(card.id)}>Remove</button>
          </div>
        ))}

        <form onSubmit={handleAddCard} style={{ marginTop: '8px' }}>
          <div>
            <input
              type="text"
              placeholder="Prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              style={{ marginRight: '8px', width: '200px' }}
            />
            <input
              type="text"
              placeholder="Answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              style={{ marginRight: '8px', width: '200px' }}
            />
            <button type="submit">Add card</button>
          </div>
          {addError && <p style={{ color: 'red' }}>{addError}</p>}
        </form>
      </section>

      <section style={{ marginTop: '16px' }}>
        <button onClick={handleExport}>Export deck</button>
        {exportText && (
          <div style={{ marginTop: '8px' }}>
            <textarea
              readOnly
              rows={6}
              style={{ width: '100%', fontFamily: 'monospace', fontSize: '12px' }}
              value={exportText}
            />
          </div>
        )}
      </section>

      <section style={{ marginTop: '16px' }}>
        <button onClick={() => { setShowImport((v) => !v); setImportError(''); }}>
          Import JSON
        </button>
        {showImport && (
          <div style={{ marginTop: '8px' }}>
            <textarea
              rows={6}
              style={{ width: '100%', fontFamily: 'monospace', fontSize: '12px' }}
              placeholder="Paste exported deck JSON here"
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
            />
            <div style={{ marginTop: '4px' }}>
              <button
                onClick={() => {
                  setImportError('');
                  const result = importDeck(state, importJsonText);
                  if (!result.ok) {
                    setImportError('Import failed: invalid or unrecognised deck format. Check that prompt, answer, reviews, lapses, and box are all valid.');
                    return;
                  }
                  onStateChange(result.value);
                  setImportJsonText('');
                  setShowImport(false);
                }}
              >
                Import
              </button>
              {importError && (
                <span style={{ color: 'red', marginLeft: '8px' }}>{importError}</span>
              )}
            </div>
          </div>
        )}
      </section>

      <section style={{ marginTop: '16px' }}>
        <div>
          <label htmlFor="paste-notes">Paste notes (term: definition, one per line)</label>
        </div>
        <textarea
          id="paste-notes"
          rows={6}
          style={{ width: '100%', marginTop: '4px', fontFamily: 'monospace', fontSize: '12px' }}
          value={notesText}
          onChange={(e) => setNotesText(e.target.value)}
        />
        <button
          style={{ marginTop: '4px' }}
          onClick={() => {
            setDraftError('');
            const generated = parsePlainText(notesText, deckId, day, () => crypto.randomUUID());
            setDraftCards(generated);
          }}
        >
          Generate cards
        </button>

        {draftCards.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            {draftCards.map((card, idx) => (
              <div key={card.id} style={{ display: 'flex', gap: '8px', margin: '4px 0', alignItems: 'center' }}>
                <input
                  type="text"
                  value={card.prompt}
                  onChange={(e) => {
                    const updated = draftCards.map((c, i) =>
                      i === idx ? { ...c, prompt: e.target.value } : c,
                    );
                    setDraftCards(updated);
                  }}
                  style={{ width: '200px' }}
                />
                <input
                  type="text"
                  value={card.answer}
                  onChange={(e) => {
                    const updated = draftCards.map((c, i) =>
                      i === idx ? { ...c, answer: e.target.value } : c,
                    );
                    setDraftCards(updated);
                  }}
                  style={{ width: '200px' }}
                />
                <button
                  onClick={() => {
                    setDraftCards(draftCards.filter((_, i) => i !== idx));
                    setDraftError('');
                  }}
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              style={{ marginTop: '8px' }}
              onClick={() => {
                setDraftError('');
                // Validate all draft cards before persisting any
                const hasBlank = draftCards.some(
                  (c) => c.prompt.trim().length === 0 || c.answer.trim().length === 0,
                );
                if (hasBlank) {
                  setDraftError('All cards must have a non-empty prompt and answer.');
                  return;
                }
                // Add each draft card in sequence; stop on first error
                let current = state;
                for (const card of draftCards) {
                  const result = addCard(current, card);
                  if (!result.ok) {
                    setDraftError(result.error);
                    return;
                  }
                  current = result.value;
                }
                onStateChange(current);
                setDraftCards([]);
                setNotesText('');
              }}
            >
              Save all
            </button>
            {draftError && (
              <span style={{ color: 'red', marginLeft: '8px' }}>{draftError}</span>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

// ─── StudySession ─────────────────────────────────────────────────────────────
interface SessionState {
  queue: Card[];              // remaining cards to show
  currentIndex: number;
  missed: Set<string>;        // ids answered wrong in this session
  retried: Set<string>;       // ids already retried (prevent infinite requeueing)
  correctIds: Set<string>;    // distinct cards whose final outcome was correct
  wrongIds: Set<string>;      // distinct cards whose final outcome was wrong
  shown: boolean;             // answer revealed?
}

function buildInitialSession(cards: Card[], day: number): SessionState {
  return {
    queue: buildQueue(cards, day, SESSION_QUEUE_LIMIT),
    currentIndex: 0,
    missed: new Set(),
    retried: new Set(),
    correctIds: new Set(),
    wrongIds: new Set(),
    shown: false,
  };
}

function StudyScreen({
  state, day, deckId, onNavigate, onStateChange,
}: {
  state: AppState;
  day: number;
  deckId: string;
  onNavigate: (s: Screen) => void;
  onStateChange: (s: AppState) => void;
}) {
  const deckCards = useMemo(
    () => state.cards.filter((c) => c.deckId === deckId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],  // snapshot on session start — do not rebuild mid-session
  );

  const [session, setSession] = useState<SessionState>(() =>
    buildInitialSession(deckCards, day),
  );

  // Keep a ref to the latest state so the answer handler always uses fresh state
  const stateRef = useRef(state);
  stateRef.current = state;

  const current = session.queue[session.currentIndex] ?? null;

  function handleAnswer(correct: boolean) {
    const card = current;
    if (!card) return;

    // Update engine state: card, monsters, streak, defeated
    const updatedCard = reviewCard(card, correct, day);
    let next: AppState = {
      ...stateRef.current,
      cards: stateRef.current.cards.map((c) => c.id === card.id ? updatedCard : c),
      monsters: reduceMonsters(stateRef.current.monsters, { type: 'answer', correct }),
      streak: recordStudy(stateRef.current.streak, day),
    };
    next = updateDefeated(next, day);
    onStateChange(next);

    // Update session
    setSession((prev) => {
      const newMissed = new Set(prev.missed);
      const newRetried = new Set(prev.retried);
      const newCorrectIds = new Set(prev.correctIds);
      const newWrongIds = new Set(prev.wrongIds);
      let newQueue = prev.queue;
      let nextIndex = prev.currentIndex + 1;

      // Track distinct outcome per card: a card's final answer determines its bucket
      if (correct) {
        newCorrectIds.add(card.id);
        newWrongIds.delete(card.id);
      } else {
        newMissed.add(card.id);
        newWrongIds.add(card.id);
        newCorrectIds.delete(card.id);
      }

      // When we exhaust the original queue, append missed-but-not-yet-retried cards
      if (nextIndex >= newQueue.length) {
        const toRetry = prev.queue
          .filter((c) => newMissed.has(c.id) && !newRetried.has(c.id));
        toRetry.forEach((c) => newRetried.add(c.id));
        if (toRetry.length > 0) {
          newQueue = [...newQueue, ...toRetry];
        }
      }

      return {
        ...prev,
        queue: newQueue,
        currentIndex: nextIndex,
        missed: newMissed,
        retried: newRetried,
        correctIds: newCorrectIds,
        wrongIds: newWrongIds,
        shown: false,
      };
    });
  }

  // Navigate to results when queue is exhausted
  useEffect(() => {
    if (session.queue.length > 0 && session.currentIndex >= session.queue.length) {
      onNavigate({
        name: 'results',
        correct: session.correctIds.size,
        wrong: session.wrongIds.size,
      });
    }
  }, [session.currentIndex, session.queue.length, session.correctIds, session.wrongIds, onNavigate]);

  if (session.queue.length === 0) {
    return (
      <main>
        <button onClick={() => onNavigate({ name: 'home' })}>Back</button>
        <p>No cards due in this deck.</p>
      </main>
    );
  }

  if (!current) return null; // transitioning to results

  const position = `${session.currentIndex + 1} / ${session.queue.length}`;

  return (
    <main>
      <button onClick={() => onNavigate({ name: 'home' })}>Back to decks</button>
      <h2>Study session</h2>
      <p>Card {position}</p>
      <section style={{ padding: '16px', border: '1px solid #ccc', margin: '16px 0' }}>
        <p style={{ fontSize: '1.2em' }}>{current.prompt}</p>
        {session.shown ? (
          <>
            <p><strong>{current.answer}</strong></p>
            <button onClick={() => handleAnswer(true)}>Correct</button>
            {' '}
            <button onClick={() => handleAnswer(false)}>Wrong</button>
          </>
        ) : (
          <button onClick={() => setSession((s) => ({ ...s, shown: true }))}>
            Show answer
          </button>
        )}
      </section>
      <p>Correct so far: {session.correctIds.size} &nbsp;|&nbsp; Wrong so far: {session.wrongIds.size}</p>
    </main>
  );
}

// ─── ResultsScreen ────────────────────────────────────────────────────────────
function ResultsScreen({
  state, day, correct, wrong, onNavigate,
}: {
  state: AppState;
  day: number;
  correct: number;
  wrong: number;
  onNavigate: (s: Screen) => void;
}) {
  return (
    <main>
      <h2>Session complete</h2>
      <p>Cards studied: {correct + wrong}</p>
      <p>Correct: {correct}</p>
      <p>Wrong: {wrong}</p>
      <p>Current streak: {state.streak.current} day(s)</p>

      <MonsterPanel state={state} day={day} />

      <button onClick={() => onNavigate({ name: 'home' })}>Back to decks</button>
    </main>
  );
}

// ─── BestiaryScreen ───────────────────────────────────────────────────────────
function BestiaryScreen({
  state, day, onNavigate,
}: {
  state: AppState;
  day: number;
  onNavigate: (s: Screen) => void;
}) {
  const views = monsterViews(state, day);
  const defeatedSet = new Set<MonsterId>(state.defeated);

  const defeated = views.filter((v) => defeatedSet.has(v.id));
  const active = views.filter((v) => v.active && !defeatedSet.has(v.id));
  const dormant = views.filter((v) => !v.active && !defeatedSet.has(v.id));

  return (
    <main>
      <button onClick={() => onNavigate({ name: 'home' })}>Back</button>
      <h2>Bestiary</h2>

      <section>
        <h3>Defeated</h3>
        {defeated.length === 0
          ? <p>None yet.</p>
          : defeated.map((v) => (
            <div key={v.id}>{MONSTER_NAMES[v.id]} — Defeated</div>
          ))}
      </section>

      <section>
        <h3>Active threats</h3>
        {active.length === 0
          ? <p>None active.</p>
          : active.map((v) => (
            <div key={v.id}>{MONSTER_NAMES[v.id]} — strength {v.strength}</div>
          ))}
      </section>

      <section>
        <h3>Dormant</h3>
        {dormant.length === 0
          ? <p>None dormant.</p>
          : dormant.map((v) => (
            <div key={v.id}>{MONSTER_NAMES[v.id]} — dormant</div>
          ))}
      </section>
    </main>
  );
}

// ─── ProgressScreen ───────────────────────────────────────────────────────────
function ProgressScreen({
  state, day, onNavigate,
}: {
  state: AppState;
  day: number;
  onNavigate: (s: Screen) => void;
}) {
  const totalCards = state.cards.length;
  const totalMastered = state.cards.filter((c) => c.box >= MASTERED_BOX).length;
  const masteredPct = totalCards === 0 ? 0 : Math.round((totalMastered / totalCards) * 100);

  return (
    <main>
      <button onClick={() => onNavigate({ name: 'home' })}>Back</button>
      <h2>Progress</h2>

      <section>
        <h3>Overall</h3>
        <p>Total cards: {totalCards}</p>
        <p>Mastered: {totalMastered} ({masteredPct}%)</p>
        <p>Current streak: {state.streak.current} day(s)</p>
        <p>Best streak: {state.streak.best} day(s)</p>
      </section>

      <section>
        <h3>By deck</h3>
        {state.decks.length === 0 && <p>No decks.</p>}
        {state.decks.map((deck) => {
          const cards = state.cards.filter((c) => c.deckId === deck.id);
          const deckMastered = cards.filter((c) => c.box >= MASTERED_BOX).length;
          const deckPct = cards.length === 0 ? 0 : Math.round((deckMastered / cards.length) * 100);
          const daysLeft = deck.examDay !== null ? deck.examDay - day : null;
          const examLabel = daysLeft !== null
            ? (daysLeft >= 0 ? `Exam in ${daysLeft} day(s)` : 'Exam passed')
            : '';
          return (
            <div key={deck.id} style={{ margin: '12px 0', padding: '8px', border: '1px solid #ddd' }}>
              <strong>{deck.name}</strong>
              {examLabel && <span style={{ marginLeft: '8px' }}>({examLabel})</span>}
              <div>
                {BOXES.map((box) => {
                  const count = cards.filter((c) => c.box === box).length;
                  return <span key={box} style={{ marginRight: '12px' }}>Box {box}: {count}</span>;
                })}
              </div>
              <div>Mastered: {deckMastered} / {cards.length} ({deckPct}%)</div>
            </div>
          );
        })}
      </section>
    </main>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────
export function App() {
  // TODO(phase 4): refresh day on visibility change so engine calls use the correct date after midnight
  const day = useMemo(() => today(), []);
  const [state, setState] = useState<AppState>(() => loadState(day));
  const [screen, setScreen] = useState<Screen>({ name: 'home' });

  // Persist on every state change
  useEffect(() => { persist(state); }, [state]);

  const handleStateChange = useCallback((next: AppState) => {
    setState(next);
  }, []);

  const handleNavigate = useCallback((s: Screen) => {
    setScreen(s);
  }, []);

  if (screen.name === 'home') {
    return (
      <HomeScreen
        state={state}
        day={day}
        onNavigate={handleNavigate}
        onStateChange={handleStateChange}
      />
    );
  }

  if (screen.name === 'editor') {
    return (
      <DeckEditorScreen
        state={state}
        day={day}
        deckId={screen.deckId}
        onNavigate={handleNavigate}
        onStateChange={handleStateChange}
      />
    );
  }

  if (screen.name === 'study') {
    return (
      <StudyScreen
        state={state}
        day={day}
        deckId={screen.deckId}
        onNavigate={handleNavigate}
        onStateChange={handleStateChange}
      />
    );
  }

  if (screen.name === 'results') {
    return (
      <ResultsScreen
        state={state}
        day={day}
        correct={screen.correct}
        wrong={screen.wrong}
        onNavigate={handleNavigate}
      />
    );
  }

  if (screen.name === 'bestiary') {
    return (
      <BestiaryScreen
        state={state}
        day={day}
        onNavigate={handleNavigate}
      />
    );
  }

  if (screen.name === 'progress') {
    return (
      <ProgressScreen
        state={state}
        day={day}
        onNavigate={handleNavigate}
      />
    );
  }

  // Exhaustive: all screen names handled above
  return null;
}
