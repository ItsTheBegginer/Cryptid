# Requirements: Progress, Streaks, Persistence
## User stories
- As a student, I want to see my streak so I stay consistent.
- As a student, I want my progress saved so closing the tab loses nothing.

## Acceptance criteria (EARS)
1. WHEN the user completes any study on a day, THE SYSTEM SHALL extend the streak if yesterday was studied, otherwise start it at 1.
2. WHEN studying twice on the same day, THE SYSTEM SHALL NOT double count.
3. WHEN a day is skipped, THE SYSTEM SHALL reset the current streak to 0 and keep the best streak.
4. THE SYSTEM SHALL never increase the streak on a day with no study.
5. WHEN state changes, THE SYSTEM SHALL persist it; WHEN the app loads, THE SYSTEM SHALL restore it.
6. IF stored data is corrupt or from an unknown version, THEN THE SYSTEM SHALL start fresh without crashing.
