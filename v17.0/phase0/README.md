# Phase 0: Null System - Empty but Functional Scripts

## Overview

This directory contains Phase 0 (Null System) implementation for Project Lincoln v17. These are four empty but functional AI Dungeon modifier scripts that successfully load without errors and provide basic system infrastructure.

## Files

### 1. Library.txt (Shared Library)
- **Size:** ~9KB
- **Purpose:** One-time initialization of the Lincoln v17 system
- **Features:**
  - Creates `state.shared.LC` global object with VERSION '17.0.0-phase0'
  - Initializes `state.lincoln` with complete data structure
  - Registers system commands: `/ping`, `/debug`, `/test-phase0`, `/help`
  - Provides `lcInit()` function for state initialization
  - All engines present as empty placeholders

### 2. Input.txt (Input Modifier)
- **Size:** ~3KB
- **Purpose:** Processes user input before sending to AI
- **Features:**
  - Detects commands starting with `/`
  - Parses command and arguments
  - Executes handlers from `CommandsRegistry`
  - Handles unknown commands gracefully
  - Passes through non-command text unchanged

### 3. Output.txt (Output Modifier)
- **Size:** ~2KB
- **Purpose:** Post-processes AI output (Phase 0: pass-through)
- **Features:**
  - Simple pass-through for Phase 0
  - Initializes state if needed
  - Later phases will add analysis and state updates

### 4. Context.txt (Context Modifier)
- **Size:** ~2KB
- **Purpose:** Modifies context before AI generation (Phase 0: pass-through)
- **Features:**
  - Simple pass-through for Phase 0
  - Initializes state if needed
  - Later phases will add context overlays

## ES5 Compliance

All scripts are **strictly ES5 compliant** to work in AI Dungeon's JavaScript environment:

✅ **ALLOWED:**
- `var` declarations
- `function` expressions
- Traditional `for` loops
- `Array.indexOf()`, `Array.slice()`, `Array.join()`
- Plain objects `{}` and arrays `[]`

❌ **FORBIDDEN:**
- Arrow functions `=>`
- Template literals `` `${var}` ``
- `const` / `let` declarations
- Destructuring `{x, y} = obj`
- Spread operator `...`
- `Array.includes()`, `Array.find()`
- `Map`, `Set`, `Promise`
- `async` / `await`
- `for...of` loops

## Available Commands

### `/ping`
System health check.
```
> /ping
⟦SYS⟧ Pong! Lincoln v17.0.0-phase0 operational.
```

### `/debug`
Display current system state.
```
> /debug
⟦SYS⟧ === DEBUG INFO ===
Version: 17.0.0
Turn: 0
State version: 0
Characters: 0
Time: Day 1 (Monday), morning
```

### `/test-phase0`
Run automated verification tests.
```
> /test-phase0
⟦SYS⟧ ✅ Phase 0 verification PASSED
All 12 tests successful!
```

### `/help`
Show available commands.
```
> /help
⟦SYS⟧ === AVAILABLE COMMANDS ===
/ping - Check system status
/debug - Show state information
/test-phase0 - Run Phase 0 verification tests
/help - Show this help message
```

## State Structure

### state.shared.LC
Global Lincoln object containing:
- `VERSION`: '17.0.0-phase0'
- `lcInit()`: Initialization function
- `CommandsRegistry`: Plain object of command handlers
- `Tools`, `Utils`: Utility objects (empty in Phase 0)
- All engine objects (empty in Phase 0)

### state.lincoln
Main state object containing:
- **Metadata:** version, stateVersion, turn
- **Character data:** characters object
- **Social structures:** relations, hierarchy, rumors
- **World state:** time, environment
- **Data stores:** evergreen, goals, secrets
- **Cultural memory:** myths, lore
- **Internal cache:** _cache object

## Testing

### Automated Tests
Run the test script:
```bash
node test_phase0.js
```

Tests verify:
- File existence and syntax
- Script execution without errors
- State structure correctness
- Command registration and execution
- ES5 compliance
- Modifier pattern correctness

### Manual Testing in AI Dungeon

1. **Deploy scripts:**
   - Input Modifier → paste `Input.txt`
   - Output Modifier → paste `Output.txt`
   - Context Modifier → paste `Context.txt`
   - Shared Library → paste `Library.txt`
   - Click Save

2. **Reload game:**
   - Refresh browser (F5)
   - Open console (F12) → check for errors
   - If no errors → ✅ scripts loaded

3. **Test commands:**
   ```
   > /ping
   > /debug
   > /test-phase0
   > /help
   > /unknown
   ```

4. **Test persistence:**
   - Save game
   - Close and reopen scenario
   - Run `/debug` again
   - Verify state persisted

## Deployment to AI Dungeon

Copy and paste scripts in this order:
1. Open AI Dungeon scenario settings
2. Navigate to "Scripts" section
3. Paste scripts:
   - **Input Modifier** ← `Input.txt`
   - **Output Modifier** ← `Output.txt`
   - **Context Modifier** ← `Context.txt`
   - **Shared Library** ← `Library.txt`
4. Click "Save"
5. Reload scenario (F5)
6. Check console for errors (F12)
7. Test with `/ping` command

## Success Criteria

Phase 0 is complete when:
- ✅ All 4 scripts created
- ✅ ES5 compliance verified
- ✅ Modifier pattern correct in all files
- ✅ CommandsRegistry is plain object
- ✅ All automated tests pass (30/30)
- ✅ Scripts load in AI Dungeon without console errors
- ✅ `/ping`, `/debug`, `/test-phase0` commands work
- ✅ State persists across save/load

## Next Steps

**Phase 1: Infrastructure**
- Implement Tools (regex safety, sanitization)
- Implement Utils (type converters, validators)
- Add Flags system
- Add Turns tracking
- Add basic Commands expansion

## Technical Notes

### Modifier Pattern
Every script follows this pattern:
```javascript
var modifier = function(text) {
  // ... code here ...
  return {text: text};
};

modifier(text); // CRITICAL: Must call!
```

### State Versioning
Every write to `state.lincoln` must increment `stateVersion`:
```javascript
state.lincoln.characters['Alice'] = {...};
state.lincoln.stateVersion++;  // REQUIRED!
```

### Story Cards
Use global `storyCards` variable, NOT `state.storyCards`:
```javascript
var cards = storyCards;  // ✅ CORRECT
// var cards = state.storyCards;  // ❌ WRONG
```

## References

- **Master Plan:** `/v17.0/PROJECT_LINCOLN_v17_MASTER_PLAN_v2.md`
- **Agent Spec:** `/.github/copilot/agents/lincoln-dev.yml`
- **Issue:** [Phase 0] Implement Null System - Empty but functional scripts

## Version

- **Lincoln Version:** 17.0.0
- **Phase:** 0 (Null System)
- **Status:** ✅ Complete
- **Last Updated:** 2025-10-26
