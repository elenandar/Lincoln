# Lincoln v17 - Scripts Directory

This directory contains the AI Dungeon scripts for Project Lincoln v17.

## Current Phase: Phase 0 - Null System Foundation

**Status:** ✅ Complete  
**Version:** 17.0.0-phase0  
**Date:** October 26, 2025

### Scripts Overview

| Script | Purpose | Status |
|--------|---------|--------|
| `Library.txt` | Global LC object, commands registry, initialization | ✅ Working |
| `Input.txt` | Input modifier - handles player commands | ✅ Working |
| `Output.txt` | Output modifier - processes AI responses | ✅ Working |
| `Context.txt` | Context modifier - manages story context | ✅ Working |

### Phase 0 Implementation

Phase 0 establishes the foundation for Lincoln v17 by creating empty but fully functional scripts that load without errors in AI Dungeon.

**What's Implemented:**
- ✅ Basic LC object structure in Library.txt
- ✅ Commands registry (ES5-compatible plain object)
- ✅ `/ping` command for health check verification
- ✅ Minimal modifier pattern in Input/Output/Context
- ✅ Safe text handling (empty/undefined checks)
- ✅ Proper script slot initialization via LC.lcInit()

**What's NOT Implemented Yet:**
- ❌ No actual game logic or NPC systems
- ❌ No state persistence
- ❌ No engines (Qualia, Information, Relations, etc.)
- ❌ No world simulation
- ❌ Scripts just pass through text unchanged (except for /ping)

### Usage in AI Dungeon

1. Upload all four .txt files to your AI Dungeon scenario's script editor
2. Scripts load in this order each turn:
   - Library.txt (executes 3x: before Input, Context, and Output)
   - Input.txt (processes player input)
   - Context.txt (manages story context)
   - Output.txt (processes AI output)

3. Test with `/ping` command:
   - Type `/ping` in the game
   - Expected response: "⟦SYS⟧ Pong! Lincoln v17.0.0-phase0 is active."

### Testing

Run the verification test suite:

```bash
node Scripts/test-phase0.js
```

**Test Results:**
- ✅ 23/23 tests passing (100% success rate)
- ✅ All scripts load without errors
- ✅ `/ping` command functional
- ✅ Error handling verified
- ✅ Edge cases handled correctly

### Next Steps (Phase 1)

Phase 1 will implement the infrastructure layer:
- lcInit with full state.lincoln structure
- LC.Tools (safety utilities)
- LC.Utils (type conversion)
- currentAction tracker
- LC.Flags compatibility facade
- LC.Drafts message queue
- LC.Turns counter
- CommandsRegistry enhancements

See `/v17.0/PROJECT_LINCOLN_v17_MASTER_PLAN_v2.md` for the complete roadmap.

### Technical Notes

- **ES5 Compliance:** Scripts use ES5-compatible patterns (plain objects, not Map/Set)
- **const/let Support:** AI Dungeon supports const/let despite being ES5 runtime
- **Error Handling:** All modifiers safely handle empty/undefined text
- **Execution Model:** Library.txt runs before each hook (3x per turn)
- **No Dependencies:** Phase 0 has zero external dependencies

### Version History

- **17.0.0-phase0** (Oct 26, 2025) - Null System Foundation established
