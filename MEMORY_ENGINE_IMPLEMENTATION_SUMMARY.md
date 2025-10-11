# Collective Memory Engine Implementation Summary

## Overview
The **Collective Memory Engine** (MemoryEngine) transforms significant formative events into cultural myths that shape the collective identity and behavior of Lincoln Heights. Events fade from concrete details into abstract moral lessons that influence new characters and reinforce social norms.

## What Was Implemented

### 1. Myth Archive (L.society.myths)
- **Location**: `Library v16.0.8.patched.txt`, lines 1445-1451
- **Structure**: Array in `L.society.myths`
- **Storage**: Two types of entries:
  - `event_record`: Recent formative events with full details
  - `myth`: Aged events transformed into abstract cultural memories

### 2. The Memory Engine
- **Location**: `Library v16.0.8.patched.txt`, lines 5173-5360
- **Structure**: New `LC.MemoryEngine` object with methods:
  - `runMythologization()` - Transforms old events into myths (runs every 100 turns)
  - `getDominantMyth()` - Returns the strongest myth defining current zeitgeist
  - `getMythStrengthForTheme(theme)` - Calculates myth strength for specific themes
  - `_createMythFromEvent(record)` - Internal: converts event to myth
  - `_pruneMythsIfNeeded()` - Internal: keeps only top 20 myths

### 3. Event Archiving Integration
- **Location**: `Library v16.0.8.patched.txt`, lines 4721-4726
- **Trigger Points**:
  - After major relationship changes (>80 points) in Crucible
  - After first leader status assignment in HierarchyEngine
  - After significant goal completions
- **Helper Methods** in Crucible:
  - `_shouldArchiveEvent()` - Determines if event is formative
  - `_archiveFormativeEvent()` - Saves event to myths array
  - `_extractEventDetails()` - Extracts relevant details for archiving

### 4. Mythologization Process
**Triggering**: Automatically runs every 100 turns via `incrementTurn()`
- **Location**: `Library v16.0.8.patched.txt`, lines 1649-1658

**Process**:
1. Scans `L.society.myths` for event records older than 50 turns
2. Extracts theme (loyalty_rescue, betrayal, achievement, leadership)
3. Determines moral based on theme
4. Calculates myth strength (0.7-0.9) based on event magnitude
5. Creates abstract myth with hero and moral
6. Replaces event record with myth
7. Prunes myth collection to keep top 20 strongest

### 5. Cultural Influence on New Characters
- **Location**: `Library v16.0.8.patched.txt`, lines 1874-1901
- **Mechanism**: When new characters are created in `updateCharacterActivity()`:
  - Base personality traits start at 0.5
  - `loyalty_rescue` myths boost trust by up to +0.2
  - `betrayal` myths reduce trust by up to -0.15
  - Results in new NPCs fitting the cultural zeitgeist

### 6. Myth-Strengthened Norms
- **Location**: `Library v16.0.8.patched.txt`, lines 5008-5024
- **Mechanism**: `NormsEngine.getNormStrength()` enhanced to:
  - Get base norm strength from `L.society.norms`
  - Calculate myth strength for matching theme
  - Add up to +20% boost from myths
  - Return combined strength (capped at 1.0)

### 7. Zeitgeist Context Tag
- **Location**: `Library v16.0.8.patched.txt`, lines 5862-5894
- **Mechanism**: `composeContextOverlay()` adds `⟦ZEITGEIST⟧` tag:
  - Calls `MemoryEngine.getDominantMyth()`
  - Generates culture-appropriate message based on theme
  - Adds to priority context (high visibility for AI)
  - Examples:
    - loyalty_rescue: "В этой школе героев уважают, а предателей презирают."
    - betrayal: "В этой школе доверие трудно заработать и легко потерять."
    - achievement: "В этой школе ценят упорство и достижения."
    - leadership: "В этой школе лидеры задают тон и пользуются уважением."

## Data Structures

### Event Record
```javascript
{
  type: 'event_record',
  turn: 5,                      // When event happened
  eventType: 'RELATION_CHANGE',  // Type of event
  character: 'Максим',           // Primary character
  details: {
    eventType: 'RELATION_CHANGE',
    otherCharacter: 'Хлоя',
    change: 85,
    theme: 'loyalty_rescue'      // Extracted theme
  },
  archived: 5                    // When archived
}
```

### Myth
```javascript
{
  type: 'myth',
  theme: 'loyalty_rescue',       // Cultural theme
  hero: 'Максим',                // Legendary figure
  moral: 'защищать друзей — правильно',  // Abstract lesson
  strength: 0.85,                // Cultural impact [0-1]
  createdTurn: 60,               // When mythologized
  originalTurn: 5                // Original event turn
}
```

## Myth Themes

1. **loyalty_rescue**: Acts of heroism and protection
   - Moral: "защищать друзей — правильно"
   - Strength: 0.8+
   - Effect: Increases trust in new characters

2. **betrayal**: Major negative relationship events
   - Moral: "предательство недопустимо"
   - Strength: 0.9+
   - Effect: Decreases trust in new characters

3. **achievement**: Successful goal completion
   - Moral: "упорство ведёт к успеху"
   - Strength: 0.7+
   - Effect: Neutral baseline

4. **leadership**: First leader status assignment
   - Moral: "лидеры заслуживают уважения"
   - Strength: 0.85+
   - Effect: Neutral baseline

## Integration Points

### With Crucible Engine
- Crucible triggers `_archiveFormativeEvent()` for events >80 relationship change
- Personality evolution and myth creation happen in same flow
- Only MAIN/SECONDARY characters create formative events

### With HierarchyEngine
- First leader assignment triggers STATUS_CHANGE event
- Subsequent leader changes don't create new myths
- Leadership myth reinforces hierarchical norms

### With NormsEngine
- Myths boost norm strength by up to 20%
- Stronger myths = stronger norms
- Creates positive feedback loop between culture and behavior

### With Context Overlay
- Dominant myth becomes zeitgeist
- High priority in AI context (shown before character details)
- Provides cultural framing for AI-generated content

## Testing

### Test Suite: `tests/test_memory_engine.js`
**Coverage**:
1. Data structure initialization
2. Event archiving (relation changes, status changes)
3. Mythologization process
4. Recent events not mythologized
5. Dominant myth detection
6. Myth strength by theme
7. New character personality calibration
8. Norm strength boosting
9. Context overlay zeitgeist tag
10. Myth pruning

**All 36 tests pass** ✅

### Demo: `demo_memory_engine.js`
**Narrative Scenario**:
1. ACT 1: Максим rescues Хлоя (formative event)
2. ACT 2: 50 turns later, event becomes myth
3. ACT 3: New students arrive with myth-influenced personalities
4. ACT 4: Zeitgeist appears in context overlay
5. ACT 5: Максим becomes leader, new myth begins

## Performance Considerations

- **Mythologization**: Runs only every 100 turns, minimal overhead
- **Myth Pruning**: Keeps max 20 myths, prevents unbounded growth
- **Context Cache**: Zeitgeist cached with `L.stateVersion`, no repeated computation
- **Character Creation**: Myth lookup is O(n) but n is small (≤20 myths)

## Future Enhancements (Not Implemented)

### 1. Myth Decay
Myths could weaken over time if not reinforced:
```javascript
if (L.turn - myth.createdTurn > 200) {
  myth.strength = Math.max(0, myth.strength - 0.01);
}
```

### 2. Myth Conflicts
Contradictory myths could create cultural tension:
```javascript
const loyaltyMyth = getMythStrengthForTheme('loyalty_rescue');
const betrayalMyth = getMythStrengthForTheme('betrayal');
if (Math.abs(loyaltyMyth - betrayalMyth) < 0.2) {
  // Cultural confusion: mixed messages
}
```

### 3. Myth Retelling
Characters could actively spread myths in dialogue, reinforcing them.

### 4. Regional Myths
Different locations (cafeteria, gym, classroom) could have local myths.

## Design Philosophy

**Progressive Abstraction**: Events → Records → Myths → Culture
- Concrete details fade
- Moral lessons remain
- Heroes become legendary
- Culture becomes self-reinforcing

**Organic Culture**: No manual myth creation
- Myths emerge from actual events
- Strength reflects event magnitude
- Only formative events become myths
- Weak myths naturally pruned

**Behavioral Impact**: Myths aren't just flavor text
- Influence new character personalities
- Strengthen social norms
- Guide AI narrative generation
- Create cultural continuity

## How To Use

### Running Tests
```bash
node tests/test_memory_engine.js
```

### Running Demo
```bash
node demo_memory_engine.js
```

### In-Game Behavior
The system works automatically:
1. Major events (>80 relationship change, first leader) are archived
2. Every 100 turns, old events (>50 turns) become myths
3. New characters inherit cultural values from myths
4. Norms are strengthened by related myths
5. Zeitgeist appears in AI context automatically

### Checking Current Myths
```javascript
const L = LC.lcInit();
console.log(L.society.myths);  // All myths and event records

const dominant = LC.MemoryEngine.getDominantMyth();
console.log(dominant);  // Strongest myth

const loyaltyStrength = LC.MemoryEngine.getMythStrengthForTheme('loyalty_rescue');
console.log(loyaltyStrength);  // Cultural strength of loyalty
```

## Files Modified
- `Library v16.0.8.patched.txt` - Core implementation (352 lines added)

## Files Created
- `tests/test_memory_engine.js` - Comprehensive test suite
- `demo_memory_engine.js` - Interactive narrative demo
- `MEMORY_ENGINE_IMPLEMENTATION_SUMMARY.md` - This document
