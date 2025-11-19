# Lincoln v17 — Canonical Types Spec

This file defines canonical data shapes for `state.lincoln` and expected global types the engines interact with.

## 1. Globals (read)

```js
// history item (merged from official + community observations)
{
  text: string,
  type: "do" | "say" | "story" | "continue" | "see" | "repeat" | "start" | "unknown",
  rawText: string // optional in practice
}

// info (subset; Context-only fields noted)
{
  actionCount: number,
  characters?: any[], // MP use-cases
  // Context-only:
  memoryLength?: number,
  maxChars?: number
}
```

## 2. state.lincoln (root)

```js
{
  version: "17.0.0",
  stateVersion: number,   // MUST increment after every write
  turn: number,           // managed by TimeEngine
  // Context metadata (read-only outside Context)
  maxChars?: number,
  memoryLength?: number,
  actionCount?: number,

  // Core domains
  characters: { [name: string]: Character },
  relations: { [from: string]: { [to: string]: number } },  // [-100, 100]
  hierarchy: { [name: string]: { status: "leader" | "member" | "outcast", capital: number, last_updated: number } },
  rumors: any[],          // GossipEngine (TBD)
  lore: any[],            // LoreEngine entries
  myths: any[],           // MemoryEngine outputs
  time: any,              // TimeEngine structure
  environment: any,       // EnvironmentEngine structure
  evergreen: any[],       // Evergreen facts
  goals: { [name: string]: Goal[] }, // Goals per character
  secrets: any[],         // KnowledgeEngine

  // Story Cards fallback when Memory Bank is disabled
  fallbackCards: { keys: string | string[], entry: string, type: string }[],

  // Internal cache/scratch (engines must treat as ephemeral)
  _cache: any
}
```

### 2.1 Character

```js
{
  qualia_state: {
    somatic_tension: number, // [0..1]
    valence: number,         // [0..1]
    focus_aperture: number,  // [0..1]
    energy_level: number     // [0..1]
  },

  perceptions: {
    [targetName: string]: {
      trust: number,       // [0..1]
      respect: number,     // [0..1]
      competence: number,  // [0..1]
      affection: number    // [0..1]
    }
  },

  self_concept: {
    // domain of CrucibleEngine (TBD granular traits)
  },

  personality: {
    trust: number,     // [0..1]
    bravery: number,   // [0..1]
    idealism: number,  // [0..1]
    aggression: number // [0..1]
  },

  mood: string,  // derived label (MoodEngine)

  goals: Goal[]  // Goal list
}
```

### 2.2 Goal

```js
{
  id: string,
  title: string,
  status: "active" | "completed" | "failed" | "suspended",
  progressStage: number, // mini-arc stage
  progressScore: number, // arbitrary [0..1] scaling
  notes?: string
}
```

## 3. Ranges & Invariants

- Qualia values clamped to [0.0, 1.0].
- Perception values clamped to [0.0, 1.0].
- Relations clamped to [-100, 100].
- `stateVersion` increments after ANY write into `state.lincoln.*`.
- Engines MUST NOT write into another engine's domain except via public API.
