# TimeEngine - Hybrid Smart Time System (v17.0 Overhauled)

## Overview

The TimeEngine is a context-aware time progression system for Lincoln v17 that automatically tracks time based on:
1. **Time Anchors** - Explicit time markers in AI output ("after lessons", "2 hours later", "overnight")
2. **Scene Detection** - Pattern-based scene type detection (combat, dialogue, travel, etc.) with full Russian support
3. **Context Modifiers** - Emotional state, weather, group size, and travel distance awareness
4. **Instant Actions** - Quick actions (nods, glances) take minimal time
5. **Fallback Rate** - Default **1 minute/turn** when no anchors or clear scenes

## Key Updates in Overhaul

- ✅ **ES5 Compatibility**: All regex patterns use `/i` flag only (removed `/u`)
- ✅ **Realistic Scene Rates**: General 1 min/turn, Travel 5 min/turn, Fallback 1 min/turn
- ✅ **Russian Scene Detection**: Full Cyrillic pattern support for all 7 scene types
- ✅ **Scene Drift Fix**: Uses `Math.round()` for natural time progression
- ✅ **Context Awareness**: Speed, weather, group size, travel distance modifiers
- ✅ **Instant Actions**: 0 time cost for quick actions (nods, glances, turns)
- ✅ **Montage Support**: Time-skip phrases ("весь день", "all day")

## Features

### 1. Time Anchor Detection (90+ Patterns)

Time anchors are explicit markers that set or skip time. Supports both English and Russian languages.

#### Absolute Time Anchors - English
- `at dawn` → 6:00 AM
- `in the morning` → 8:00 AM
- `at noon` / `midday` → 12:00 PM
- `in the afternoon` → 2:00 PM
- `in the evening` → 6:00 PM
- `at dusk` → 7:00 PM
- `at night` → 9:00 PM
- `at midnight` → 12:00 AM

#### Absolute Time Anchors - Russian (NEW)
- `на рассвете` → 6:00 AM (at dawn)
- `утром` → 8:00 AM (in the morning)
- `в полдень` → 12:00 PM (at noon)
- `днём` → 2:00 PM (in the afternoon)
- `вечером` → 6:00 PM (in the evening)
- `на закате` → 7:00 PM (at dusk)
- `ночью` → 9:00 PM (at night)
- `в полночь` → 12:00 AM (at midnight)

#### Event-Based Anchors - English
- `breakfast` → 8:00 AM
- `lunch` → 12:30 PM
- `dinner` → 7:00 PM
- `after lessons` / `after class` / `after school` → 4:00 PM
- `evening training` → 7:00 PM

#### Event-Based Anchors - Russian (NEW)
- `завтрак` → 8:00 AM (breakfast)
- `обед` → 12:30 PM (lunch)
- `ужин` → 7:00 PM (dinner)
- `после уроков` / `после занятий` → 4:00 PM (after lessons/classes)
- `вечерняя тренировка` → 7:00 PM (evening training)

#### Next Day Transitions
- English: `next morning`, `next day`, `overnight`
- Russian: `следующим утром`, `на следующий день`, `через ночь`

#### Relative Time - English
- `X hours later` / `X hours passed` → Adds X hours
- `an hour later` → Adds 1 hour
- `X minutes later` → Adds X minutes

#### Relative Time - Russian
**Hours:**
- `спустя 2 часа` / `через 2 часа` → Adds 2 hours
- `2 часа спустя` → Adds 2 hours
- `час спустя` → Adds 1 hour
- Word numerals: `два`, `три`, `четыре`, `пять`, `шесть`, `семь`, `восемь`, `девять`, `десять`, `одиннадцать`, `двенадцать`
- Colloquial: `пару часов` → 2 hours, `несколько часов` → 3 hours

**Minutes:**
- `спустя 5 минут` / `через 5 минут` → Adds 5 minutes
- `15 минут спустя` → Adds 15 minutes
- Word numerals: `один`, `два`, `три`, `четыре`, `пять`, `десять`, `пятнадцать`, `двадцать`, `тридцать`

#### Montage/Summary Expressions (NEW)
- `весь день` / `all day` → 8 hours
- `всё утро` / `all morning` → 4 hours
- `весь вечер` → 4 hours
- `несколько часов` / `several hours` → 3 hours

**Examples:**
- `"Спустя 2 часа пришла Хлоя."` → +2 hours
- `"Через три минуты раздался звонок."` → +3 minutes
- `"Весь день они работали."` → +8 hours

### 2. Scene Type Detection (WITH RUSSIAN SUPPORT)

Scenes are detected via pattern matching in AI output with both English and Russian patterns:

| Scene | Rate | Max Duration | English Keywords | Russian Patterns |
|-------|------|--------------|-----------------|------------------|
| Combat | 2 min/turn | 30 min | attack, fight, battle, strike, dodge | атак, бит, драк, удар, бой |
| Dialogue | 5 min/turn | 60 min | say, ask, tell, speak, talk | сказа, спрос, ответ, разговар, обсуд |
| Travel | **5 min/turn** | 180 min | walk, run, ride, journey, travel | иди, пошёл, пошла, еха, отправ |
| Training | 10 min/turn | 120 min | train, practice, exercise, study | тренир, занима, упражн, учи |
| Exploration | 8 min/turn | 240 min | search, explore, examine, investigate | исследов, осмотр, обнаруж, найд |
| Rest | 60 min/turn | 480 min | sleep, rest, relax, nap | отдых, спа, лежа, дремот |
| General | **1 min/turn** | None | (fallback for undetected actions) | (по умолчанию) |

**Scene Priority:** combat > rest > training > dialogue > travel > exploration > general

### 3. Instant Actions (NEW)

Quick, momentary actions that take essentially no measurable time:

**English:** turn, nod, glance, look, smile, sigh, shrug, blink
**Russian:** поверну, кивну, открыл глаза, взгляну, посмотре, улыбну, вздохну, пожал плеч

**Time Cost:** 0 minutes

**Examples:**
- `"He turned around."` → 0 min
- `"Кивнул в ответ."` → 0 min

### 4. Travel Distance Awareness (NEW)

Travel time automatically adjusts based on distance context:

| Distance | Modifier | Example Phrases |
|----------|----------|----------------|
| Short | ×0.3 (1-2 min) | "в соседнюю комнату", "next room", "nearby" |
| Medium | ×1.0 (5 min) | "в здание", "на улицу", "to building", "outside" |
| Long | ×3.0 (15 min) | "в город", "домой", "to town", "home", "far" |

**Examples:**
- `"Вошёл в соседнюю комнату."` → 1 min (short travel)
- `"Пошёл в школу."` → 5 min (medium travel)
- `"Отправился домой."` → 15 min (long travel)

### 5. Context Modifiers (NEW)

Emotional state, weather, and group size affect time cost:

| Modifier | Effect | Detection Patterns |
|----------|--------|-------------------|
| Speed/Hurry | ×0.7 (faster) | "торопи", "спеши", "быстр", "hurry", "rush", "quick" |
| Slowness/Caution | ×1.5 (slower) | "медленн", "осторожн", "slow", "careful", "cautious" |
| Weather (rain/snow) | ×1.3 (slower) | "дожд", "снег", "буря", "rain", "snow", "storm" |
| Group Actions | ×1.5 (slower) | "групп", "все вместе", "команд", "group", "everyone", "team" |

**Examples:**
- `"Быстро побежал."` → time ×0.7
- `"Медленно шёл под дождём."` → time ×1.5 ×1.3 = ×1.95
- `"Группа вместе двигалась."` → time ×1.5

### 6. Scene Drift (UPDATED)

Prevents unrealistic time accumulation in long scenes. **Now uses `Math.round()` for more natural results:**

- **After 10 turns:** Rate reduced to 70% (e.g., 5 min → 4 min rounded)
- **After 20 turns:** Rate reduced to 50% (e.g., 5 min → 3 min rounded)
- **Near max duration:** Rate reduced to 30% (e.g., 5 min → 2 min rounded)
- **At max duration:** Rate becomes 0 (hard cap)

### 7. Time Modes

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
