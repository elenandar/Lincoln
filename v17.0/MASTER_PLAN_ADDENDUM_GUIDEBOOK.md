# Lincoln v17 — Master Plan Addendum: External Alignment (Official Guidebook + Featured Scripts)

Status: APPROVED FOR INTEGRATION
Scope: This addendum aligns v17 with the official Scripting Guidebook and featured community scripts.

## A. Execution Order (Verified)

- Hooks and scripts execute in this order (per turn):
  - onInput → sharedLibrary → Input
  - onModelContext → sharedLibrary → Context
  - onOutput → sharedLibrary → Output
- Architectural implication (unchanged):
  - LC is recreated before each hook; engines are stateless; persistent data is only in `state.lincoln`.
  - Do NOT attempt `state.shared` (does not exist).

## B. Context Layout (Canonical)

Order of segments (from Guidebook):
1) "AI Instructions"
2) "Plot Essentials"
3) World Lore: triggered Story Cards
4) Story Summary
5) Memories
6) Recent Story
7) [Author's note: …]
8) "AI's last response or your last action"
9) frontMemory

Lincoln policy:
- We will implement `LC.ContextComposer.build(parts)` in Phase 8 with a strict truncation strategy:
  - First trim low-priority tail of "Recent Story" to respect `info.maxChars`, preserving the upper segments (Instructions/Lore/Summary/Memories/Author's Note).
- Context-only metadata: `info.maxChars`, `info.memoryLength` (available in Context only) MUST be read here.

## C. Story Cards: Safe Usage and Fallback

- Built-in API: `addStoryCard(keys, entry, type)`, `updateStoryCard(index, keys, entry, type)`, `removeStoryCard(index)`.
- Platform caveat: When Memory Bank is OFF, Story Cards manipulation fails.
- Lincoln wrapper (Phase 1–2):
  - `LC.StoryCards.available()` checks availability.
  - On unavailable: push entries into `state.lincoln.fallbackCards` (with `{keys, entry, type}`).
  - On success: ALWAYS increment `state.lincoln.stateVersion++` after mutations.
- ES5 baseline: NO `.find()/.findIndex()` in our code; use for-loops.

## D. Console Logging Behavior

- In AI Dungeon logs, `undefined` is serialized as `null` (GraphQL JSON).
- Lincoln logging utility:
  - `LC.Tools.safeLog(label, value)` prints the type tag: UNDEFINED/NULL/typeof(value) to avoid confusion.

## E. ES5 Compliance (Delta)

- Keep strict ES5 baseline:
  - Forbidden: Map/Set/WeakMap, Array.includes/find/findIndex, Object.assign, destructuring, spread, for...of, class, async/await/Promise.
  - Prefer: plain objects/arrays, `indexOf() !== -1`, `for (var i = 0; i < ...; i++) {}`, manual object copy.
- Allowed (tested): `const/let`, arrow functions (monitor; fallback to `function` if needed), `Object.keys`, JSON.*.
- Template literals: permit only after scenario smoke-test; otherwise favor concatenation.

## F. Hook Pipelines vs Director Pattern

- Community "director" chains modifiers (flexible, but harder to trace).
- Lincoln policy:
  - Core uses fixed, explicit pipeline order via `UnifiedAnalyzer` (Level 1→4).
  - Optional `LC.Hooks` (simple chain runner) may be introduced for debug/test only; not core.

## G. Action Types (history)

- Canonical types include: `"do"`, `"say"`, `"story"`, `"continue"`.
- Community scripts also encounter: `"see"`, `"repeat"`, `"start"`, `"unknown"`.
- Lincoln analyzers MUST tolerate extended set when reading `history`.

## H. Types Specification

- Introduce `v17.0/TYPES_SPEC.md` as canonical source of data shapes (state.lincoln, global types). Engines MUST adhere to it.
- Purpose: keep engine boundaries clear; reduce drift across codegen iterations.

## I. State Audit (Optional, Phase 8)

- `LC.StateAudit`: fixed-length ring buffer of last N mutations:
  - `{ turn, engine, path, oldValue?, newValue?, timestamp }`
  - Helps troubleshoot regressions; constrain to e.g., 200 entries.

## J. Goals as Mini-Arcs

- Extend `GoalsEngine` with progression fields:
  - `{ status: "active|completed|failed|suspended", progressStage: number, progressScore: number }`
- Add `GoalsEngine.evaluate(events)` to advance progress based on extracted events.

## K. Integration Tasks (to be appended to Roadmap)

1) Phase 1–2:
   - Implement `LC.StoryCards` wrapper.
   - Add `LC.Tools.safeLog`.
   - Update ES5 checker to include `.find(` and `.findIndex(`.
2) Phase 3:
   - Add `TYPES_SPEC.md` and link all engine specs to it.
3) Phase 4:
   - Update analyzers to accept extended `history[*].type`.
4) Phase 8:
   - Implement `LC.ContextComposer.build()` with truncation policy.
   - Optional: `LC.StateAudit` buffer.

Links:
- Official Guidebook: confirms hook order, memory and context behavior.
- Featured scripts: reinforce data-driven approach and modular isolation.
