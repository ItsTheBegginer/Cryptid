# Requirements: Spaced Repetition and Sessions
## User stories
- As a student, I want cards I know to come back later and cards I miss to come back sooner.
- As a student, I want each session to show only what is due so I am not overwhelmed.

## Acceptance criteria (EARS)
1. WHEN a card is answered correctly, THE SYSTEM SHALL move it up one Leitner box (max box 5) and schedule it per the box interval.
2. WHEN a card is answered incorrectly, THE SYSTEM SHALL move it to box 1, due today, and increment its lapse count.
3. THE SYSTEM SHALL never shorten a card's interval after a correct answer.
4. WHEN a session starts, THE SYSTEM SHALL queue only cards due on or before today, most overdue first, up to a limit.
5. WHEN the queue is empty, THE SYSTEM SHALL tell the user nothing is due.
6. THE SYSTEM SHALL NOT mutate existing card objects when reviewing.
