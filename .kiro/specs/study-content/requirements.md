# Requirements: Study Content
Users bring their own material in as decks of question/answer cards.

## User stories
- As a student, I want to create a deck and add cards manually so I can study my own material.
- As a student, I want to paste notes and get draft cards generated so I save time.
- As a student, I want to import and export decks so I never lose my work.
- As a student, I want to set an exam date per deck so the exam boss knows when to appear.

## Acceptance criteria (EARS)
1. WHEN the user submits a deck name, THE SYSTEM SHALL create a deck with a unique id and no exam date.
2. WHEN the user adds a card with a non-empty prompt and answer, THE SYSTEM SHALL add it to the deck in box 1, due today.
3. IF a prompt or answer is empty or whitespace, THEN THE SYSTEM SHALL reject the card and keep existing data unchanged.
4. WHEN the user pastes notes, THE SYSTEM SHALL propose draft cards the user can edit or discard before saving.
5. WHEN the user exports a deck, THE SYSTEM SHALL produce JSON that, when imported, recreates identical cards.
6. IF imported data is malformed, THEN THE SYSTEM SHALL show an error and import nothing.
7. WHEN the user sets an exam date, THE SYSTEM SHALL store it on the deck; dates in the past SHALL be rejected.
