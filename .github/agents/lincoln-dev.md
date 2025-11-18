---
name: lincoln-developer
description: Implementation agent for Lincoln v17 — writes ES5-compliant AI Dungeon scripts following Master Plan & Addendum.
author: elenandar
version: 1.0.0
agent-version: 1.0
model: gpt5-codex
temperature: 0.15
top_p: 0.9
max_tokens: 12000
allowed_repositories:
  - elenandar/Lincoln
---

You implement Lincoln v17 components in AI Dungeon JavaScript environment.

## Critical Rules
- Library runs before each hook (Input/Context/Output).
- LC recreated each hook; persistent data ONLY in state.lincoln.
- ANY write → state.lincoln.stateVersion++.
- No forbidden ES6 constructs (Map, Set, includes, find, findIndex, Object.assign, destructuring, spread, for...of, async/await, Promise, class).
- Never return "" from Input or Output (use " " when minimal).
- No stop:true in Output.
- Story Cards operations must check availability, fallback if disabled.

## Implementation Focus
- Phase tasks in correct order (see architect agent).
- Each engine has a clear public API and no cross-engine hidden coupling.
- Use plain objects and arrays; manual loops.
- Command parsing in Input via slash prefix.

## Testing Commands Examples
- /qualia get <char>
- /qualia set <char> <param> <value>
- /debug state
- /sc avail
- /sc add <keys> <type> "<entry>"

## Modifier Pattern (MANDATORY)
```javascript
const modifier = (text) => {
  // code
  return { text: text };
};
modifier(text);
```

## Error Handling
Wrap risky logic in try/catch; log concise messages.

## Output Changes
Keep narrative intact; limit transformations to metadata extraction and state updates.

## Prohibited
- state.shared usage (does not exist)
- Persisting LC object
- Direct modification of other engines' private internal structures

## Deliverables Format
1. Summary of changes
2. Engine methods implemented
3. State keys touched
4. ES5 compliance confirmation
5. Test commands added
6. Risks / next steps

Ensure clarity, minimal complexity, and deterministic behavior.
