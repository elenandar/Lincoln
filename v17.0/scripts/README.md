# Lincoln v17.0 - Scripts Directory

This directory contains the Lincoln v17 script files for AI Dungeon.

## Phase 1.3: CommandsRegistry (✅ Complete)

The CommandsRegistry phase implements a centralized system for registering and executing slash commands (`/command`). This provides the foundation for all future command-based functionality.

### New Features

**Library.js additions:**
- `CommandsRegistry` Map initialization in `lcInit()`
- `LC.registerCommand(name, definition)` - Register new slash commands
- `LC.sanitizeInput(text)` - Clean player input (remove `> ` prefix, trim whitespace)
- `/ping` test command - Built-in command for testing

**Input.js complete rewrite:**
- Sanitizes all player input using `LC.sanitizeInput()`
- Detects commands starting with `/`
- Parses command name and arguments
- Executes registered command handlers
- Shows error for unknown commands
- Commands return `{text: "", stop: true}` to prevent adding to history
- Normal input is sanitized and passed through to AI

### Usage Example

```javascript
// Register a new command in library.js:
LC.registerCommand("/help", {
  description: "/help - Shows available commands",
  handler: function(args) {
    LC.lcSys("Available commands: /ping, /help");
  }
});

// Player types: /ping
// Result: ⟦SYS⟧ Pong!

// Player types: /unknown
// Result: ⟦SYS⟧ Unknown command: "/unknown"

// Player types: > Look around
// Result: Text "Look around" goes to AI (> prefix removed)
```

### Testing

Run the test suites to verify CommandsRegistry:

```bash
cd v17.0/scripts
node test_commands_registry.js           # Comprehensive tests
node test_phase_1_3_acceptance.js        # Acceptance criteria validation
```

All tests should pass with ✅ marks.

---

## Phase 1.2: System Messages (✅ Complete)

The System Messages phase builds on the Zero System to provide a centralized mechanism for collecting and displaying system diagnostic messages. This is a critical tool for monitoring all future engines and systems.

### New Features

**Library.js additions:**
- `sys_msgs` array initialization in `lcInit()`
- `LC.lcSys(message)` - Add a message to the system queue
- `LC.lcConsumeMsgs()` - Retrieve and clear all messages
- `LC.sysBlock(messages)` - Format messages with ⟦SYS⟧ prefix

**Output.js enhancement:**
- Automatically displays system messages before AI text
- Messages appear in a formatted block with separators
- Empty queue results in no output (backward compatible)

### Usage Example

```javascript
// In any script, add a system message:
LC.lcSys("Character initialized");
LC.lcSys("Turn counter: 5");

// Output.js will automatically display:
// ========================================
// ⟦SYS⟧ Character initialized
// ⟦SYS⟧ Turn counter: 5
// ========================================
// 
// [AI generated text follows...]
```

### Testing

Run the test suites to verify System Messages:

```bash
cd v17.0/scripts
node test_system_messages.js       # Comprehensive tests
node test_acceptance_criteria.js   # Acceptance criteria validation
node demo_system_messages.js       # Interactive demo
```

All tests should pass with ✅ marks.

### Status

**Phase 1.2 Status**: ✅ **COMPLETE**

All acceptance criteria met:
- ✅ `sys_msgs` array initialized in `lcInit()`
- ✅ `LC.lcSys()`, `LC.lcConsumeMsgs()`, `LC.sysBlock()` implemented
- ✅ Output.js displays messages before AI text
- ✅ Backward compatible (no output when queue empty)
- ✅ All tests passing

Ready to proceed to Phase 1.3 (CommandsRegistry).

---

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

With the Zero System complete, Phase 1.2 (System Messages) has been implemented.

Remaining Phase 1 tasks:
- Phase 1.3: CommandsRegistry (#24)
- Phase 1.4: currentAction
- Phase 1.5: LC.Tools, LC.Utils
- Phase 1.6: LC.Flags
- Phase 1.7: LC.Drafts, LC.Turns

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
