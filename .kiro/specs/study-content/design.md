# Design: Study Content
- Engine: add `src/engine/decks.ts` with pure functions `createDeck`, `addCard`, `removeCard`, `setExamDay`,
  `exportDeck`, `importDeck`. IDs are injected (no random calls in the engine).
- Note-to-cards generation lives OUTSIDE the engine (it is I/O): `src/ui/generate.ts`, with a deterministic
  fallback that splits "term: definition" lines when no LLM is available. Optional MCP server provides extraction.
- Validation returns `Result<T, string>` instead of throwing.
- PBT: export then import is identity; adding an invalid card never changes state.
