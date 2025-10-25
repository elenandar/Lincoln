# Lincoln v17.0.0-alpha.1 - Phase 1: Infrastructure

This directory contains the Phase 1 implementation of Project Lincoln v17, as specified in `MASTER_PLAN_v17.md`.

## Status: ✅ PHASE 1 COMPLETE

All success criteria from the master plan have been met.

## Files

### Core Scripts (for AI Dungeon)
- **Library.js** - Core infrastructure, state management, command registry, utilities
- **Input.js** - Command parsing and execution
- **Context.js** - Pass-through implementation (Phase 1)
- **Output.js** - Turn counter and system message display

### Testing
- **test_phase1.js** - Automated test suite for Phase 1 functionality

## Implementation Details

### Phase 1 Components

According to MASTER_PLAN_v17.md, Phase 1 includes:

1. **lcInit & State Management (#33)** ✅
   - Global `LC` namespace
   - `LC.lcInit(caller)` function
   - State structure in `state.shared.lincoln`

2. **System Messages** ✅
   - `LC.sysLine(msg)` - Format single line
   - `LC.sysBlock(lines)` - Format message block
   - `LC.pushNotice(msg)` / `LC.consumeNotices()` - Notice queue
   - `LC.lcSys(msg)` / `LC.lcConsumeMsgs()` - System message queue

3. **CommandsRegistry (#24)** ✅
   - Command registry as `Map`
   - `/ping` command - Responds with "Pong!"
   - `/debug on|off` - Toggle debug mode

4. **currentAction (#34)** ✅
   - Object model for tracking action type
   - Types: `story`, `command`, `retry`, `continue`

5. **LC.Tools (#19)** ✅
   - `safeRegexMatch(text, regex, timeout)` - Stub implementation

6. **LC.Utils (#20)** ✅
   - `toNum(x, default)` - Safe number conversion
   - `toStr(x)` - Safe string conversion
   - `toBool(x, default)` - Safe boolean conversion

7. **LC.Flags (#21)** ✅
   - Compatibility facade with stub functions

8. **LC.Drafts (#22)** ✅
   - Draft structures for recap/epoch

9. **LC.Turns (#23)** ✅
   - `incIfNeeded(L)` - Increment turn for story actions
   - `turnSet(n)` - Set turn to value
   - `turnUndo(n)` - Undo turns

## Testing

Run the test suite:

```bash
cd v17.0
node test_phase1.js
```

### Test Coverage

All 11 tests pass:

1. ✅ Scripts load without errors
2. ✅ State initializes correctly
3. ✅ `/ping` command responds with "Pong!"
4. ✅ `/debug on` enables debug mode
5. ✅ `/debug off` disables debug mode
6. ✅ Unknown command produces error message
7. ✅ Turn counter increments for story actions
8. ✅ Turn counter does not increment for commands
9. ✅ System messages are displayed in output
10. ✅ Multiple story actions increment turn correctly
11. ✅ LC.Utils type conversion works correctly

## Usage in AI Dungeon

1. Copy the content of each `.js` file into the corresponding script slot in AI Dungeon:
   - `Library.js` → Library script
   - `Input.js` → Input Modifier script
   - `Context.js` → Context Modifier script
   - `Output.js` → Output Modifier script

2. Test the implementation:
   - Enter `/ping` → Should respond with `⟦SYS⟧ Pong!`
   - Enter `/debug on` → Should respond with `⟦SYS⟧ Debug ON.`
   - Enter `/debug off` → Should respond with `⟦SYS⟧ Debug OFF.`
   - Make a story action → Turn counter should increment

## Success Criteria (from MASTER_PLAN_v17.md)

✅ **All criteria met:**

1. Game loads without errors
2. `/ping` command works
3. `/debug on|off` commands work
4. Turn counter increments for story actions, not for commands

## Next Steps

Phase 1 provides the "skeleton" of the system. It manages state and allows debugging through commands, but doesn't simulate anything yet.

**Next phase:** Phase 2 - Physical World (TimeEngine, EnvironmentEngine, ChronologicalKnowledgeBase)

## Architecture Notes

- **No v16 code copied** - All code written from scratch based on MASTER_PLAN_v17.md
- **Clean slate approach** - Building on proven concepts with fresh implementation
- **Minimal implementation** - Only what's needed for Phase 1
- **Testing first** - All functionality verified before moving to next phase

## Version

**v17.0.0-alpha.1** - Phase 1: Infrastructure Complete
