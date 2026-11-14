# Requirements: Monster System
Four MVP creatures, all FACELESS (see steering/no-faces.md). Strength is always 0..100.

## User stories
- As a student, I want my habits to visibly affect the monsters so I feel the consequences and rewards.

## Acceptance criteria (EARS)
1. WHEN a day passes with no study, THE WENDIGO SHALL gain hunger; WHEN a card is answered correctly, it SHALL lose a little.
2. WHEN a card is answered incorrectly, THE BANSHEE SHALL gain strength; WHEN answered correctly, it SHALL lose a little.
3. WHILE a deck's exam is within 14 days, THE JERSEY DEVIL SHALL be active with strength equal to the percentage of unmastered cards.
4. IF no exam is set, or it is further than 14 days away, THEN THE JERSEY DEVIL SHALL be dormant at strength 0.
5. THE BIGFOOT SHALL reflect the percentage of cards never reviewed or not reviewed in 7 days.
6. THE SYSTEM SHALL keep every monster strength within 0..100 for any sequence of events.
7. WHEN a monster's strength reaches 0 after being active, THE SYSTEM SHALL add it to the bestiary.
8. STRETCH: Mothman (late-night cramming) and Chupacabra (focus loss) after core freeze, only if time allows.

## Rendering contract
Presentation receives `MonsterView { id, strength, active }` only. No game rules in rendering code.
