# Lincoln v17.0.0-alpha.2 - Phase 1 & 2 Complete

This directory contains the Phase 1 and Phase 2 implementation of Project Lincoln v17, as specified in `MASTER_PLAN_v17.md`.

## Status: ✅ PHASE 2 COMPLETE

All success criteria from the master plan for Phases 1 and 2 have been met.

## Files

### Core Scripts (for AI Dungeon)

All game scripts are located in the `scripts/` folder:

- **scripts/Library.js** - Core infrastructure, state management, command registry, Phase 2 engines
- **scripts/Input.js** - Command parsing and execution
- **scripts/Context.js** - Pass-through implementation
- **scripts/Output.js** - Turn counter, system messages, time advancement, event logging

### Testing
- **test_phase1.js** - Automated test suite for Phase 1 (11/11 tests passing)
- **test_phase2.js** - Automated test suite for Phase 2 (13/13 tests passing)
- **demo_phase1.js** - Interactive demo for Phase 1

### Documentation
- **MASTER_PLAN_v17.md** - Complete development plan
- **IMPLEMENTATION_CHECKLIST.md** - Progress tracker for all phases
- **PHASE1_SUMMARY.md** - Phase 1 implementation summary
- **PHASE2_SUMMARY.md** - Phase 2 implementation summary
- **README.md** - This file

## Implementation Details

### Phase 1: Infrastructure ✅

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

### Phase 2: Physical World ✅

According to MASTER_PLAN_v17.md, Phase 2 includes:

1. **TimeEngine (#7)** ✅
   - Time structure tracking day, time of day, day of week
   - `advance(L)` method - Automatically advances time
   - `/time` command - Display current time
   - Integration in Output.js for automatic progression

2. **EnvironmentEngine (#8)** ✅
   - Environment structure (location, weather)
   - `log(L, text)` method - Record events to CKB
   - `changeWeather(L, weather)` and `changeLocation(L, location)` methods
   - `/env` command - Display/modify environment
   - Integration in Output.js for automatic event logging

3. **ChronologicalKnowledgeBase (CKB, #18)** ✅
   - `chronologicalKnowledge` array for storing events
   - Automatic event logging with temporal and environmental context
   - `/ckb [limit]` command - Display recent entries

## Testing

Run the test suites:

```bash
cd v17.0
node test_phase1.js  # Phase 1 tests (11/11 passing)
node test_phase2.js  # Phase 2 tests (13/13 passing)
```

### Phase 1 Test Coverage

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

### Phase 2 Test Coverage

All 13 tests pass:

1. ✅ TimeEngine initializes correctly
2. ✅ EnvironmentEngine initializes correctly
3. ✅ ChronologicalKnowledgeBase initializes correctly
4. ✅ /time command displays current time
5. ✅ /env command displays current environment
6. ✅ /env set location changes location
7. ✅ /env set weather changes weather
8. ✅ Time advances after story action
9. ✅ Time progresses through day correctly
10. ✅ Events are logged to CKB automatically
11. ✅ /ckb command displays recent entries
12. ✅ Time does not advance for command actions
13. ✅ Week cycles correctly after 7 days

## Usage in AI Dungeon

### Installation

1. Copy the content of each `.js` file from the `scripts/` folder into the corresponding script slot in AI Dungeon:
   - `scripts/Library.js` → Library script
   - `scripts/Input.js` → Input Modifier script
   - `scripts/Context.js` → Context Modifier script
   - `scripts/Output.js` → Output Modifier script

2. Start your adventure!

### Available Commands

**Phase 1 Commands:**
- `/ping` - Test system responsiveness
- `/debug on|off` - Toggle debug mode

**Phase 2 Commands:**
- `/time` - Display current game time
- `/env` - Display current environment
- `/env set location <value>` - Change location (e.g., `/env set location Classroom`)
- `/env set weather <value>` - Change weather (e.g., `/env set weather Rainy`)
- `/ckb [limit]` - Display recent events (default: 5 most recent)

### Expected Behavior

1. **Time Progression**: Time automatically advances as the story progresses
   - Turn 0 = Day 1, Monday, Morning
   - Turn 1 = Day 1, Monday, Day
   - Turn 2 = Day 1, Monday, Evening
   - Turn 3 = Day 1, Monday, Night
   - Turn 4 = Day 2, Tuesday, Morning
   - (Pattern continues...)

2. **Event Logging**: Every AI response is automatically logged to the Chronological Knowledge Base with full temporal and environmental context

3. **Environment Tracking**: Location and weather persist across turns and are included in event logs

## Success Criteria

### Phase 1 (from MASTER_PLAN_v17.md)

✅ **All criteria met:**

1. Game loads without errors
2. `/ping` command works
3. `/debug on|off` commands work
4. Turn counter increments for story actions, not for commands

### Phase 2 (from MASTER_PLAN_v17.md)

✅ **All criteria met:**

1. `/time` command shows current turn and day
2. Turn counter correctly increases
3. `/weather set` and `/location set` commands work (as `/env set weather/location`)
4. State saves correctly
5. Time advances automatically after each turn
6. Events are logged automatically to CKB

## Next Steps

Phases 1 and 2 are complete. Ready to proceed to:

**Phase 3: Basic Data** (EvergreenEngine, GoalsEngine, KnowledgeEngine)

See `IMPLEMENTATION_CHECKLIST.md` for detailed roadmap of all 8 phases.

## Architecture Notes

- **No v16 code copied** - All code written from scratch based on MASTER_PLAN_v17.md
- **Clean slate approach** - Building on proven concepts with fresh implementation
- **Minimal implementation** - Only what's needed for each phase
- **Testing first** - All functionality verified before moving to next phase
- **Organized structure** - Scripts in `scripts/` folder, tests and docs in root

## Version

**v17.0.0-alpha.2** - Phase 1: Infrastructure + Phase 2: Physical World Complete
