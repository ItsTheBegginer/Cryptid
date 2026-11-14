---
inclusion: always
---
# Product: Cryptid Study Quest

A study app where learning habits are mirrored by faceless cryptid threats.
Correct answers and consistent study weaken the monsters; neglect and cramming feed them.

- Audience: students who struggle with consistency and cramming.
- Core loop: study cards -> answers update the schedule -> monsters react.
- Build order is strict: FUNCTIONALITY FIRST, ART SECOND.
  The engine (src/engine) is pure logic and must never import UI or rendering code.
  Visuals plug in through src/presentation/MonsterRenderer.ts only.
