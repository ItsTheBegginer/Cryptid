---
inclusion: always
---
# Code style
- Small pure functions with explicit types; no `any`.
- Every engine module has a matching file in tests/ with at least one property-based test.
- Name constants in UPPER_SNAKE_CASE in one place (src/engine/constants.ts); no magic numbers.
- Comments explain why, not what.
