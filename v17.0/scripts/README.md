# Lincoln v17.0 - Scripts Directory

This directory contains the Lincoln v17 script files for AI Dungeon.

## Phase 1.1: Zero System (✅ Complete)

The Zero System is the foundation of Project Lincoln v17. It consists of four scripts that form a stable, non-interfering base for all future development.

### Files

1. **library.js** - The core library script
   - Creates the global `LC` object
   - Implements `LC.lcInit()` for state management
   - Initializes `state.shared.lincoln` with lazy initialization

2. **input.js** - Input modifier (pass-through)
   - Processes player input before it enters the game
   - Calls `LC.lcInit()` to ensure state is initialized
   - Currently passes all text through unchanged

3. **context.js** - Context modifier (pass-through)
   - Processes the context sent to the AI
   - Calls `LC.lcInit()` to ensure state is initialized
   - Currently passes all text through unchanged

4. **output.js** - Output modifier (pass-through)
   - Processes AI output before displaying to player
   - Calls `LC.lcInit()` to ensure state is initialized
   - Currently passes all text through unchanged

### Loading Scripts in AI Dungeon

To use these scripts in AI Dungeon, load them in the following order:

1. Library.js (Library script slot)
2. Input.js (Input modifier slot)
3. Context.js (Context modifier slot)
4. Output.js (Output modifier slot)

### Key Features

- **Stability**: All scripts load without errors
- **Non-interference**: Game behavior is unchanged
- **State initialization**: `state.shared.lincoln` is created and ready
- **Failsafe**: All modifiers work even if library fails to load

### Testing

Run the test suite to verify the Zero System:

```bash
cd v17.0/scripts
node test_zero_system.js
```

All tests should pass with green checkmarks (✓).

### Next Phase

With the Zero System complete, we're ready for Phase 1.2:
- System Messages
- CommandsRegistry
- currentAction
- LC.Tools, LC.Utils, LC.Flags
- LC.Drafts, LC.Turns

See `MASTER_PLAN_v17.md` for the full development roadmap.

## Architecture

### lcInit() Function

The `LC.lcInit()` function is the cornerstone of state management:

```javascript
LC.lcInit = function() {
  // Check if state.shared.lincoln already exists
  if (state && state.shared && state.shared.lincoln) {
    return state.shared.lincoln;
  }

  // Initialize state.shared if it doesn't exist
  if (!state.shared) {
    state.shared = {};
  }

  // Initialize state.shared.lincoln
  state.shared.lincoln = {};

  // Return the initialized state
  return state.shared.lincoln;
};
```

This pattern ensures:
- State is only initialized once (idempotent)
- Safe to call from any script
- Returns consistent reference to lincoln state
- Handles missing `state.shared` gracefully

### Modifier Pattern

All three modifiers (input, context, output) follow the same pattern:

```javascript
var modifier = (text) => {
  // Failsafe: If LC is not defined, return text unchanged
  if (typeof LC === 'undefined') {
    return { text: String(text || '') };
  }

  // Initialize Lincoln state (even if not used yet)
  const L = LC.lcInit();

  // Pass-through: Return text unchanged
  return { text: String(text || '') };
};
```

This ensures:
- Graceful degradation if library fails to load
- State is initialized on every modifier call
- Text is always returned safely
- No game interference during Phase 1.1

## Status

**Phase 1.1 Status**: ✅ **COMPLETE**

All acceptance criteria met:
- ✅ Four files created in v17.0/scripts/
- ✅ Scripts load without errors
- ✅ No interference with game behavior
- ✅ `state.shared.lincoln` exists as empty object `{}`
- ✅ All tests passing

Ready to proceed to Phase 1.2.
