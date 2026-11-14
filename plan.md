# Cryptid Study Quest: Phasewise Build Plan

**Hackathon:** Kiroween 2026, Costume Contest category
**Deadline:** Friday, December 4, 2026, 2:00 PM PT (aim to submit **Dec 3**; Dec 4 is the safety buffer)
**Strategy:** Functionality first, then transform the UI into art.

## Golden rules
1. **Engine and visuals stay separate.** `src/engine` is pure logic (no UI imports, no `Date.now`, no `Math.random`). Visuals plug in only through `src/presentation/MonsterRenderer.ts`.
2. **No faces, eyes, or facial features, ever.** Enforced by `.kiro/steering/no-faces.md`, the No-Faces Guard hook, and `npm run check:faces`.
3. **Never add `.kiro/` to `.gitignore`.** It is required for submission.
4. **Freeze functionality before art.** After tag `functional-v1`, only visuals change.
5. **Keep a Kiro log** as you go (see the end of this file). It becomes your write-up.

## Calendar

| Dates | Phase |
|---|---|
| Nov 7-9 | 0: Foundation, 1: Specs |
| Nov 10-15 | 2: Core engine |
| Nov 16-20 | 3: Functional UI, 4: Content input |
| Nov 21-22 | 5: Functionality freeze and QA |
| Nov 23-Dec 1 | 6: Art transformation, 7: Polish |
| Dec 2-3 | 8: Submission |

---

## Phase 0: Foundation (Nov 7-9) ✅ scaffolded
- [x] Repo structure, MIT license, `.gitignore` (without `.kiro/`)
- [x] Steering docs: `product`, `no-faces`, `tech-stack`, `code-style`, `art-direction` (placeholder)
- [x] Hooks: No-Faces Guard, Test On Engine Change, Engine Purity Check
- [x] `scripts/check-no-faces.mjs`
- [ ] Push to a **public GitHub** repo and confirm the license shows in the About section
- [ ] Confirm `.kiro/` is visible on GitHub
- [ ] Verify hooks load in Kiro's Agent Hooks panel (fix format if needed)
- [ ] Request the 4,000 free Kiro credits (deadline **Dec 1, 12:00 PM PT**)
- [ ] Join the Kiro Discord (#kiroween-hackathon)
- [ ] Optional: attend the Devpost Build Session on Nov 11, 10:00 AM PT

**Done when:** repo is public, `npm install && npm test && npm run dev` works.

## Phase 1: Specs (Nov 8-10) ✅ written
- [x] `study-content`
- [x] `spaced-repetition`
- [x] `monster-system`
- [x] `progress-streaks`
- [ ] Review each spec in Kiro and adjust requirements you disagree with
- [ ] Decide the MVP monster set (default: Wendigo, Banshee, Jersey Devil, Bigfoot; stretch: Mothman, Chupacabra)

**Done when:** every feature has requirements, design, and tasks.

## Phase 2: Core engine, no UI (Nov 10-15) 🟡 partly done
Done: Leitner scheduler, session queue, event-driven and derived monsters, streaks, versioned save/load, 13 property tests.

Remaining:
- [ ] `decks.ts`: `createDeck`, `addCard`, `removeCard`, `setExamDay`, `exportDeck`, `importDeck` (with `Result` type)
- [ ] Bestiary: detect a monster going from active to 0 and add it to `defeated`
- [ ] Daily rollover: apply `dayPassed` for every skipped day since the last visit
- [ ] Test for `buildQueue` (only due, sorted, respects limit)
- [ ] In-session requeue of missed cards
- [ ] Balance pass on `constants.ts` using a simulated 30-day study log

**Property tests to keep or add:**
- Monster strength always within 0..100
- Correct answers never increase a monster
- Correct answers never shorten a card's interval
- Streak never increases on a day with no study
- Save then load returns identical state
- Deck export then import is identity
- Invalid cards never change state

**Done when:** all engine tasks in `.kiro/specs/*/tasks.md` are checked and `npm test` is green.

## Phase 3: Functional UI (Nov 16-18)
Deliberately plain: buttons, text, basic bars. No styling effort.
- [ ] Deck list, create deck, add card form
- [ ] Study session screen with results summary
- [ ] Monster panel (name, strength, dormant or active) via the placeholder renderer
- [ ] Exam date setup per deck
- [ ] Bestiary list
- [ ] Progress and streak view (cards per box, mastered %)
- [ ] Reset-all-data control with confirmation

**Done when:** a new user can create a deck, study it, and watch the monsters change, with zero visual polish.

## Phase 4: Content input (Nov 18-20)
- [ ] Manual card creation polish and CSV or JSON import/export
- [ ] Paste notes and get draft cards, editable before saving (LLM API or a "term: definition" fallback parser)
- [ ] Optional MCP server for extracting study material (gives you a concrete MCP story)

**Done when:** a student can go from raw notes to a studyable deck in under two minutes.

## Phase 5: Functionality freeze (Nov 21-22)
- [ ] Manual test pass of every flow
- [ ] Fix all bugs
- [ ] Deploy to a **live URL** (Vercel or Netlify) and test on your demo device
- [ ] Tag `functional-v1` and freeze rules and features

**Done when:** the app works end to end on the live URL. From here, only visuals change.

## Phase 6: Art transformation (Nov 23-Dec 1)
First fill in `.kiro/steering/art-direction.md`. Then build in layers, biggest impact first:
1. [ ] **Design system:** palette (moonlit blues, bone white, blood-red accents), typography, spacing, motion rules
2. [ ] **Scene:** layered parallax forest, moon, fog, ambient particles (Canvas or SVG)
3. [ ] **Faceless monsters** behind `MonsterRenderer`:
   - Wendigo: creeping antler branches that grow in from the screen edges
   - Banshee: waveform ripple and mist
   - Jersey Devil: storm cloud with a wing silhouette; health shown as the cloud thinning
   - Bigfoot: footprints and swaying trees
   - (Stretch) Mothman: wing shadow; Chupacabra: draining fog
4. [ ] **Feedback animation:** right answer pushes fog back; wrong answer triggers ripple and shake; defeat dissolves
5. [ ] **Sound:** ambient loop, wail, thunder, with a mute toggle
6. [ ] **Micro-interactions:** card flips, hover effects, bestiary reveal

**Done when:** every screen looks intentional and the monsters feel alive, with no rule changes.

## Phase 7: Polish (Nov 30-Dec 1)
- [ ] `prefers-reduced-motion` respected
- [ ] No strobing or harsh flashing (lightning must be soft)
- [ ] Text contrast at WCAG AA
- [ ] Performance check on a mid-range device
- [ ] Empty, loading, and first-run onboarding states
- [ ] Run `npm run check:faces` one last time

## Phase 8: Submission (Dec 2-3)
Required:
- [ ] Public GitHub repo with visible open source license and `/.kiro` at the root (not gitignored)
- [ ] Working app URL (plus judge-only credentials in the Devpost form if needed)
- [ ] Text description of features and functionality
- [ ] Public YouTube demo video, **under 3 minutes**, showing the project working on its target device
- [ ] Write-up of how Kiro was used (see below)
- [ ] Category selected: **Costume Contest**

Demo video flow: 15-second hook on the problem, one full study session, the boss fight, the bestiary, then a closing line.

Cheap bonus prizes to stack:
- [ ] **Social Blitz:** post with `#KiroweenHackathon26` at the very start, sharing your favorite thing about Kiro; add the post URL
- [ ] **Bonus Blog Prize:** public post on a third-party blog platform that mentions Kiroween 2026; add the URL
- [ ] **Best Demo:** automatic
- [ ] Others only if you qualify (Startup, Student, Ghost of Kiroween Past, Kiro Crew)

**Judging criteria to design for:** Potential Impact, Technological Implementation (depth of Kiro use), Design, Innovation, Presentation.

---

## Kiro usage log (fill in as you build)
Judges score how deeply you used Kiro. Jot a line or two under each heading whenever something notable happens.

- **Spec-driven development:** how specs shaped the build; compare to vibe coding
- **Steering docs:** which rule made the biggest difference (hint: `no-faces.md`)
- **Hooks:** bugs or violations a hook caught automatically
- **Property-based testing:** bugs PBT found that unit tests would have missed
- **MCP:** what it enabled that was otherwise hard
- **Kiro Powers / custom agents:** what you tried and how it changed the build
- **IDE vs CLI vs Web vs Crew:** differences you noticed

## Risks and mitigations
| Risk | Mitigation |
|---|---|
| Art phase eats the schedule | Freeze functionality Nov 22; art is layered so you can stop at any layer |
| Animation hurts performance | Test on a mid-range device early in Phase 6 |
| Face-like shapes sneak in | Hook plus `check:faces` plus the steering rule |
| Last-minute submission problems | Submit Dec 3; Dec 4 is a buffer |
| LLM note-to-cards unavailable | Keep the deterministic fallback parser |