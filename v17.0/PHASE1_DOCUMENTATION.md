# Lincoln v17 Phase 1: Infrastructure - Documentation

## Overview

Phase 1 implements the foundational infrastructure for Lincoln v17, providing 8 core components that support all future engine development.

**Version:** 17.0.0-phase1  
**Status:** ✅ Complete  
**Test Coverage:** 100% (60 unit tests + 20 integration tests)

## Components Implemented

### 1. lcInit - State Initialization

**Purpose:** Creates and initializes the `state.lincoln` structure with all necessary fields.

**API:**
```javascript
LC.lcInit()  // Returns state.lincoln object
```

**State Structure:**
```javascript
state.lincoln = {
  version: "17.0.0-phase1",
  stateVersion: 0,           // Cache invalidation counter
  turn: 0,                   // Turn counter
  initialized: true,
  timestamp: <number>,
  
  currentAction: {           // Current user action
    type: "story",          // "story", "do", "say", "alter", "command"
    rawText: "",
    normalized: ""
  },
  
  drafts: [],               // Output message queue
  characters: {},           // Character data (populated by engines)
  
  // Placeholders for future phases
  time: {},
  environment: {},
  relations: {},
  hierarchy: {},
  rumors: [],
  lore: [],
  myths: [],
  evergreen: [],
  secrets: []
}
```

**Key Features:**
- Idempotent: Multiple calls return the same object
- Version tracking for cache invalidation
- Proper initialization order

---

### 2. LC.Tools - Safety Utilities

**Purpose:** Provides safe regex operations to prevent DoS attacks and errors.

**API:**

#### safeRegexMatch(text, pattern, flags)
```javascript
// Match with RegExp object
var matches = LC.Tools.safeRegexMatch("hello world", /world/);

// Match with string pattern
var matches = LC.Tools.safeRegexMatch("test123", "\\d+", "g");

// Returns null for invalid input or no match
```

**Features:**
- Prevents catastrophic backtracking (limits input to 10,000 chars)
- Error handling with console warnings
- Returns `null` for invalid input

#### escapeRegex(str)
```javascript
var escaped = LC.Tools.escapeRegex("test.*()?");
// Returns: "test\\.\\*\\(\\)\\?"
```

**Features:**
- Escapes all special regex characters
- Safe for use in `new RegExp()`

---

### 3. LC.Utils - Type Conversion Utilities

**Purpose:** Robust type conversion with fallback defaults.

**API:**

#### toNum(value, defaultValue)
```javascript
LC.Utils.toNum("123")        // 123
LC.Utils.toNum("invalid", 0) // 0
LC.Utils.toNum(true)         // 1
LC.Utils.toNum(false)        // 0
```

#### toStr(value, defaultValue)
```javascript
LC.Utils.toStr(123)           // "123"
LC.Utils.toStr(null, "N/A")   // "N/A"
```

#### toBool(value, defaultValue)
```javascript
LC.Utils.toBool("true")   // true
LC.Utils.toBool("yes")    // true
LC.Utils.toBool("1")      // true
LC.Utils.toBool("false")  // false
LC.Utils.toBool(0)        // false
```

#### clamp(value, min, max)
```javascript
LC.Utils.clamp(5, 0, 10)   // 5
LC.Utils.clamp(-5, 0, 10)  // 0 (clamped)
LC.Utils.clamp(15, 0, 10)  // 10 (clamped)
```

---

### 4. currentAction - Action Tracking

**Purpose:** Unified tracking of user actions across modifiers.

**API:**

#### LC.updateCurrentAction(type, rawText)
```javascript
// Called from Input modifier
LC.updateCurrentAction("do", "walk forward");
LC.updateCurrentAction("say", "Hello there!");
```

#### LC.getCurrentActionType()
```javascript
var actionType = LC.getCurrentActionType();  // "do", "say", "story", etc.
```

**Features:**
- Stores action type, raw text, and normalized text
- Automatically increments `stateVersion`
- Accessible across all modifiers

---

### 5. LC.Flags - Compatibility Facade

**Purpose:** Convenient boolean checks for action types.

**API:**

```javascript
LC.Flags.isDo()      // true if action type is "do"
LC.Flags.isSay()     // true if action type is "say"
LC.Flags.isStory()   // true if action type is "story"
LC.Flags.isAlter()   // true if action type is "alter"

LC.Flags.getText()            // Get raw text
LC.Flags.getNormalizedText()  // Get normalized (trimmed, lowercased) text
```

**Example:**
```javascript
if (LC.Flags.isDo()) {
  // Handle "do" action
}
```

---

### 6. LC.Drafts - Output Message Queue

**Purpose:** Queue system messages for display in output.

**API:**

#### add(message, priority)
```javascript
// Add low-priority message
LC.Drafts.add("You feel tired.", 1);

// Add high-priority message
LC.Drafts.add("[SYSTEM] Important notification!", 100);
```

#### flush()
```javascript
// Returns all messages sorted by priority, then clears queue
var messages = LC.Drafts.flush();
// Returns: "High priority\n\nLow priority"
```

#### peek()
```javascript
// View queue without clearing
var drafts = LC.Drafts.peek();
// Returns: [{message: "...", priority: 10, timestamp: ...}, ...]
```

#### clear()
```javascript
// Clear queue without returning
LC.Drafts.clear();
```

**Features:**
- Priority-based sorting (higher priority first)
- Automatic newline separation
- Non-destructive peek operation

---

### 7. LC.Turns - Turn Counter

**Purpose:** Track game progression through turns.

**API:**

#### get()
```javascript
var currentTurn = LC.Turns.get();
```

#### increment()
```javascript
// Called automatically from Output modifier
LC.Turns.increment();
```

#### set(value)
```javascript
// For testing/debugging
LC.Turns.set(42);
```

**Features:**
- Automatically increments in Output modifier
- Updates `stateVersion` on change

---

### 8. LC.CommandsRegistry - Command Parser

**Purpose:** Register and execute slash commands (e.g., `/ping`, `/debug`).

**Architecture:** **PLAIN OBJECT** (ES5-compliant, NOT Map)

**API:**

#### register(command, handler)
```javascript
LC.CommandsRegistry.register("echo", function(args) {
  return "You said: " + args.join(" ");
});
```

#### execute(input)
```javascript
var result = LC.CommandsRegistry.execute("/echo hello world");
// Returns: "You said: hello world"

var result = LC.CommandsRegistry.execute("/unknown");
// Returns: null (unknown command)

var result = LC.CommandsRegistry.execute("regular text");
// Returns: null (not a command)
```

#### has(command)
```javascript
if (LC.CommandsRegistry.has("ping")) {
  // Command exists
}
```

#### list()
```javascript
var commands = LC.CommandsRegistry.list();
// Returns: ["ping", "turn", "debug", "draft", "commands"]
```

**Built-in Commands:**

| Command | Description | Example |
|---------|-------------|---------|
| `/ping` | Test Lincoln availability | `/ping` → `[PONG] Lincoln v17.0.0-phase1 is alive!` |
| `/turn` | Show current turn | `/turn` → `[TURN] Current turn: 5` |
| `/debug` | Show debug information | `/debug` → Shows turn, state version, action, etc. |
| `/draft <message>` | Queue a message | `/draft Test` → Queues "Test" |
| `/commands` | List all commands | `/commands` → Shows all available commands |

---

## Integration with Modifiers

### Input Modifier

**Responsibilities:**
1. Initialize LC (call `lcInit()`)
2. Track current action via `updateCurrentAction()`
3. Execute commands via `CommandsRegistry.execute()`
4. Clear input for executed commands

**Example Flow:**
```javascript
// User types: /ping
text = "/ping";
var result = inputModifier(text);

// result.text === "" (command cleared)
// Command result queued in drafts
```

### Output Modifier

**Responsibilities:**
1. Increment turn counter via `LC.Turns.increment()`
2. Flush draft messages via `LC.Drafts.flush()`
3. Prepend drafts to AI output

**Example Flow:**
```javascript
// After command execution
text = "AI generated response";
var result = outputModifier(text);

// result.text === "[PONG] ...\n\nAI generated response"
```

### Context Modifier

**Responsibilities:**
- Currently passthrough (placeholder for Phase 8 UnifiedAnalyzer)
- Can read state for future coordination

---

## ES5 Compliance

✅ **All Phase 1 code is ES5-compliant:**

- ❌ NO `Map` or `Set` (uses plain objects)
- ❌ NO arrow functions in production code
- ❌ NO `Array.includes()` (uses `indexOf() !== -1`)
- ❌ NO destructuring
- ✅ Uses `var`, `const`, `let` (confirmed working in AI Dungeon)
- ✅ Uses `for` loops instead of `forEach` where needed
- ✅ Compatible with AI Dungeon JavaScript environment

---

## Testing

### Unit Tests
**File:** `/v17.0/tests/phase1-unit-tests.js`  
**Tests:** 60  
**Coverage:** All 8 components + ES5 compliance

**Run:**
```bash
node v17.0/tests/phase1-unit-tests.js
```

### Integration Tests
**File:** `/v17.0/tests/phase1-integration-tests.js`  
**Tests:** 20  
**Coverage:** Input/Output/Context modifier integration

**Run:**
```bash
node v17.0/tests/phase1-integration-tests.js
```

---

## Usage Examples

### Example 1: Queuing a System Message

```javascript
// In any modifier
LC.Drafts.add("You notice something strange...", 5);
// Message will appear in next output
```

### Example 2: Checking Action Type

```javascript
// In Context modifier
if (LC.Flags.isDo()) {
  var action = LC.Flags.getNormalizedText();
  if (action.indexOf("attack") !== -1) {
    LC.Drafts.add("[COMBAT] You enter combat mode!", 10);
  }
}
```

### Example 3: Creating a Custom Command

```javascript
// In Library.txt
LC.CommandsRegistry.register("status", function(args) {
  var L = LC.lcInit();
  return "[STATUS] Turn: " + L.turn + " | Characters: " + Object.keys(L.characters).length;
});

// User can now type: /status
```

### Example 4: Safe Regex Matching

```javascript
// Parse user input
var text = LC.Flags.getText();
var matches = LC.Tools.safeRegexMatch(text, /attack\s+(\w+)/, "i");

if (matches) {
  var target = matches[1];
  LC.Drafts.add("You attack " + target + "!", 10);
}
```

---

## Troubleshooting

### Issue: Commands not working

**Symptoms:** Typing `/ping` does nothing  
**Solution:** Ensure Library.txt is loaded before Input.txt in AI Dungeon

### Issue: Drafts not appearing

**Symptoms:** Queued messages don't show  
**Solution:** Check Output modifier is calling `LC.Drafts.flush()`

### Issue: Turn counter not incrementing

**Symptoms:** Turn stays at 0  
**Solution:** Verify Output modifier calls `LC.Turns.increment()`

### Issue: State not persisting

**Symptoms:** Data lost between turns  
**Solution:** Check `state.lincoln` (NOT `state.shared.lincoln`)

---

## Next Steps: Phase 2

After Phase 1, proceed to **Phase 2: Physical World**:
1. TimeEngine (#7) - Internal time tracking
2. EnvironmentEngine (#8) - Location and weather
3. ChronologicalKB (#18) - Timestamped event log

**Dependencies:**
- Phase 2 requires Phase 1 infrastructure
- All Phase 1 components must be tested and stable

---

## Acceptance Criteria ✅

- [x] All 8 components implemented
- [x] ES5-compatible (no forbidden syntax)
- [x] All utilities accessible via global `LC` object
- [x] `state.lincoln` initialized and versioned
- [x] CommandsRegistry uses plain object (NOT Map)
- [x] currentAction and Flags work for all action types
- [x] Turn counter increments correctly
- [x] Output queue (Drafts) works for system messages
- [x] Console logging included for diagnostics
- [x] Unit tests for each component (60 tests, 100% pass)
- [x] Integration tests (20 tests, 100% pass)
- [x] ES5 compliance validated

**Phase 1 Status:** ✅ COMPLETE AND READY FOR PHASE 2
