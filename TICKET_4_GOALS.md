# Ticket #4: Automated Character Goal Creation and Tracking

## Overview
This feature automatically detects and tracks character goals from the narrative text, helping the AI maintain consistency with long-term character objectives.

## Implementation Details

### 1. State Initialization (Library v16.0.8.patched.txt)

**Location:** `lcInit()` function, line ~943

```javascript
// goals tracking
L.goals = L.goals || {};
```

Goals are stored in `state.lincoln.goals` as an object with the following structure:
```javascript
{
  "goalKey": {
    character: "Максим",
    text: "узнать правду о директоре",
    status: "active",
    turnCreated: 5
  }
}
```

### 2. Goal Pattern Recognition (Library v16.0.8.patched.txt)

**Location:** `autoEvergreen._buildPatterns()` function, line ~1435

Added goal patterns array with support for both Russian and English:

#### Russian Patterns:
- `цель|задача Максима: узнать правду` - Explicit goal statements
- `Максим хочет узнать правду` - Want/desire expressions
- `Максим решил отомстить` - Decision/intent expressions
- `Максим планирует раскрыть` - Planning expressions
- `его цель — узнать` - Possessive goal constructions

#### English Patterns:
- `goal of Максим: learn the truth` - Explicit goal statements
- `Максим wants to learn` - Want/desire expressions
- `Максим plans to reveal` - Planning expressions
- `Максим's goal is to` - Possessive goal constructions

**Fallback Patterns:** For older regex engines that don't support Unicode property escapes (\p{L}), fallback patterns using character class ranges are provided.

### 3. Goal Analysis Function (Library v16.0.8.patched.txt)

**Location:** `autoEvergreen.analyzeForGoals()` function, line ~2151

```javascript
analyzeForGoals(text, actionType){
  const L = LC.lcInit();
  if (!this.patterns) this.patterns = this._buildPatterns();
  if (!L.evergreen || !L.evergreen.enabled || actionType === "retry" || !text) return;
  // ... pattern matching and goal extraction
}
```

**Key Features:**
- Skips analysis on retry actions
- Requires evergreen to be enabled
- Normalizes text for consistent matching
- Extracts character name and goal description
- Validates character is important (core cast member)
- Filters goals by length (8-200 characters)
- Creates unique keys for each goal
- Stores with timestamp (turnCreated)

### 4. Integration with Output Module (Output v16.0.8.patched.txt)

**Location:** Post-analysis section, line ~137

```javascript
if (autoEvergreen?.analyzeForGoals) {
  try {
    autoEvergreen.analyzeForGoals(out, lastActionType);
  } catch (e) {
    LC.lcWarn("Post-analyze analyzeForGoals error: " + (e && e.message));
  }
}
```

Goals are analyzed after each non-retry turn, alongside other analysis functions like:
- `updateCharacterActivity`
- `analyzeTextForEvents`
- `autoEvergreen.analyze`

### 5. Context Overlay Integration (Library v16.0.8.patched.txt)

**Location:** `composeContextOverlay()` function, line ~2661

Goals are added to the context overlay with high priority (weight 750, between CANON and OPENING):

```javascript
// Active goals (created within last 20 turns)
if (L.goals && typeof L.goals === 'object') {
  const goalEntries = Object.entries(L.goals);
  const activeGoals = [];
  for (let i = 0; i < goalEntries.length; i++) {
    const [key, goal] = goalEntries[i];
    if (!goal || goal.status !== 'active') continue;
    const turnsSince = L.turn - (goal.turnCreated || 0);
    if (turnsSince >= 0 && turnsSince < 20) {
      activeGoals.push(`${goal.character}: ${goal.text}`);
    }
  }
  if (activeGoals.length > 0) {
    for (let i = 0; i < activeGoals.length; i++) {
      priority.push(`⟦GOAL⟧ Цель ${activeGoals[i]}`);
    }
  }
}
```

**Display Format:** `⟦GOAL⟧ Цель Максим: узнать правду о директоре`

**Filtering Rules:**
- Only `status: "active"` goals are shown
- Goals must be created within last 20 turns
- Older goals are automatically excluded from context

**Priority Weights:**
1. INTENT: 1000
2. TASK: 900
3. CANON: 800
4. **GOAL: 750** ← New
5. OPENING: 700
6. SCENE (Focus): 600
7. SCENE: 500
8. GUIDE: 400
9. META: 100

## Usage Examples

### Example 1: Russian Goal Detection
**Input Text:** "Максим хочет узнать правду о директоре."

**Result:**
```javascript
L.goals["Максим_1234567890_abc1"] = {
  character: "Максим",
  text: "узнать правду о директоре",
  status: "active",
  turnCreated: 5
}
```

**In Context:** `⟦GOAL⟧ Цель Максим: узнать правду о директоре`

### Example 2: English Goal Detection
**Input Text:** "Chloe wants to win the competition."

**Result:**
```javascript
L.goals["Хлоя_1234567890_xyz2"] = {
  character: "Хлоя",
  text: "win the competition",
  status: "active",
  turnCreated: 10
}
```

**In Context:** `⟦GOAL⟧ Цель Хлоя: win the competition`

### Example 3: Multiple Goals
**Input Text:** "Цель Максима: найти улики против директора. Хлоя мечтает стать звездой сцены."

**Results:**
- Two goals detected and stored
- Both appear in context (if within 20 turns)
- Each has unique key and timestamp

## Testing

Test script: `test_goals.js`

**Test Coverage:**
1. ✅ Goals initialization in state
2. ✅ Pattern building with goals array
3. ✅ Russian goal detection
4. ✅ English goal detection
5. ✅ Context overlay integration
6. ✅ Goal age filtering (20 turn window)
7. ✅ Multiple goal pattern types
8. ✅ Inactive goals excluded

**All tests passing with no regressions in existing functionality.**

## Configuration

### Adjustable Parameters

**Goal Age Threshold:** Currently hardcoded to 20 turns
```javascript
if (turnsSince >= 0 && turnsSince < 20) {
  // Show goal in context
}
```

To adjust, modify the `20` value in `composeContextOverlay()`.

**Goal Text Length:** Min 8, Max 200 characters
```javascript
if (goalText.length < 8 || goalText.length > 200) continue;
```

**Status Values:** Currently supports:
- `"active"` - shown in context
- Any other value (e.g., `"completed"`, `"abandoned"`) - hidden from context

## Character Normalization

Goals use the same character normalization as other evergreen features:
- "Макс", "max", "Maxim" → "Максим"
- "Хлои", "chloe", "Harper" → "Хлоя"
- "Эш", "ash" → "Эшли"
- etc.

Only important characters (core cast) have their goals tracked.

## Future Enhancements

Possible extensions:
1. Manual goal management commands (`/goal set`, `/goal complete`, `/goal list`)
2. Automatic goal completion detection
3. Goal priority levels
4. Goal dependencies/relationships
5. Goal progress tracking
6. Configurable age threshold per goal

## File Changes Summary

| File | Lines Added | Changes |
|------|-------------|---------|
| `Library v16.0.8.patched.txt` | ~80 | Goals init, patterns, analyzeForGoals, context overlay |
| `Output v16.0.8.patched.txt` | ~8 | Call analyzeForGoals after each turn |
| `test_goals.js` | 218 | Comprehensive test suite |

## Compatibility

- ✅ Compatible with existing evergreen system
- ✅ No changes to existing state structure
- ✅ No breaking changes to API
- ✅ Graceful degradation if patterns fail
- ✅ Safe error handling throughout
