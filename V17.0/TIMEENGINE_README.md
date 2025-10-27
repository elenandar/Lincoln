# TimeEngine - Hybrid Smart Time System

## Overview

The TimeEngine is a context-aware time progression system for Lincoln v17 that automatically tracks time based on:
1. **Time Anchors** - Explicit time markers in AI output ("after lessons", "2 hours later", "overnight")
2. **Scene Detection** - Keyword-based scene type detection (combat, dialogue, travel, etc.)
3. **Fallback Rate** - Default 15 minutes/turn when no anchors or clear scenes

## Features

### 1. Time Anchor Detection (70+ Patterns)

Time anchors are explicit markers that set or skip time. Supports both English and Russian languages.

#### Absolute Time Anchors
- `at dawn` → 6:00 AM
- `in the morning` → 8:00 AM
- `at noon` / `midday` → 12:00 PM
- `in the afternoon` → 2:00 PM
- `in the evening` → 6:00 PM
- `at dusk` → 7:00 PM
- `at night` → 9:00 PM
- `at midnight` → 12:00 AM

#### Event-Based Anchors
- `breakfast` → 8:00 AM
- `lunch` → 12:30 PM
- `dinner` → 7:00 PM
- `after lessons` / `after class` / `after school` → 4:00 PM
- `evening training` → 7:00 PM

#### Next Day Transitions
- `next morning` / `next day` → Next day at 8:00 AM
- `overnight` → Adds 8 hours

#### Relative Time
- `X hours later` / `X hours passed` → Adds X hours
- `an hour later` → Adds 1 hour
- `X minutes later` → Adds X minutes

#### Russian Relative Time Anchors
Russian time expressions are fully supported with both numeric and word-based patterns:

**Hours:**
- `спустя 2 часа` / `через 2 часа` → Adds 2 hours
- `2 часа спустя` → Adds 2 hours
- `час спустя` → Adds 1 hour
- Word numerals: `два`, `три`, `четыре`, `пять`, `шесть`, `семь`, `восемь`, `девять`, `десять`, `одиннадцать`, `двенадцать`
- Colloquial: `пару часов` → 2 hours, `несколько часов` → 2 hours

**Minutes:**
- `спустя 5 минут` / `через 5 минут` → Adds 5 minutes
- `15 минут спустя` → Adds 15 minutes
- Word numerals: `один`, `два`, `три`, `четыре`, `пять`, `десять`, `пятнадцать`, `двадцать`, `тридцать`

**Examples:**
- `"Спустя 2 часа пришла Хлоя."` → +2 hours
- `"Через три минуты раздался звонок."` → +3 minutes
- `"Через пару часов все собрались."` → +2 hours

### 2. Scene Type Detection

Scenes are detected via keyword matching in AI output:

| Scene | Rate | Max Duration | Keywords |
|-------|------|--------------|----------|
| Combat | 2 min/turn | 30 min | attack, fight, battle, strike, dodge, swing, slash, parry, block, evade |
| Dialogue | 5 min/turn | 60 min | say, ask, tell, speak, talk, reply, respond, whisper, shout, exclaim |
| Travel | 15 min/turn | 180 min | walk, run, ride, journey, travel, move, head, depart, arrive, reach |
| Training | 10 min/turn | 120 min | train, practice, exercise, spar, drill, rehearse, study, learn |
| Exploration | 8 min/turn | 240 min | search, explore, examine, investigate, inspect, look, scan, survey |
| Rest | 60 min/turn | 480 min | sleep, rest, camp, relax, nap, doze, lie, sit |
| General | 10 min/turn | None | (fallback) |

**Scene Priority:** combat > rest > training > dialogue > travel > exploration > general

### 3. Scene Drift

Prevents unrealistic time accumulation in long scenes:

- **After 10 turns:** Rate reduced to 70% (e.g., 5 min → 3.5 min)
- **After 20 turns:** Rate reduced to 50% (e.g., 5 min → 2.5 min)
- **Near max duration:** Rate reduced to 30% (e.g., 5 min → 1.5 min)
- **At max duration:** Rate becomes 0 (hard cap)

### 4. Time Modes

Three modes control time progression:

- **hybrid** (default) - Uses anchors, then scenes, then fallback
- **auto** - Scene-based only, no anchors
- **manual** - No automatic progression (player controls via commands)

### 5. Manual Controls

#### `/time` - Display current time
```
=== Current Time ===
Day 1, Morning (8:00 AM)
Scene: general (0 turns)
Mode: hybrid
Total time passed: 0h 0m
```

#### `/time skip <number> <unit>` - Skip forward
```
/time skip 2 hours
/time skip 30 minutes
```

#### `/time set <day> <hour> <minute>` - Set absolute time
```
/time set 1 14 30
→ Sets Day 1, 2:30 PM
```

#### `/time mode <mode>` - Change mode
```
/time mode manual
/time mode hybrid
/time mode auto
```

#### `/time stats` - Detailed statistics
```
=== Time Statistics ===
Current: Day 1, Morning (8:00 AM)
Day: 1 | Hour: 8 | Minute: 0
Time of Day: Morning
Scene: combat
Scene turns: 3
Scene minutes: 6/30
Mode: hybrid
Total elapsed: 0h 15m
```

## Implementation Details

### State Structure

```javascript
state.lincoln.time = {
    day: 1,                    // Current day
    hour: 8,                   // Hour (0-23)
    minute: 0,                 // Minute (0-59)
    timeString: "...",         // Formatted display string
    timeOfDay: "Morning",      // Morning/Afternoon/Evening/Night
    currentScene: "general",   // Current detected scene
    sceneStartTurn: 0,         // Turn when scene started
    sceneTurnCount: 0,         // Turns in current scene
    sceneMinutes: 0,           // Minutes accumulated in scene
    mode: "hybrid",            // Time mode
    totalMinutesPassed: 0      // Total minutes since start
};
```

### Integration

**Output.txt** calls TimeEngine after turn increment:

```javascript
LC.Turns.increment();
var minutesPassed = LC.TimeEngine.calculateHybridTime(text);
LC.TimeEngine.addMinutes(minutesPassed);
```

### Logic Flow

1. Check if in manual mode → return 0
2. Check for time anchor in text → apply and return
3. Detect scene type from keywords
4. Calculate base rate for scene
5. Apply scene drift reduction if needed
6. Check max duration cap
7. Return final rate

## Examples

### Example 1: Time Anchor Priority
```
Input: "After lessons, you head to the training grounds."
→ Time jumps to 4:00 PM (anchor takes priority)
→ Next turn detects "training" scene
→ Subsequent turns: +10 min/turn
```

### Example 2: Combat Scene
```
Turn 1: "You attack the bandit, dodging his strike."
→ Scene: combat, +2 min (8:00 AM → 8:02 AM)

Turn 2: "You parry and counter-attack."
→ Scene: combat, +2 min (8:02 AM → 8:04 AM)

Turn 15: (30+ minutes in combat)
→ Scene: combat, +0 min (hard cap reached)
```

### Example 3: Scene Drift
```
Dialogue scene:
Turns 1-9: +5 min/turn each
Turn 10: +3.5 min (70% of 5)
Turn 20: +2.5 min (50% of 5)
Turn 30: Near cap, +1.5 min (30% of 5)
```

### Example 4: Manual Mode
```
/time mode manual
→ Mode set to manual

Take actions → time doesn't change

/time skip 1 hour
→ Manually advance time

/time mode hybrid
→ Resume automatic progression
```

### Example 5: Russian Time Anchors
```
Input: "Спустя 2 часа пришла Хлоя."
→ Time jumps forward by 2 hours (anchor detected)

Input: "Через три минуты раздался звонок."
→ Time advances by 3 minutes (word numeral parsed)

Input: "Через пару часов все собрались."
→ Time advances by 2 hours (colloquial expression)
```

## ES5 Compliance

The TimeEngine is fully ES5-compliant:
- ✅ No `let` or `const` (except const modifier pattern)
- ✅ No arrow functions
- ✅ No template literals
- ✅ Uses `indexOf()` instead of `includes()`
- ✅ No Map or Set
- ✅ No spread operators
- ✅ No destructuring
- ✅ Traditional function expressions only

## Testing

See `TIMEENGINE_TESTING_GUIDE.md` for comprehensive test cases.

## Technical Notes

### Russian Numeral Parser
The TimeEngine includes a dedicated parser for Russian word numerals:
- Converts Russian words to numbers: `два` → 2, `три` → 3, `пять` → 5, etc.
- Supports hours: 1-12 (один through двенадцать)
- Supports minutes: common values (пять, десять, пятнадцать, двадцать, тридцать)
- Handles colloquial expressions: `пару` → 2, `несколько` → 3
- Fallback to numeric parsing for digit strings

### Anchor Detection
- Anchors are checked in order (first match wins)
- More specific patterns come first (e.g., "next morning" before "morning")
- Negative lookaheads prevent false positives

### Scene Detection
- Uses word boundary matching (`\b` in regex)
- Counts keyword occurrences for scoring
- Priority determines winner when scores tied

### Time Rollover
- Minutes overflow to hours
- Hours overflow to days
- No month/year tracking (days continue incrementing)

### Performance
- Regex patterns are defined once in LC.TimeEngine
- Scene config object for O(1) lookups
- Minimal string operations

## Future Enhancements

Potential additions for later phases:
- Weather-based time modifiers
- Activity-specific time costs
- Calendar system (months/seasons)
- Time-of-day dependent events
- Fatigue/rest requirements
- NPC schedules synced to time

## Support

For issues or questions:
1. Check `TIMEENGINE_TESTING_GUIDE.md` for test procedures
2. Review `/time stats` for current state
3. Try `/time mode manual` if automatic progression causes issues
4. Check console logs for error messages
