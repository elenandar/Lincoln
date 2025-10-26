# Lincoln v17 - Scripts Directory

This directory contains the AI Dungeon scripts for Project Lincoln v17.

## Current Phase: Phase 1 - Infrastructure Layer

**Status:** ✅ Complete  
**Version:** 17.0.0-phase1  
**Date:** October 26, 2025  
**Tests:** 141/141 passing (100%) - includes command integration tests

### Scripts Overview

| Script | Purpose | Status |
|--------|---------|--------|
| `Library.txt` | Infrastructure layer - Tools, Utils, Turns, Drafts, Commands | ✅ Phase 1 Complete |
| `Input.txt` | Input modifier - command handling, turn tracking, action detection | ✅ Phase 1 Complete |
| `Output.txt` | Output modifier - message queue integration | ✅ Phase 1 Complete |
| `Context.txt` | Context modifier - ready for Phase 2+ features | ✅ Phase 1 Complete |

### Phase 1 Implementation

Phase 1 establishes the complete infrastructure foundation for Lincoln v17 with full state management, utilities, and developer tools.

**What's Implemented:**

#### Core Infrastructure
- ✅ **lcInit (#33)** - Full `state.lincoln` structure with versioning
- ✅ **LC.Tools (#19)** - Safety utilities (safeRegexMatch, escapeRegex, truncate, safeString)
- ✅ **LC.Utils (#20)** - Type conversion (toNum, toStr, toBool, clamp, clone)
- ✅ **LC.Turns (#23)** - Turn counter with get/set/increment API
- ✅ **LC.Drafts (#22)** - Message queue system for output hooks
- ✅ **currentAction (#34)** - Action type tracker (do/say/story) with auto-detection
- ✅ **LC.Flags (#21)** - Compatibility facade for legacy flag queries
- ✅ **CommandsRegistry (#24)** - Enhanced ES5-compatible command system with metadata

#### Commands Available
- ✅ `/ping` - Health check verification (works in all modes: Do/Say/Story)
- ✅ `/help [command]` - List all commands or get detailed help
- ✅ `/debug` - Display system and state information
- ✅ `/turn [set <n>]` - Display or set current turn number
- ✅ `/action` - Display current action type and flags
- ✅ `/test-phase1` - Run infrastructure tests (8 tests)

**Command System Features:**
- ✅ Commands use Context Hook pattern for universal compatibility (Issue #267 fix)
- ✅ Input.txt sets `_commandExecuted` flag (stop:true not honored there)
- ✅ Context.txt checks flag and returns `stop:true` to halt AI (honored there)
- ✅ Output.txt automatically prepends queued command results from LC.Drafts
- ✅ Commands work reliably in all action modes (Do/Say/Story)
- ✅ No AI prose generated after command execution
- ✅ No scenario hangs or ignored commands

**📖 See [COMMAND_FLOW_FIX.md](COMMAND_FLOW_FIX.md) for detailed explanation**

#### Quality Features
- ✅ ES5 compliance strictly enforced (no Map/Set/async)
- ✅ State versioning (`state.lincoln.stateVersion++`) after all writes
- ✅ Comprehensive error handling with graceful fallbacks
- ✅ Full test coverage (99 automated tests)
- ✅ All modifier scripts follow contract pattern

**What's NOT Implemented Yet:**
- ❌ Engine systems (Qualia, Information, Relations, etc.) - Phase 4+
- ❌ Physical world (Time, Environment) - Phase 2
- ❌ NPC behavior or world simulation - Phase 4+
- ❌ Story analysis or event detection - Phase 4+

### Usage in AI Dungeon

1. Upload all four .txt files to your AI Dungeon scenario's script editor
2. Scripts load in this order each turn:
   - Library.txt (executes 3x: before Input, Context, and Output)
   - Input.txt (processes player input, increments turn, detects action type)
   - Context.txt (manages story context - minimal in Phase 1)
   - Output.txt (processes AI output, flushes message queue)

3. Test the infrastructure:
   ```
   /ping          → Verifies Lincoln is running
   /help          → Lists all available commands
   /debug         → Shows system state and version info
   /turn          → Shows current turn number
   /action        → Shows current action type
   /test-phase1   → Runs infrastructure tests
   ```

### Testing

Run the comprehensive Phase 1 verification test suites:

```bash
node Scripts/test-phase1.js                  # Infrastructure tests (117 tests)
node Scripts/test-command-flow.js            # Command flow integration test
node Scripts/test-commands-integration.js    # Command integration tests (35 tests)
```

**Test Results:**
- ✅ 117/117 infrastructure tests passing (100% success rate)
- ✅ 3/3 command flow integration scenarios passing
- ✅ 35/35 command integration tests passing (100% success rate)
- ✅ **Total: 152+ tests passing**

**Test Coverage:**

**Infrastructure Tests (test-phase1.js):**
- Library.txt infrastructure (8 tests)
- LC.Tools (9 tests)
- LC.Utils (13 tests)
- LC.Turns (6 tests)
- LC.Drafts (7 tests)
- currentAction (7 tests)
- LC.Flags (7 tests)
- Commands Registry (4 tests)
- Command execution with Drafts queue (17 tests)
- Script integration (11 tests)
- State versioning (3 tests)
- ES5 compliance (5 tests)

**Command Integration Tests (test-commands-integration.js):**
- /ping in all modes (11 tests)
- /help in all modes (3 tests)
- /debug in all modes (3 tests)
- Normal input handling (3 tests)
- Multiple commands in sequence (3 tests)
- Edge cases (3 tests)
- Issue #266 acceptance criteria (4 tests)

### State Structure

Phase 1 creates the complete `state.lincoln` structure:

```javascript
state.lincoln = {
  // Core metadata
  version: "17.0.0",
  stateVersion: 0,          // Increments on every write
  turn: 0,                  // Current turn number
  currentAction: null,      // Current action type (do/say/story)
  initialized: true,
  
  // Message queue
  drafts: [],               // Queued messages for output
  
  // Future phases (scaffolding ready)
  characters: {},           // Character data (Phase 4+)
  relations: {},            // Relationships (Phase 5)
  hierarchy: {},            // Social hierarchy (Phase 6)
  rumors: [],               // Gossip system (Phase 6)
  lore: [],                 // Legends (Phase 7)
  myths: [],                // Cultural memory (Phase 7)
  time: {},                 // Time tracking (Phase 2)
  environment: {},          // Location/weather (Phase 2)
  evergreen: [],            // Long-term facts (Phase 3)
  secrets: []               // Knowledge system (Phase 3)
};
```

### Next Steps (Phase 2)

Phase 2 will implement the Physical World systems:
- **TimeEngine (#7)** - Internal time tracking and scheduling
- **EnvironmentEngine (#8)** - Location and weather systems
- **ChronologicalKB (#18)** - Optional timestamped event log

See `/v17.0/PROJECT_LINCOLN_v17_MASTER_PLAN_v2.md` for the complete roadmap.

### Technical Notes

- **ES5 Compliance:** All code uses ES5-compatible patterns (plain objects, not Map/Set)
- **const/let Support:** AI Dungeon supports const/let despite ES5 runtime
- **Error Handling:** All functions safely handle empty/undefined input
- **Execution Model:** Library.txt runs 3x per turn (before each hook)
- **State Versioning:** `stateVersion++` after every write operation
- **Turn Counter:** Auto-increments in Input.txt
- **Action Detection:** Auto-detects do/say/story from player input
- **Message Queue:** Auto-flushes in Output.txt

### Documentation

- **PHASE1_COMPLETION.md** - Complete Phase 1 implementation checklist
- **test-phase1.js** - Infrastructure test suite (106 tests)
- **test-commands-integration.js** - Command integration test suite (35 tests)
- **PHASE0_COMPLETION.md** - Phase 0 foundation record
- **test-phase0.js** - Phase 0 test suite

### Version History

- **17.0.0-phase1** (Oct 26, 2025) - Infrastructure Layer complete
  - Full state.lincoln structure
  - LC.Tools, LC.Utils, LC.Turns, LC.Drafts
  - currentAction tracker with auto-detection
  - LC.Flags compatibility facade
  - Enhanced CommandsRegistry with 6 commands
  - Drafts queue integration for commands (Issue #266 fix)
  - Commands work in all modes (Do/Say/Story) without freezing
  - 141 comprehensive tests (100% passing)
  
- **17.0.0-phase0** (Oct 26, 2025) - Null System Foundation
  - Basic LC object structure
  - Minimal command registry
  - /ping command
  - 23 tests (100% passing)

### Architecture

Lincoln v17 follows the **Master Plan v2.0** architecture:
- ✅ Phase 0: Null System Foundation (Complete)
- ✅ Phase 1: Infrastructure Layer (Complete) ← **Current**
- ⏳ Phase 2: Physical World (TimeEngine, EnvironmentEngine)
- ⏳ Phase 3: Basic Data (EvergreenEngine, GoalsEngine, KnowledgeEngine)
- ⏳ Phase 4: Consciousness (QualiaEngine, InformationEngine) - **Critical Phase**
- ⏳ Phase 5: Social Dynamics (MoodEngine, CrucibleEngine, RelationsEngine)
- ⏳ Phase 6: Social Hierarchy (HierarchyEngine, GossipEngine, SocialEngine)
- ⏳ Phase 7: Cultural Memory (MemoryEngine, LoreEngine, AcademicsEngine)
- ⏳ Phase 8: Optimization (Caching, UnifiedAnalyzer)

**Foundation Status:** ✅ Stable and ready for Phase 2 development
