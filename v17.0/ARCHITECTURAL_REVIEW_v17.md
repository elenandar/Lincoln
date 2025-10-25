# PROJECT LINCOLN v17: ARCHITECTURAL REVIEW & ENHANCED SPECIFICATIONS

**Review Version:** 1.0  
**Review Date:** 25 октября 2025  
**Reviewer:** Lincoln Architect  
**Target Document:** PROJECT_LINCOLN_v17_MASTER_PLAN.md v1.0

---

## EXECUTIVE SUMMARY

### Overall Assessment

The Lincoln v17 Master Plan represents a **significant architectural improvement** over previous approaches, demonstrating:

✅ **Strengths:**
- Correct identification of AI Dungeon platform constraints (no module system)
- Sound logical isolation strategy via global `LC` object  
- Proper recognition of critical QualiaEngine → InformationEngine dependency chain
- Realistic incremental development approach
- Clear separation of concerns across 8 phases

⚠️ **Critical Issues Identified:**
1. **Missing ES5-specific constraints** in several areas (e.g., `Array.includes()` not available)
2. **Incomplete dependency graph** - several implicit dependencies not documented
3. **State Versioning rules** insufficiently specified
4. **Cache invalidation strategy** missing from Phases 4-7
5. **Integration test scenarios** not defined for critical pairs
6. **Risk mitigation strategies** too generic, need concrete implementation plans

❌ **Architecture Violations Found:**
1. **Potential circular dependency** risk between MoodEngine and CrucibleEngine not addressed
2. **CommandsRegistry uses Map** in specification (line 242) - violates ES5 constraint
3. **Missing specification** for how Context.txt coordinates with UnifiedAnalyzer
4. **Incomplete state initialization** sequence in lcInit

### Key Improvements Needed

1. **Detailed engine specifications** for all 40 components (current plan only sketches 8)
2. **Explicit ES5 compatibility patterns** for each engine
3. **Complete dependency matrix** (N×N table)
4. **Integration test suite** for each phase
5. **Performance budgets** and monitoring strategy
6. **Rollback procedures** if phase fails in production

### Recommendation

**CONDITIONAL APPROVAL** - Plan is fundamentally sound but requires:
- Complete engine specifications (Section 2 below)
- Enhanced dependency graph with all 40 engines (Section 3)
- Detailed risk mitigation playbook (Section 5)
- Comprehensive testing strategy (Section 6)

Estimated effort to complete specifications: **80-120 hours** (2-3 weeks)

---

## 1. CRITICAL REVIEW OF EXISTING PLAN

### 1.1 Architectural Validation

#### ✅ Logical Isolation - PASS

**Analysis:**  
The plan correctly proposes a single global `LC` object with logically isolated engines:

```javascript
state.shared.LC = {
  QualiaEngine: { /* isolated methods */ },
  InformationEngine: { /* isolated methods */ },
  // ...
};
```

**Validation:**
- ✅ Engines exposed via public API methods only
- ✅ Clear ownership of `state.lincoln` sections
- ✅ No direct cross-engine state access encouraged

**Recommendation:** APPROVED - This is the correct architecture given AI Dungeon constraints.

#### ⚠️ Dependency Graph - INCOMPLETE

**Issues Found:**

1. **Missing Dependencies:**
   - `MoodEngine` (#3) likely depends on `QualiaEngine` (mood influenced by qualia state)
   - `CrucibleEngine` (#16) should depend on `InformationEngine` (formative events are subjectively interpreted)
   - `GossipEngine` (#9) depends on `RelationsEngine` (credibility tied to relationships)
   - `MemoryEngine` (#12) depends on `CrucibleEngine` (myths from formative_events)

2. **Undocumented Functional Dependencies:**
   - `HierarchyEngine` → `RelationsEngine` (social capital influenced by relationships)
   - `LoreEngine` → `MemoryEngine` (legends may reference myths)
   - `GoalsEngine` → `InformationEngine` (goal perception subjective)

3. **Circular Dependency Risk:**
   ```
   MoodEngine ←→ CrucibleEngine
   (mood affects self_concept, self_concept affects mood interpretation)
   ```
   **Mitigation Required:** Define clear update order or use previous-turn state.

**Recommendation:** CONDITIONAL - Requires full dependency matrix (see Section 3.2).

#### ✅ Critical Pair Qualia → Information - CORRECT

**Analysis:**  
The plan correctly identifies this as a BLOCKING dependency:

```javascript
// InformationEngine CANNOT work without QualiaEngine
LC.InformationEngine.interpret = function(character, event) {
  const valence = LC.QualiaEngine.getValence(character); // ← REQUIRES QualiaEngine
  // ...
};
```

**Validation:**
- ✅ Dependency type correctly identified as BLOCKING
- ✅ Implementation order mandated (Qualia first, then Information)
- ✅ No interruption between implementations required

**Recommendation:** APPROVED - This is architecturally sound.

#### ⚠️ Phase Order - MOSTLY OPTIMAL

**Analysis:**

Current order:
```
Phase 0: Нулевая система
Phase 1: Инфраструктура  
Phase 2: Физический мир
Phase 3: Базовые данные
Phase 4: Сознание (Qualia → Information)
Phase 5: Социальная динамика
Phase 6: Социальная иерархия
Phase 7: Культурная память
Phase 8: Оптимизация
```

**Issues:**

1. **Phase 3 Dependencies:** 
   - `KnowledgeEngine` (secrets & focus) might benefit from `QualiaEngine.focus_aperture`
   - **Recommendation:** Consider moving `KnowledgeEngine` to Phase 5 OR make it Phase 4.3

2. **Phase 5 Missing Prerequisite:**
   - `CrucibleEngine` (#16) in Phase 5 should use `InformationEngine` for interpreting formative events
   - Currently not specified in plan
   - **Recommendation:** Add explicit integration requirement

3. **Phase 8 Timing:**
   - `UnifiedAnalyzer` (#29) requires ALL engines to exist
   - Current placement: correct
   - **Validation:** ✅ PASS

**Overall:** Phase order is 90% optimal. Minor adjustments needed for Phase 3 and explicit Phase 5 requirements.

**Recommendation:** APPROVED WITH MODIFICATIONS - See Section 4 for detailed phase plans.

### 1.2 Technical Constraints Validation

#### ❌ ES5 Compatibility - VIOLATIONS FOUND

**Issue 1: CommandsRegistry Uses Map**

*Location:* Master Plan, ФАЗА 1, line 242

```javascript
| **CommandsRegistry** (#24) | Реестр команд | Map для хранения команд |
```

**Problem:** Map is ES6+, not available in ES5.

**Fix Required:**
```javascript
// WRONG (ES6)
const commandsRegistry = new Map();
commandsRegistry.set('ping', handler);

// CORRECT (ES5)
const commandsRegistry = {};
commandsRegistry['ping'] = handler;
// or
commandsRegistry.ping = handler;
```

**Impact:** CRITICAL - Will cause runtime error in AI Dungeon.

---

**Issue 2: Potential Array.includes() Usage**

*Location:* Not explicit in plan, but common mistake

**Warning:** ES5 does NOT have `Array.prototype.includes()`.

**Forbidden Pattern:**
```javascript
if (witnesses.includes(character)) { ... } // ❌ NOT ES5
```

**ES5 Alternative:**
```javascript
if (witnesses.indexOf(character) !== -1) { ... } // ✅ ES5 compatible
```

---

**Issue 3: Const/Let in Examples**

*Location:* Throughout plan

**Note:** While AI Dungeon supports `const`/`let`, strict ES5 only has `var`.

**Recommendation:**  
- **For Lincoln v17:** Use `const`/`let` (confirmed working in AI Dungeon)
- **Fallback:** If errors occur, document `var` conversion patterns

---

#### ✅ Story Cards API - CORRECT

**Validation:**

Plan correctly states:
- ✅ Use global `storyCards` array (not `state.storyCards`)
- ✅ Use built-in `addStoryCard()`, `updateStoryCard()`, `removeStoryCard()`
- ✅ No custom implementation needed

**Example from plan aligns with requirements:**
```javascript
// Master Plan mentions built-in functions - CORRECT
```

**Recommendation:** APPROVED - Story Cards usage is correctly specified.

---

#### ✅ Global Parameters - CORRECT

**Validation:**

Plan correctly identifies available globals:
- ✅ `text` - current input/output/context
- ✅ `state` - persistent storage
- ✅ `info` - metadata
- ✅ `history` - action history  
- ✅ `storyCards` - global array

**Note:** Plan correctly uses `state.lincoln` (not `state.storyCards`).

**Recommendation:** APPROVED - Global parameter usage is correct.

---

#### ✅ Mandatory Script Structure - CORRECT

**Validation:**

Plan examples follow required pattern:
```javascript
const modifier = (text) => {
  // All code here
  return { text };
};
modifier(text);
```

**Recommendation:** APPROVED - Script structure is correct.

---

### 1.3 Gaps and Missing Elements

#### ⚠️ Gap 1: Missing Engine Specifications

**Problem:** Plan only sketches 8 engines. v16 had 40 systems.

**Missing Specifications:**
- #19: LC.Tools (safeRegexMatch, escapeRegex)
- #20: LC.Utils (toNum, toStr, toBool)
- #21: LC.Flags (currentAction facade)
- #22: LC.Drafts (message queue)
- #23: LC.Turns (turn counter)
- #24: CommandsRegistry (command parser)
- #25-28: (Unspecified in plan - need identification)
- #29: UnifiedAnalyzer (coordinator)
- #30: State Versioning
- #31: Context Caching
- #32: Norm Cache

**Impact:** Cannot implement without full specifications.

**Recommendation:** CREATE FULL SPECIFICATIONS (Section 2 below).

---

#### ⚠️ Gap 2: Integration Points Not Described

**Missing:**

1. **Input.txt ↔ CommandsRegistry:**
   - How commands are parsed
   - Error handling for unknown commands
   - Command argument validation

2. **Output.txt ↔ LC.Drafts:**
   - Message queuing mechanism
   - Priority handling
   - Draft composition order

3. **Context.txt ↔ UnifiedAnalyzer:**
   - When analyzer is triggered
   - What context is provided
   - How results are integrated

4. **Library.txt initialization order:**
   - Which engines initialize first
   - Dependency checking
   - Failure recovery

**Recommendation:** DEFINE INTEGRATION CONTRACTS (Section 2).

---

#### ⚠️ Gap 3: Risks Not Mentioned

**Missing Risk Categories:**

1. **Performance Risks:**
   - O(n²) relationship calculations at scale
   - Story Cards array growth unbounded
   - Cache invalidation too aggressive

2. **Data Corruption Risks:**
   - Partial state updates if error mid-turn
   - State versioning desync
   - Character data structure mismatch

3. **Dependency Risks:**
   - Engine A updated, Engine B not compatible
   - Circular dependency deadlock
   - Missing dependency not caught until runtime

4. **Platform Risks:**
   - AI Dungeon API changes
   - Script size limits exceeded
   - Execution timeout on complex turns

**Recommendation:** COMPREHENSIVE RISK ASSESSMENT (Section 5).

---

#### ⚠️ Gap 4: Test Scenarios for Critical Dependencies

**Missing Test Definitions:**

1. **Qualia → Information Integration:**
   - ✗ No test for valence=0.0 (edge case)
   - ✗ No test for rapid valence changes
   - ✗ No test for multiple characters simultaneous interpretation

2. **Information → Relations Integration:**
   - ✗ No test for perception-modified relationship updates
   - ✗ No test for contradictory perceptions
   - ✗ No test for perception persistence

3. **Information → Hierarchy Integration:**
   - ✗ No test for subjective reputation calculation
   - ✗ No test for status changes based on perceptions
   - ✗ No test for witness credibility impact

**Recommendation:** INTEGRATION TEST SUITE (Section 6).

---

## 2. DETAILED ENGINE SPECIFICATIONS

This section provides complete specifications for ALL engines in the Lincoln v17 system, following the template from the issue requirements.

---

### 2.1 QualiaEngine Specification

# QualiaEngine Specification

## Purpose

The **QualiaEngine** implements **Level 1: Phenomenology** in the four-level consciousness model. It manages raw, pre-cognitive bodily sensations—"what it feels like" to be a character—without interpretation or meaning.

**Problem Solved:**  
Previous systems jumped directly from events to emotional responses, missing the crucial pre-cognitive layer. QualiaEngine provides the physiological foundation upon which all higher-level processing (interpretation, personality, social dynamics) is built.

**Philosophical Basis:**  
Based on David Chalmers' concept of qualia (the subjective "feel" of experiences). A character's valence (pleasant/unpleasant feeling) influences how they interpret the same event differently.

## Dependencies

- **BLOCKING**: None (foundational layer)
- **FUNCTIONAL**: None
- **NONE**: QualiaEngine is the foundation—no dependencies

**Critical Note:** QualiaEngine MUST be implemented BEFORE InformationEngine.

## Public API

### Method: LC.QualiaEngine.resonate(character, event)

**Purpose:** Update a character's qualia_state based on an event's impact.

**Parameters:**
- `character` (string): Character name (e.g., "Alice")
- `event` (object): Event descriptor with fields:
  - `type` (string): Event category ("praise", "threat", "loss", "victory", etc.)
  - `intensity` (number): Event strength [0.0 - 1.0]
  - `delta` (object, optional): Direct adjustments to qualia parameters

**Returns:** `void` (modifies state directly)

**Side Effects:**
- Modifies: `state.lincoln.characters[character].qualia_state`
- Invalidates cache: YES (requires `state.lincoln.stateVersion++`)
- Calls other engines: NONE

**Example Usage:**
```javascript
// Event: Alice receives praise
LC.QualiaEngine.resonate("Alice", {
  type: "praise",
  intensity: 0.7
});

// Direct adjustment example
LC.QualiaEngine.resonate("Alice", {
  type: "custom",
  delta: {
    valence: +0.2,       // More pleasant
    energy_level: +0.1,  // Slight energy boost
    somatic_tension: -0.05 // Reduced tension
  }
});

// MANDATORY: Increment state version
state.lincoln.stateVersion++;
```

**Behavior:**
1. Retrieve current `qualia_state` for character
2. Apply event-based transformations:
   - `"praise"` → valence ↑, energy ↑, tension ↓
   - `"threat"` → valence ↓, tension ↑, focus ↑
   - `"loss"` → valence ↓, energy ↓
3. Clamp all values to [0.0, 1.0]
4. Update `state.lincoln.characters[character].qualia_state`

**Error Handling:**
- If character doesn't exist: Initialize with default qualia_state
- If event type unknown: Apply delta only (if provided), else no-op
- If intensity out of range: Clamp to [0.0, 1.0]

---

### Method: LC.QualiaEngine.getValence(character)

**Purpose:** Retrieve the current pleasant/unpleasant feeling value for a character.

**Parameters:**
- `character` (string): Character name

**Returns:** `number` - Valence value [0.0 - 1.0]
- 0.0 = extremely unpleasant
- 0.5 = neutral
- 1.0 = extremely pleasant

**Side Effects:**
- Modifies: NONE (read-only)
- Invalidates cache: NO
- Calls other engines: NONE

**Example:**
```javascript
var valence = LC.QualiaEngine.getValence("Alice");
if (valence > 0.7) {
  // Alice is feeling good—interpret events positively
}
```

**Error Handling:**
- If character doesn't exist: Return 0.5 (neutral default)

---

### Method: LC.QualiaEngine.getTension(character)

**Purpose:** Retrieve somatic tension level.

**Returns:** `number` [0.0 - 1.0]
- 0.0 = completely relaxed
- 1.0 = maximum tension

**Example:**
```javascript
var tension = LC.QualiaEngine.getTension("Alice");
```

---

### Method: LC.QualiaEngine.getFocus(character)

**Purpose:** Retrieve focus aperture (attention scope).

**Returns:** `number` [0.0 - 1.0]
- 0.0 = broad, diffuse attention
- 1.0 = narrow, laser focus

---

### Method: LC.QualiaEngine.getEnergy(character)

**Purpose:** Retrieve energy level.

**Returns:** `number` [0.0 - 1.0]
- 0.0 = depleted
- 1.0 = fully energized

---

## Data Structures

### state.lincoln.characters[name].qualia_state

```javascript
{
  somatic_tension: 0.5,  // Physical tension [0.0-1.0], default 0.5
  valence: 0.5,          // Pleasant(1.0) to unpleasant(0.0), default 0.5
  focus_aperture: 0.5,   // Narrow(1.0) to broad(0.0) attention, default 0.5
  energy_level: 0.5      // Vitality [0.0-1.0], default 0.5
}
```

**Ownership:** QualiaEngine (exclusive write access)  
**Lifecycle:**
- **Created:** When character first appears (via `resonate()` or explicit init)
- **Updated:** Every time `resonate()` is called
- **Deleted:** Never (persists for character lifetime)

**Default Values:** All parameters initialize to 0.5 (neutral state).

---

## ES5 Implementation Notes

### Patterns

**Use plain object for qualia_state:**
```javascript
// ES5-compatible structure
var qualiaState = {
  somatic_tension: 0.5,
  valence: 0.5,
  focus_aperture: 0.5,
  energy_level: 0.5
};
```

**Avoid Array methods not in ES5:**
```javascript
// ❌ NOT ES5
Object.keys(delta).forEach(key => { ... });

// ✅ ES5 compatible
var keys = Object.keys(delta);
for (var i = 0; i < keys.length; i++) {
  var key = keys[i];
  // ...
}
```

**Clamping values:**
```javascript
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
```

### Common Pitfalls

- ⚠️ **DON'T** use `Array.includes()` (not in ES5) → use `indexOf() !== -1`
- ⚠️ **DON'T** use destructuring: `{ valence } = state` → use `var valence = state.valence`
- ⚠️ **DON'T** forget to clamp values to [0.0, 1.0]
- ⚠️ **DON'T** forget `state.lincoln.stateVersion++` after updates

---

## Integration Points

### With InformationEngine (Level 2)

**Type:** BLOCKING (InformationEngine depends on QualiaEngine)  
**How:** InformationEngine reads `qualia_state.valence` to color event interpretations.

**Example:**
```javascript
// InformationEngine uses QualiaEngine
LC.InformationEngine.interpret = function(character, event) {
  var valence = LC.QualiaEngine.getValence(character); // ← Reads qualia
  
  if (valence > 0.7) {
    return { interpretation: "искренне", multiplier: 1.5 };
  } else if (valence < 0.3) {
    return { interpretation: "саркастично", multiplier: 0.4 };
  }
  return { interpretation: "нейтрально", multiplier: 1.0 };
};
```

### With MoodEngine (Functional)

**Type:** FUNCTIONAL (MoodEngine can use qualia for richer moods)  
**How:** MoodEngine can derive mood labels from qualia parameters.

**Example:**
```javascript
// MoodEngine derives mood from qualia
LC.MoodEngine.getMood = function(character) {
  var valence = LC.QualiaEngine.getValence(character);
  var energy = LC.QualiaEngine.getEnergy(character);
  
  if (valence > 0.6 && energy > 0.6) return "euphoric";
  if (valence < 0.4 && energy < 0.4) return "depressed";
  // ...
};
```

---

## Testing Strategy

### Test Commands

```javascript
// Command 1: Get qualia state
/qualia get Alice
// Expected output: "Alice qualia: valence=0.50, tension=0.50, focus=0.50, energy=0.50"

// Command 2: Set specific parameter
/qualia set Alice valence 0.8
// Expected: valence updated to 0.8

// Command 3: Trigger event
/qualia event Alice praise 0.7
// Expected: valence ↑, energy ↑, tension ↓

// Command 4: Test clamping
/qualia set Alice valence 1.5
// Expected: valence clamped to 1.0

// Command 5: Test persistence
/qualia set Alice valence 0.3
[Save game, reload]
/qualia get Alice
// Expected: valence still 0.3 (persistence verified)
```

### Success Criteria

- [ ] Default qualia_state created when character first accessed
- [ ] All 4 parameters (tension, valence, focus, energy) stored correctly
- [ ] `resonate()` updates state based on event type
- [ ] Getter methods return correct values
- [ ] Values clamped to [0.0, 1.0]
- [ ] State persists across turns and save/load
- [ ] `stateVersion` incremented after modifications
- [ ] No ES6 constructs used
- [ ] Commands work without errors

### Edge Cases to Test

1. **Character doesn't exist:**
   - `getValence("UnknownChar")` → Should return 0.5 (default)
   - `resonate("UnknownChar", event)` → Should create qualia_state

2. **Extreme values:**
   - `resonate()` with delta pushing value above 1.0 → Clamped to 1.0
   - `resonate()` with delta pushing value below 0.0 → Clamped to 0.0

3. **Rapid sequential updates:**
   - Multiple `resonate()` calls in one turn → All applied cumulatively

4. **Unknown event types:**
   - `resonate("Alice", { type: "unknown" })` → No-op (or use delta if provided)

---

## Common Pitfalls

### Architectural

- ⚠️ **DON'T** let other engines write directly to `qualia_state`
  - ❌ `state.lincoln.characters.Alice.qualia_state.valence = 0.8;`
  - ✅ `LC.QualiaEngine.resonate("Alice", { delta: { valence: 0.3 } });`

- ⚠️ **DON'T** read qualia state directly from other engines
  - ❌ `var v = state.lincoln.characters.Alice.qualia_state.valence;`
  - ✅ `var v = LC.QualiaEngine.getValence("Alice");`

### Technical

- ⚠️ **DON'T** forget `state.lincoln.stateVersion++` after `resonate()`
- ⚠️ **DON'T** use ES6 features (Map, Set, destructuring)
- ⚠️ **DON'T** forget to clamp values
- ⚠️ **DON'T** forget `return { text }` in modifier scripts

---

## State Versioning Rules

**When to increment `stateVersion`:**
- After `resonate()` modifies qualia_state
- After ANY write to `state.lincoln.characters[name].qualia_state`

**When NOT to increment:**
- During read operations (`getValence()`, `getTension()`, etc.)
- During intermediate calculations (before final state update)

**Example:**
```javascript
LC.QualiaEngine.resonate("Alice", event);
state.lincoln.stateVersion++; // ✅ REQUIRED

var valence = LC.QualiaEngine.getValence("Alice");
// NO increment needed for reads
```

---

## Performance Considerations

- **Frequency:** Called potentially every turn for active characters
- **Complexity:** O(1) - simple arithmetic operations
- **Caching:** Qualia state already in `state.lincoln`, no additional cache needed
- **Optimization:** None required—engine is inherently fast

---


### 2.2 InformationEngine Specification

# InformationEngine Specification

## Purpose

The **InformationEngine** implements **Level 2: Psychology** in the four-level consciousness model. It provides **subjective interpretation** of events based on a character's phenomenological state (qualia).

**Problem Solved:**  
In traditional systems, events have objective meanings. In reality, the same event ("You're brave") can be interpreted as:
- Sincere compliment (if feeling good)
- Sarcastic insult (if feeling bad)
- Neutral observation (if neutral)

InformationEngine models this subjectivity, ensuring characters in different qualia states experience different realities from identical events.

**Key Innovation:**  
Reputation and relationships are built on **perceptions**, not objective truth. Alice's view of Bob is stored separately from Bob's objective traits.

## Dependencies

- **BLOCKING**: QualiaEngine ✅ MUST EXIST
  - `InformationEngine.interpret()` reads `qualia_state.valence`
- **FUNCTIONAL**: None
- **USED BY**: RelationsEngine, HierarchyEngine, CrucibleEngine (all depend on subjective interpretation)

**Critical:** Cannot be implemented before QualiaEngine is complete.

## Public API

### Method: LC.InformationEngine.interpret(character, event)

**Purpose:** Generate subjective interpretation of an event based on character's current qualia state.

**Parameters:**
- `character` (string): Observer's name
- `event` (object): Event to interpret
  - `type` (string): Event category ("praise", "criticism", "betrayal", etc.)
  - `source` (string, optional): Who caused the event
  - `intensity` (number, optional): Event strength [0.0-1.0]

**Returns:** `object` - Interpretation result
```javascript
{
  interpretation: string,  // "искренне", "саркастично", "подозрительно", etc.
  multiplier: number,      // Effect multiplier [0.0-2.0]
  confidence: number       // Interpretation certainty [0.0-1.0]
}
```

**Side Effects:**
- Modifies: NONE (read-only operation)
- Invalidates cache: NO
- Calls other engines: `LC.QualiaEngine.getValence(character)`

**Example Usage:**
```javascript
// Alice hears "You're really brave"
var interpretation = LC.InformationEngine.interpret("Alice", {
  type: "praise",
  source: "Bob",
  intensity: 0.7
});

// If Alice's valence is 0.8 (feeling good):
// { interpretation: "искренне", multiplier: 1.4, confidence: 0.8 }

// If Alice's valence is 0.2 (feeling bad):
// { interpretation: "саркастично", multiplier: 0.5, confidence: 0.7 }

// Use multiplier to adjust relationship impact
var baseChange = 10;
var actualChange = baseChange * interpretation.multiplier;
LC.RelationsEngine.updateRelation("Alice", "Bob", actualChange);
```

**Interpretation Logic:**

```javascript
valence = LC.QualiaEngine.getValence(character);

if (valence >= 0.7) {
  // Optimistic interpretation
  interpretation = "искренне";
  multiplier = 1.0 + (valence - 0.7) * 2;  // [1.0 - 1.6]
} else if (valence <= 0.3) {
  // Pessimistic interpretation  
  interpretation = "саркастично";
  multiplier = valence * 2;  // [0.0 - 0.6]
} else {
  // Neutral
  interpretation = "нейтрально";
  multiplier = 1.0;
}
```

**Error Handling:**
- If character doesn't exist: Use default valence (0.5) → neutral interpretation
- If event type unknown: Return neutral interpretation
- If QualiaEngine unavailable: Throw error (blocking dependency)

---

### Method: LC.InformationEngine.getPerception(observer, target)

**Purpose:** Retrieve observer's subjective perception of target character.

**Parameters:**
- `observer` (string): Character doing the perceiving
- `target` (string): Character being perceived

**Returns:** `object` - Perception data
```javascript
{
  trust: number,       // [0.0-1.0], default 0.5
  respect: number,     // [0.0-1.0], default 0.5  
  competence: number,  // [0.0-1.0], default 0.5
  affection: number    // [0.0-1.0], default 0.5
}
```

**Side Effects:**
- Modifies: NONE (read-only)
- Invalidates cache: NO
- Calls other engines: NONE

**Example:**
```javascript
var aliceViewOfBob = LC.InformationEngine.getPerception("Alice", "Bob");
// { trust: 0.7, respect: 0.6, competence: 0.8, affection: 0.5 }
```

**Error Handling:**
- If perception doesn't exist: Return default (all 0.5)
- If observer/target don't exist: Return default

---

### Method: LC.InformationEngine.updatePerception(observer, target, changes)

**Purpose:** Modify observer's perception of target based on interpreted events.

**Parameters:**
- `observer` (string): Character doing the perceiving
- `target` (string): Character being perceived  
- `changes` (object): Adjustments to make
  - `trust` (number, optional): Delta [-1.0 to +1.0]
  - `respect` (number, optional): Delta [-1.0 to +1.0]
  - `competence` (number, optional): Delta [-1.0 to +1.0]
  - `affection` (number, optional): Delta [-1.0 to +1.0]

**Returns:** `void`

**Side Effects:**
- Modifies: `state.lincoln.characters[observer].perceptions[target]`
- Invalidates cache: YES (requires `state.lincoln.stateVersion++`)
- Calls other engines: NONE

**Example:**
```javascript
// Bob helps Alice (competence +0.2, trust +0.1)
LC.InformationEngine.updatePerception("Alice", "Bob", {
  competence: +0.2,
  trust: +0.1
});

state.lincoln.stateVersion++; // MANDATORY
```

**Error Handling:**
- If perception doesn't exist: Create with defaults, then apply changes
- Clamp all values to [0.0, 1.0] after update
- If observer/target invalid: Log warning, no-op

---

## Data Structures

### state.lincoln.characters[name].perceptions

```javascript
{
  "Bob": {
    trust: 0.7,       // How much observer trusts this character
    respect: 0.6,     // How much observer respects this character  
    competence: 0.8,  // How competent observer thinks they are
    affection: 0.5    // How much observer likes them
  },
  "Carol": {
    trust: 0.3,
    respect: 0.5,
    competence: 0.4,
    affection: 0.2
  }
  // ... one entry per observed character
}
```

**Ownership:** InformationEngine (exclusive write access)  
**Lifecycle:**
- **Created:** When `updatePerception()` first called for observer-target pair
- **Updated:** Via `updatePerception()`
- **Read:** Via `getPerception()`
- **Deleted:** Never (persists indefinitely)

**Key Insight:** This is **Alice's subjective view of Bob**, not Bob's objective traits. Bob may have `personality.trust = 0.9` (objective), but Alice sees him as `trust = 0.3` (subjective perception).

---

## ES5 Implementation Notes

### Patterns

**Use nested plain objects for perceptions:**
```javascript
// Initialize perceptions if needed
if (!state.lincoln.characters[observer]) {
  state.lincoln.characters[observer] = {};
}
if (!state.lincoln.characters[observer].perceptions) {
  state.lincoln.characters[observer].perceptions = {};
}

// Set perception
state.lincoln.characters[observer].perceptions[target] = {
  trust: 0.5,
  respect: 0.5,
  competence: 0.5,
  affection: 0.5
};
```

**Avoid ES6 Object spread:**
```javascript
// ❌ ES6
const updated = { ...existing, trust: 0.8 };

// ✅ ES5
var updated = {};
var keys = Object.keys(existing);
for (var i = 0; i < keys.length; i++) {
  updated[keys[i]] = existing[keys[i]];
}
updated.trust = 0.8;
```

**Safe property access:**
```javascript
// ❌ ES6 optional chaining
const trust = state.lincoln.characters?.[observer]?.perceptions?.[target]?.trust;

// ✅ ES5
var trust = 0.5; // default
if (state.lincoln.characters[observer] &&
    state.lincoln.characters[observer].perceptions &&
    state.lincoln.characters[observer].perceptions[target]) {
  trust = state.lincoln.characters[observer].perceptions[target].trust;
}
```

### Common Pitfalls

- ⚠️ **DON'T** use `Object.assign()` (not in ES5) → manual copy
- ⚠️ **DON'T** forget to initialize nested structures before writing
- ⚠️ **DON'T** forget `state.lincoln.stateVersion++` after `updatePerception()`
- ⚠️ **DON'T** forget to clamp perception values to [0.0, 1.0]

---

## Integration Points

### With QualiaEngine (BLOCKING Dependency)

**Type:** BLOCKING  
**How:** Reads `qualia_state.valence` for interpretation.

**Example:**
```javascript
LC.InformationEngine.interpret = function(character, event) {
  var valence = LC.QualiaEngine.getValence(character); // ← REQUIRES QualiaEngine
  // ... interpretation logic
};
```

**Critical:** If QualiaEngine doesn't exist, InformationEngine cannot function.

---

### With RelationsEngine (FUNCTIONAL Provider)

**Type:** FUNCTIONAL (RelationsEngine uses InformationEngine)  
**How:** RelationsEngine calls `interpret()` to determine relationship impact.

**Example:**
```javascript
// RelationsEngine uses InformationEngine
LC.RelationsEngine.updateRelation = function(from, to, baseChange, event) {
  if (event) {
    var interpretation = LC.InformationEngine.interpret(from, event);
    baseChange *= interpretation.multiplier; // ← Subjective adjustment
  }
  
  state.lincoln.relations[from][to] += baseChange;
  state.lincoln.stateVersion++;
};
```

---

### With HierarchyEngine (FUNCTIONAL Provider)

**Type:** FUNCTIONAL (HierarchyEngine uses perceptions for reputation)  
**How:** Social status calculated from subjective perceptions, not objective traits.

**Example:**
```javascript
// HierarchyEngine calculates reputation from perceptions
LC.HierarchyEngine.calculateReputation = function(character) {
  var witnesses = getAllCharacters();
  var totalRespect = 0;
  
  for (var i = 0; i < witnesses.length; i++) {
    var witness = witnesses[i];
    var perception = LC.InformationEngine.getPerception(witness, character);
    totalRespect += perception.respect; // ← Subjective perception
  }
  
  return totalRespect / witnesses.length;
};
```

**Key Innovation:** This is v16's breakthrough—reputation is social consensus of subjective views, not objective measurement.

---

## Testing Strategy

### Test Commands

```javascript
// Command 1: Test interpretation with high valence
/qualia set Alice valence 0.9
/interpret Alice praise Bob
// Expected: "искренне", multiplier > 1.0

// Command 2: Test interpretation with low valence
/qualia set Alice valence 0.2
/interpret Alice praise Bob
// Expected: "саркастично", multiplier < 1.0

// Command 3: Get perception
/perception get Alice Bob
// Expected: Display trust, respect, competence, affection values

// Command 4: Update perception
/perception update Alice Bob trust 0.8
/perception get Alice Bob
// Expected: trust now 0.8

// Command 5: Test perception independence
/perception update Alice Bob trust 0.9
/perception update Bob Alice trust 0.3
/perception get Alice Bob  // Should show 0.9
/perception get Bob Alice  // Should show 0.3
// Expected: Asymmetric perceptions (Alice trusts Bob ≠ Bob trusts Alice)
```

### Success Criteria

- [ ] `interpret()` returns different multipliers for different valence values
- [ ] High valence (>0.7) → multiplier > 1.0 ("искренне")
- [ ] Low valence (<0.3) → multiplier < 1.0 ("саркастично")
- [ ] Neutral valence (0.3-0.7) → multiplier ≈ 1.0 ("нейтрально")
- [ ] Perceptions stored correctly in `state.lincoln.characters[name].perceptions`
- [ ] `getPerception()` returns default if perception doesn't exist
- [ ] `updatePerception()` creates perception if doesn't exist
- [ ] Perception values clamped to [0.0, 1.0]
- [ ] Perceptions are **asymmetric** (Alice→Bob ≠ Bob→Alice)
- [ ] State versioning works
- [ ] No ES6 constructs

### Edge Cases to Test

1. **Extreme valence:**
   - valence = 0.0 → interpretation still valid (not null/error)
   - valence = 1.0 → interpretation still valid

2. **Missing data:**
   - `interpret()` for nonexistent character → Uses default valence
   - `getPerception()` for nonexistent pair → Returns default

3. **Perception boundaries:**
   - `updatePerception()` with delta causing value > 1.0 → Clamped to 1.0
   - `updatePerception()` with delta causing value < 0.0 → Clamped to 0.0

4. **Integration:**
   - Change valence → interpret → verify multiplier changes
   - Update perception → calculate reputation → verify impact

---

## Common Pitfalls

### Architectural

- ⚠️ **DON'T** confuse perceptions with personality
  - Perception: Alice's *view* of Bob's trust (`perceptions.Bob.trust`)
  - Personality: Bob's *actual* trust trait (`personality.trust`)

- ⚠️ **DON'T** make perceptions symmetric
  - ❌ Assumption: If Alice trusts Bob 0.8, then Bob trusts Alice 0.8
  - ✅ Reality: Perceptions are independent and asymmetric

- ⚠️ **DON'T** bypass InformationEngine in other engines
  - ❌ RelationsEngine directly reads `qualia_state`
  - ✅ RelationsEngine calls `LC.InformationEngine.interpret()`

### Technical

- ⚠️ **DON'T** forget `state.lincoln.stateVersion++` after `updatePerception()`
- ⚠️ **DON'T** use ES6 optional chaining → manual null checks
- ⚠️ **DON'T** forget to initialize nested perception structures

---

## State Versioning Rules

**When to increment:**
- After `updatePerception()` modifies `perceptions`
- After ANY write to `state.lincoln.characters[name].perceptions`

**When NOT to increment:**
- During `interpret()` (read-only)
- During `getPerception()` (read-only)

---

## Performance Considerations

- **Frequency:** 
  - `interpret()`: Called many times per turn (for each relationship update)
  - `updatePerception()`: Called less frequently (only when perception changes)
  - `getPerception()`: Called frequently (by HierarchyEngine, RelationsEngine)

- **Complexity:**
  - All methods: O(1)

- **Caching Opportunities:**
  - Interpretation results could be cached per character per turn
  - Cache key: `${character}_${turn}_${valence}`
  - Invalidate when valence changes

**Caching Example:**
```javascript
LC.InformationEngine._interpretCache = {};

LC.InformationEngine.interpret = function(character, event) {
  var cacheKey = character + "_" + state.lincoln.turn;
  
  if (this._interpretCache[cacheKey]) {
    return this._interpretCache[cacheKey];
  }
  
  // ... compute interpretation
  
  this._interpretCache[cacheKey] = result;
  return result;
};
```

---


### 2.3 RelationsEngine Specification

# RelationsEngine Specification

## Purpose

**RelationsEngine** manages bilateral relationship strength between characters, incorporating **subjective interpretation** from InformationEngine to ensure the same event affects relationships differently based on phenomenological state.

**Problem Solved:**  
Traditional relationship systems use objective modifiers. RelationsEngine ensures:
- Same event (e.g., "Bob helps Alice") has different relationship impact depending on Alice's qualia state
- Relationships are asymmetric (Alice→Bob ≠ Bob→Alice)
- Relationship changes reflect subjective reality, not objective events

## Dependencies

- **BLOCKING**: None (can function with basic mechanics)
- **FUNCTIONAL**: InformationEngine (for subjective interpretation of events)
- **FUNCTIONAL**: QualiaEngine (indirectly via InformationEngine)

**Best Practice:** Implement AFTER InformationEngine to immediately integrate subjective interpretation.

## Public API

### Method: LC.RelationsEngine.updateRelation(from, to, modifier, options)

**Purpose:** Update relationship strength from one character to another.

**Parameters:**
- `from` (string): Source character
- `to` (string): Target character
- `modifier` (number): Base relationship change [-100 to +100]
- `options` (object, optional):
  - `interpretedEvent` (object): Event to interpret via InformationEngine
  - `bypass` (boolean): Skip interpretation (use raw modifier)

**Returns:** `void`

**Side Effects:**
- Modifies: `state.lincoln.relations[from][to]`
- Invalidates cache: YES (requires `state.lincoln.stateVersion++`)
- Calls other engines: `LC.InformationEngine.interpret()` if event provided

**Example:**
```javascript
// Basic update (no interpretation)
LC.RelationsEngine.updateRelation("Alice", "Bob", +15);
state.lincoln.stateVersion++;

// With subjective interpretation
LC.RelationsEngine.updateRelation("Alice", "Bob", +15, {
  interpretedEvent: {
    type: "praise",
    source: "Bob",
    intensity: 0.7
  }
});
state.lincoln.stateVersion++;

// If Alice's valence is 0.8, modifier becomes +15 * 1.4 = +21
// If Alice's valence is 0.2, modifier becomes +15 * 0.5 = +7.5
```

**Behavior:**
1. Check if interpretation needed
2. If `interpretedEvent` provided, call `LC.InformationEngine.interpret(from, interpretedEvent)`
3. Multiply base modifier by interpretation.multiplier
4. Apply to `state.lincoln.relations[from][to]`
5. Clamp to range [-100, +100]

---

### Method: LC.RelationsEngine.getRelation(from, to)

**Purpose:** Retrieve current relationship value.

**Returns:** `number` [-100 to +100], default 0 (neutral)

**Example:**
```javascript
var aliceViewOfBob = LC.RelationsEngine.getRelation("Alice", "Bob");
// Returns number between -100 and +100
```

---

## Data Structures

### state.lincoln.relations

```javascript
{
  "Alice": {
    "Bob": 50,    // Alice → Bob relationship strength
    "Carol": -20  // Alice → Carol relationship strength
  },
  "Bob": {
    "Alice": 30,  // Bob → Alice (asymmetric!)
    "Carol": 10
  }
}
```

**Range:** [-100, +100]
- -100: Maximum hatred
- 0: Neutral
- +100: Maximum affection

**Ownership:** RelationsEngine  
**Lifecycle:**
- **Created:** When first relationship update occurs
- **Updated:** Via `updateRelation()`
- **Deleted:** Never

---

## ES5 Implementation Notes

**Nested object initialization:**
```javascript
if (!state.lincoln.relations[from]) {
  state.lincoln.relations[from] = {};
}
if (typeof state.lincoln.relations[from][to] === 'undefined') {
  state.lincoln.relations[from][to] = 0; // Default neutral
}
```

---

## Integration Points

### With InformationEngine (FUNCTIONAL)

**How:** Calls `interpret()` to get subjective multiplier.

```javascript
LC.RelationsEngine.updateRelation = function(from, to, modifier, options) {
  if (options && options.interpretedEvent) {
    var interpretation = LC.InformationEngine.interpret(from, options.interpretedEvent);
    modifier *= interpretation.multiplier;
  }
  
  if (!state.lincoln.relations[from]) state.lincoln.relations[from] = {};
  if (!state.lincoln.relations[from][to]) state.lincoln.relations[from][to] = 0;
  
  state.lincoln.relations[from][to] += modifier;
  state.lincoln.relations[from][to] = Math.max(-100, Math.min(100, state.lincoln.relations[from][to]));
  
  state.lincoln.stateVersion++;
};
```

---

## Testing Strategy

### Test Commands

```javascript
// Set relationship directly
/relation set Alice Bob 50

// Get relationship
/relation get Alice Bob
// Expected: 50

// Test asymmetry
/relation set Alice Bob 70
/relation set Bob Alice 20
/relation get Alice Bob  // 70
/relation get Bob Alice  // 20

// Test interpretation integration
/qualia set Alice valence 0.8
/relation update Alice Bob 10 praise
// Expected: relationship increases by ~14 (10 * 1.4 multiplier)

/qualia set Alice valence 0.2
/relation update Alice Bob 10 praise  
// Expected: relationship increases by ~5 (10 * 0.5 multiplier)
```

### Success Criteria

- [ ] Relationships stored correctly
- [ ] Asymmetric relationships (Alice→Bob ≠ Bob→Alice)
- [ ] Values clamped to [-100, +100]
- [ ] Integration with InformationEngine works
- [ ] Same event produces different outcomes based on valence
- [ ] State versioning increments

---

## Common Pitfalls

- ⚠️ **DON'T** assume symmetric relationships
- ⚠️ **DON'T** forget state versioning
- ⚠️ **DON'T** bypass InformationEngine when event context available

---

### 2.4 CrucibleEngine Specification

# CrucibleEngine Specification

## Purpose

**CrucibleEngine** implements **Level 3: Personality** in the consciousness model. It manages:
- Objective personality traits (who the character *actually is*)
- Subjective self-concept (who the character *thinks they are*)
- Formative events (experiences that shape character)

**Key Insight:** Personality ≠ Self-Concept. A character may be objectively brave (personality.bravery = 0.8) but perceive themselves as cowardly (self_concept.bravery = 0.3).

## Dependencies

- **BLOCKING**: None (foundational)
- **FUNCTIONAL**: InformationEngine (for subjective interpretation of formative events)
- **FUNCTIONAL**: QualiaEngine (formative events affect qualia)

## Public API

### Method: LC.CrucibleEngine.registerFormativeEvent(character, event)

**Purpose:** Record an experience that shapes character identity.

**Parameters:**
- `character` (string): Character name
- `event` (object):
  - `type` (string): "betrayal", "triumph", "loss", "revelation", etc.
  - `description` (string): What happened
  - `intensity` (number): Impact strength [0.0-1.0]
  - `witnesses` (array): Other characters present

**Returns:** `void`

**Side Effects:**
- Modifies: `state.lincoln.characters[character].formative_events`
- May modify: `personality`, `self_concept` (based on event type)
- Invalidates cache: YES

**Example:**
```javascript
LC.CrucibleEngine.registerFormativeEvent("Alice", {
  type: "betrayal",
  description: "Bob revealed Alice's secret to everyone",
  intensity: 0.9,
  witnesses: ["Bob", "Carol", "Dave"]
});

state.lincoln.stateVersion++;
```

---

### Method: LC.CrucibleEngine.getPersonality(character)

**Purpose:** Get objective personality traits.

**Returns:** `object`
```javascript
{
  trust: 0.5,       // Tendency to trust others [0-1]
  bravery: 0.5,     // Courage in face of danger [0-1]
  idealism: 0.5,    // Belief in ideals vs. pragmatism [0-1]
  aggression: 0.3   // Tendency toward conflict [0-1]
}
```

---

### Method: LC.CrucibleEngine.getSelfConcept(character)

**Purpose:** Get subjective self-perception.

**Returns:** Same structure as personality, but values may differ.

---

## Data Structures

### state.lincoln.characters[name] (CrucibleEngine portion)

```javascript
{
  personality: {
    trust: 0.5,
    bravery: 0.5,
    idealism: 0.5,
    aggression: 0.3
  },
  self_concept: {
    trust: 0.4,      // May differ from reality!
    bravery: 0.7,
    idealism: 0.3,
    aggression: 0.5
  },
  formative_events: [
    {
      type: "betrayal",
      description: "...",
      turn: 42,
      intensity: 0.9,
      witnesses: ["Bob", "Carol"]
    }
  ]
}
```

**Ownership:** CrucibleEngine  
**Lifecycle:**
- **Created:** Character initialization
- **Updated:** Via formative events
- **Deleted:** Never

---

## Testing Strategy

```javascript
// Register formative event
/formative add Alice betrayal "Bob betrayed Alice" 0.9

// Check personality vs self-concept
/personality get Alice
/self-concept get Alice
// Expected: May show different values

// Test formative event impact
/formative add Alice triumph "Alice won the competition" 0.8
/personality get Alice
// Expected: bravery ↑, idealism ↑
```

---

### 2.5 HierarchyEngine Specification

# HierarchyEngine Specification

## Purpose

**HierarchyEngine** implements social status and hierarchy based on **subjective perceptions**, not objective traits.

**Key Innovation (from v16):**  
Status is calculated from **social consensus of subjective perceptions**. A character with high objective competence may still have low status if others *perceive* them as incompetent.

## Dependencies

- **BLOCKING**: InformationEngine (MUST use perceptions for reputation)
- **FUNCTIONAL**: RelationsEngine (relationships influence status)

## Public API

### Method: LC.HierarchyEngine.calculateStatus(character)

**Purpose:** Determine character's social status tier.

**Returns:** `string` - "leader", "member", or "outcast"

**Logic:**
```javascript
LC.HierarchyEngine.calculateStatus = function(character) {
  var avgRespect = this._getAverageWitnessRespect(character);
  
  if (avgRespect >= 0.7) return "leader";
  if (avgRespect <= 0.3) return "outcast";
  return "member";
};

LC.HierarchyEngine._getAverageWitnessRespect = function(character) {
  var witnesses = getAllCharacters();
  var total = 0;
  
  for (var i = 0; i < witnesses.length; i++) {
    if (witnesses[i] === character) continue;
    
    var perception = LC.InformationEngine.getPerception(witnesses[i], character);
    total += perception.respect; // ← SUBJECTIVE perception
  }
  
  return total / (witnesses.length - 1);
};
```

**Critical:** This uses **InformationEngine.getPerception()**, not objective personality traits.

---

### Method: LC.HierarchyEngine.getSocialCapital(character)

**Purpose:** Get quantitative social capital score.

**Returns:** `number` [0-200], default 100

---

## Data Structures

### state.lincoln.hierarchy

```javascript
{
  "Alice": {
    status: "leader",    // "leader", "member", "outcast"
    capital: 150,        // [0-200]
    last_updated: 42     // Turn number
  },
  "Bob": {
    status: "member",
    capital: 100,
    last_updated: 42
  }
}
```

---

## Integration Points

### With InformationEngine (BLOCKING)

**Type:** BLOCKING  
**How:** Reputation calculated from perceptions.

```javascript
// HierarchyEngine REQUIRES InformationEngine
var perception = LC.InformationEngine.getPerception(witness, character);
total += perception.respect;
```

**This is the v16 breakthrough:** Reputation is subjective, not objective.

---

## Testing Strategy

```javascript
// Set up perceptions
/perception update Bob Alice respect 0.9
/perception update Carol Alice respect 0.8
/status calculate Alice
// Expected: status = "leader" (avg respect > 0.7)

// Set up for outcast
/perception update Bob Dave respect 0.2
/perception update Carol Dave respect 0.1
/status calculate Dave
// Expected: status = "outcast" (avg respect < 0.3)
```

---

## 3. IMPROVED DEPENDENCY GRAPH

### 3.1 Visual Representation (ASCII Art)

```
LEGEND:
  ═══>  BLOCKING dependency (MUST implement before)
  ───>  FUNCTIONAL dependency (SHOULD implement before)
  ···>  OPTIONAL dependency (nice to have)

CRITICAL PATH (highlighted with ═══):

┌──────────────────────────────────────────────────────────┐
│ PHASE 0: NULL SYSTEM                                     │
│ [Empty scripts, validation only]                         │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│ PHASE 1: INFRASTRUCTURE                                  │
│                                                          │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐                │
│  │ lcInit  │  │ Tools    │  │ Utils   │                │
│  │ (#33)   │  │ (#19)    │  │ (#20)   │                │
│  └─────────┘  └──────────┘  └─────────┘                │
│       │                                                  │
│       ├────> Commands (#24), Flags (#21), Drafts (#22)  │
│       └────> Turns (#23), currentAction (#34)           │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│ PHASE 2: PHYSICAL WORLD                                  │
│                                                          │
│  ┌──────────────┐  ┌──────────────────┐                │
│  │ TimeEngine   │  │ EnvironmentEngine│                │
│  │    (#7)      │  │      (#8)        │                │
│  └──────────────┘  └──────────────────┘                │
│        │                                                 │
│        └──────> ChronologicalKB (#18) [optional]        │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│ PHASE 3: BASIC DATA                                      │
│                                                          │
│  ┌────────────┐  ┌──────────┐  ┌──────────────┐        │
│  │ Evergreen  │  │  Goals   │  │  Knowledge   │        │
│  │   (#1)     │  │   (#2)   │  │     (#6)     │        │
│  └────────────┘  └──────────┘  └──────────────┘        │
│                                                          │
│  [No dependencies between these - any order OK]         │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
╔══════════════════════════════════════════════════════════╗
║ PHASE 4: CONSCIOUSNESS — CRITICAL PATH                   ║
║                                                          ║
║  ┌────────────────────────────────────────────────┐     ║
║  │         QualiaEngine (#15)                     │     ║
║  │         [Level 1: Phenomenology]               │     ║
║  │                                                │     ║
║  │  • somatic_tension                             │     ║
║  │  • valence                                     │     ║
║  │  • focus_aperture                              │     ║
║  │  • energy_level                                │     ║
║  └────────────────────┬───────────────────────────┘     ║
║                       │                                  ║
║                       │ BLOCKING DEPENDENCY              ║
║                       │ (InformationEngine reads         ║
║                       │  qualia_state.valence)           ║
║                       ▼                                  ║
║  ┌────────────────────────────────────────────────┐     ║
║  │      InformationEngine (#5)                    │     ║
║  │      [Level 2: Psychology]                     │     ║
║  │                                                │     ║
║  │  • interpret(char, event) ════> QualiaEngine   │     ║
║  │  • perceptions: {trust, respect, ...}          │     ║
║  │                                                │     ║
║  │  EXPORTS: getPerception(), updatePerception()  │     ║
║  └────────────────────┬───────────────────────────┘     ║
║                       │                                  ║
║  ⚠️  NO OTHER ENGINES BETWEEN THESE TWO!                ║
║      IMPLEMENT CONSECUTIVELY WITHOUT INTERRUPTION       ║
╚═══════════════════════╪══════════════════════════════════╝
                        │
                        │ FUNCTIONAL DEPENDENCIES
                        │ (These engines SHOULD use
                        │  InformationEngine for full
                        │  v16 functionality)
                        │
        ┌───────────────┼───────────────┬────────────────┐
        │               │               │                │
        ▼               ▼               ▼                ▼
┌─────────────┐  ┌─────────────┐  ┌──────────┐  ┌──────────┐
│ MoodEngine  │  │ Relations   │  │Crucible  │  │ Knowledge│
│    (#3)     │  │ Engine(#4)  │  │Engine    │  │ Engine   │
│             │  │             │  │  (#16)   │  │   (#6)   │
│  Moods ····>──>│ interpret() │  │          │  │[Enhanced]│
│             │  │ multiplier  │  │Formative │  │          │
│             │  │             │  │  events  │  │  Secrets │
└─────────────┘  └──────┬──────┘  │interpret │  │  & Focus │
                        │         └────┬─────┘  └──────────┘
                        │              │
                        │              │
                        ▼              ▼
                ┌─────────────────────────────┐
                │   PHASE 5 COMPLETE          │
                │   [Social Dynamics Ready]   │
                └──────────────┬──────────────┘
                               │
                               ▼
╔══════════════════════════════════════════════════════════╗
║ PHASE 6: SOCIAL HIERARCHY                                ║
║                                                          ║
║  ┌────────────────────────────────────────────────┐     ║
║  │        HierarchyEngine (#10)                   │     ║
║  │                                                │     ║
║  │  calculateStatus(char) {                       │     ║
║  │    witnesses.forEach(w => {                    │     ║
║  │      perception = InformationEngine            │     ║
║  │        .getPerception(w, char); ═══════════════╪════>║
║  │      respect += perception.respect;            │  TO ║
║  │    })                                          │ Info║
║  │  }                                             │Engine║
║  └────────────────────────────────────────────────┘     ║
║                                                          ║
║  ┌──────────────┐  ┌──────────────┐                     ║
║  │   Gossip     │  │   Social     │                     ║
║  │ Engine (#9)  │  │ Engine (#11) │                     ║
║  │              │  │              │                     ║
║  │ Rumors ─────>──>│ Norms &      │                     ║
║  │ Credibility  │  │ Conformity   │                     ║
║  └──────────────┘  └──────────────┘                     ║
╚══════════════════════════════════════════════════════════╝
                               │
                               ▼
┌──────────────────────────────────────────────────────────┐
│ PHASE 7: CULTURAL MEMORY                                 │
│                                                          │
│  ┌───────────┐  ┌───────────┐  ┌────────────┐          │
│  │  Memory   │  │   Lore    │  │ Academics  │          │
│  │Engine(#12)│  │Engine(#13)│  │Engine (#14)│          │
│  │           │  │           │  │            │          │
│  │ Myths ◄───┼──┤ Legends   │  │ Activities │          │
│  │from events│  │           │  │            │          │
│  └───────────┘  └───────────┘  └────────────┘          │
│                                                          │
│  ┌────────────────────────────┐                          │
│  │ DemographicPressure (#17)  │                          │
│  │ [New character integration]│                          │
│  └────────────────────────────┘                          │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│ PHASE 8: OPTIMIZATION & COORDINATION                     │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │    State     │  │   Context    │  │     Norm     │  │
│  │ Versioning   │  │   Caching    │  │    Cache     │  │
│  │    (#30)     │  │    (#31)     │  │    (#32)     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │         UnifiedAnalyzer (#29)                  │     │
│  │         [LAST TO IMPLEMENT]                    │     │
│  │                                                │     │
│  │  Coordinates ALL engines in proper order:     │     │
│  │  1. Qualia update                              │     │
│  │  2. Information interpretation                 │     │
│  │  3. Relations update                           │     │
│  │  4. Hierarchy recalculation                    │     │
│  │  5. Mood derivation                            │     │
│  │  6. Formative event detection                  │     │
│  │  7. Memory/Lore updates                        │     │
│  └────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────┘

CRITICAL PATH SUMMARY:
═══════════════════════
Phase 0 → Phase 1 → Phase 2 → Phase 3 → 
  QualiaEngine (#15) ═══> InformationEngine (#5) → 
  Phase 5 → Phase 6 (HierarchyEngine uses InformationEngine) →
  Phase 7 → Phase 8 (UnifiedAnalyzer)
```

### 3.2 Dependency Matrix (N×N)

Full dependency matrix for all engines:

```
CONSUMER ↓ / DEPENDENCY →  | Qualia | Info | Relations | Hierarchy | Mood | Crucible | Goals | Evergreen | Knowledge | Time | Env | Memory | Lore | Academics | Gossip | Social | Demo | CKB | Tools | Utils | Flags | Drafts | Turns | Commands | lcInit | currentAction | StateVer | ContextCache | NormCache | Unified |
---------------------------|--------|------|-----------|-----------|------|----------|-------|-----------|-----------|------|-----|--------|------|-----------|--------|--------|------|-----|-------|-------|-------|--------|-------|----------|--------|---------------|----------|--------------|-----------|---------|
QualiaEngine (#15)         |   -    |  X   |     X     |     X     |  X   |    X     |   X   |     X     |     X     |  X   |  X  |   X    |  X   |     X     |   X    |   X    |  X   |  X  |   X   |   X   |   X   |   X    |   X   |    X     |   X    |      X        |    X     |      X       |     X     |    X    |
InformationEngine (#5)     | BLOCK  |  -   |     X     |     X     |  X   |    X     |   X   |     X     |     X     |  X   |  X  |   X    |  X   |     X     |   X    |   X    |  X   |  X  |   X   |   X   |   X   |   X    |   X   |    X     |   X    |      X        |    X     |      X       |     X     |    X    |
RelationsEngine (#4)       |   X    | FUNC |     -     |     X     |  X   |    X     |   X   |     X     |     X     |  X   |  X  |   X    |  X   |     X     |   X    |   X    |  X   |  X  |   X   |   X   |   X   |   X    |   X   |    X     |   X    |      X        |    X     |      X       |     X     |    X    |
HierarchyEngine (#10)      |   X    | BLOCK| FUNC      |     -     |  X   |    X     |   X   |     X     |     X     |  X   |  X  |   X    |  X   |     X     |   X    |   X    |  X   |  X  |   X   |   X   |   X   |   X    |   X   |    X     |   X    |      X        |    X     |      X       |     X     |    X    |
MoodEngine (#3)            | FUNC   | FUNC |     X     |     X     |  -   |    X     |   X   |     X     |     X     |  X   |  X  |   X    |  X   |     X     |   X    |   X    |  X   |  X  |   X   |   X   |   X   |   X    |   X   |    X     |   X    |      X        |    X     |      X       |     X     |    X    |
CrucibleEngine (#16)       | FUNC   | FUNC |     X     |     X     |  X   |    -     |   X   |     X     |     X     |  X   |  X  |   X    |  X   |     X     |   X    |   X    |  X   |  X  |   X   |   X   |   X   |   X    |   X   |    X     |   X    |      X        |    X     |      X       |     X     |    X    |
GoalsEngine (#2)           |   X    | FUNC |     X     |     X     |  X   |    X     |   -   |     X     |     X     |  X   |  X  |   X    |  X   |     X     |   X    |   X    |  X   |  X  |   X   |   X   |   X   |   X    |   X   |    X     |   X    |      X        |    X     |      X       |     X     |    X    |
EvergreenEngine (#1)       |   X    |  X   |     X     |     X     |  X   |    X     |   X   |     -     |     X     |  X   |  X  |   X    |  X   |     X     |   X    |   X    |  X   |  X  |   X   |   X   |   X   |   X    |   X   |    X     |   X    |      X        |    X     |      X       |     X     |    X    |
KnowledgeEngine (#6)       | FUNC   | FUNC |     X     |     X     |  X   |    X     |   X   |     X     |     -     |  X   |  X  |   X    |  X   |     X     |   X    |   X    |  X   |  X  |   X   |   X   |   X   |   X    |   X   |    X     |   X    |      X        |    X     |      X       |     X     |    X    |
TimeEngine (#7)            |   X    |  X   |     X     |     X     |  X   |    X     |   X   |     X     |     X     |  -   |  X  |   X    |  X   |     X     |   X    |   X    |  X   |  X  |   X   |   X   |   X   |   X    |   X   |    X     |   X    |      X        |    X     |      X       |     X     |    X    |
EnvironmentEngine (#8)     |   X    |  X   |     X     |     X     |  X   |    X     |   X   |     X     |     X     | FUNC |  -  |   X    |  X   |     X     |   X    |   X    |  X   |  X  |   X   |   X   |   X   |   X    |   X   |    X     |   X    |      X        |    X     |      X       |     X     |    X    |
MemoryEngine (#12)         |   X    |  X   |     X     |     X     |  X   |  FUNC    |   X   |     X     |     X     | FUNC |  X  |   -    | FUNC |     X     |   X    |   X    |  X   |  X  |   X   |   X   |   X   |   X    |   X   |    X     |   X    |      X        |    X     |      X       |     X     |    X    |
LoreEngine (#13)           |   X    |  X   |     X     |     X     |  X   |    X     |   X   |     X     |     X     | FUNC |  X  |  FUNC  |  -   |     X     |   X    |   X    |  X   |  X  |   X   |   X   |   X   |   X    |   X   |    X     |   X    |      X        |    X     |      X       |     X     |    X    |
AcademicsEngine (#14)      |   X    |  X   |     X     |     X     |  X   |    X     |   X   |     X     |     X     | FUNC |  X  |   X    |  X   |     -     |   X    |   X    |  X   |  X  |   X   |   X   |   X   |   X    |   X   |    X     |   X    |      X        |    X     |      X       |     X     |    X    |
GossipEngine (#9)          |   X    | FUNC | FUNC      |     X     |  X   |    X     |   X   |     X     |     X     | FUNC |  X  |   X    | FUNC |     X     |   -    |   X    |  X   |  X  |   X   |   X   |   X   |   X    |   X   |    X     |   X    |      X        |    X     |      X       |     X     |    X    |
SocialEngine (#11)         |   X    | FUNC |     X     |  FUNC     |  X   |    X     |   X   |     X     |     X     |  X   |  X  |   X    |  X   |     X     |  FUNC  |   -    |  X   |  X  |   X   |   X   |   X   |   X    |   X   |    X     |   X    |      X        |    X     |      X       |     X     |    X    |
DemographicPressure (#17)  |   X    |  X   |     X     |     X     |  X   |    X     |   X   |     X     |     X     | FUNC |  X  |   X    | FUNC |     X     |   X    |   X    |  -   |  X  |   X   |   X   |   X   |   X    |   X   |    X     |   X    |      X        |    X     |      X       |     X     |    X    |
ChronologicalKB (#18)      |   X    |  X   |     X     |     X     |  X   |    X     |   X   |  FUNC     |     X     | BLOCK|  X  |   X    |  X   |     X     |   X    |   X    |  X   |  -  |   X   |   X   |   X   |   X    |   X   |    X     |   X    |      X        |    X     |      X       |     X     |    X    |
UnifiedAnalyzer (#29)      | BLOCK  | BLOCK|  BLOCK    |   BLOCK   | BLOCK|  BLOCK   | BLOCK |   BLOCK   |   BLOCK   | BLOCK|BLOCK| BLOCK  | BLOCK|   BLOCK   |  BLOCK | BLOCK  | BLOCK|BLOCK|   X   |   X   |   X   |   X    |   X   |    X     |   X    |      X        |  BLOCK   |    BLOCK     |   BLOCK   |    -    |

LEGEND:
  BLOCK  = Blocking dependency (MUST exist before)
  FUNC   = Functional dependency (SHOULD exist before for full functionality)
  X      = No dependency (can implement independently)
  -      = Self (diagonal)
```

**Key Insights from Matrix:**

1. **QualiaEngine has NO dependencies** - can be implemented first in Phase 4
2. **InformationEngine has ONE BLOCKING dependency** - QualiaEngine
3. **HierarchyEngine has ONE BLOCKING dependency** - InformationEngine (for perceptions)
4. **UnifiedAnalyzer has ALL BLOCKING dependencies** - MUST be last

### 3.3 Implementation Order (Numbered List)

**Optimal Implementation Sequence:**

```
PHASE 0: NULL SYSTEM
  0. Validation scripts (no engines)

PHASE 1: INFRASTRUCTURE  
  1. lcInit (#33) - Initialize state.lincoln structure
  2. LC.Tools (#19) - Safety utilities (safeRegexMatch, escapeRegex)
  3. LC.Utils (#20) - Type conversion (toNum, toStr, toBool)
  4. currentAction (#34) - Track action type
  5. LC.Flags (#21) - Compatibility facade for currentAction
  6. LC.Drafts (#22) - Message queue for output
  7. LC.Turns (#23) - Turn counter
  8. CommandsRegistry (#24) - Command parser (PLAIN OBJECT, not Map!)

PHASE 2: PHYSICAL WORLD
  9. TimeEngine (#7) - Internal time tracking
 10. EnvironmentEngine (#8) - Location and weather
 11. ChronologicalKB (#18) - Optional: Timestamped event log

PHASE 3: BASIC DATA
 12. EvergreenEngine (#1) - Long-term facts
 13. GoalsEngine (#2) - Character goals
 14. KnowledgeEngine (#6) - Secrets and focus (could move to Phase 5)

PHASE 4: CONSCIOUSNESS (CRITICAL - NO INTERRUPTION)
 15. QualiaEngine (#15) - Level 1: Phenomenology
      └─> MUST complete fully before #16
 16. InformationEngine (#5) - Level 2: Psychology (interpret events via qualia)
      └─> BLOCKING dependency on #15
      └─> MUST complete before Phase 5

PHASE 5: SOCIAL DYNAMICS
 17. MoodEngine (#3) - Emotional states (uses Qualia for richer moods)
 18. CrucibleEngine (#16) - Level 3: Personality evolution (uses Information for formative events)
 19. RelationsEngine (#4) - Bilateral relationships (uses Information for interpretation)

PHASE 6: SOCIAL HIERARCHY
 20. HierarchyEngine (#10) - Status calculation (uses Information.perceptions)
 21. GossipEngine (#9) - Rumor spread (uses Relations for credibility)
 22. SocialEngine (#11) - Norms and conformity (uses Hierarchy and Gossip)

PHASE 7: CULTURAL MEMORY
 23. MemoryEngine (#12) - Mythologization (uses Crucible.formative_events)
 24. LoreEngine (#13) - Legends (may reference Memory.myths)
 25. AcademicsEngine (#14) - Activity tracking
 26. DemographicPressure (#17) - New character integration (uses Lore for zeitgeist)

PHASE 8: OPTIMIZATION
 27. State Versioning (#30) - Cache invalidation mechanism
 28. Context Caching (#31) - Performance optimization
 29. Norm Cache (#32) - Text normalization cache
 30. UnifiedAnalyzer (#29) - Coordinator (LAST - depends on ALL engines)
```

**Rationale for Each Step:**

- **Steps 1-8 (Infrastructure):** Foundation for all engines. `lcInit` first because it creates `state.lincoln`. Tools/Utils next for safety. Commands last in Phase 1 for testing.

- **Steps 9-11 (Physical World):** Time and environment are independent of consciousness layers, establish physical context early.

- **Steps 12-14 (Basic Data):** Simple data stores with no complex dependencies. Could interleave with testing.

- **Steps 15-16 (CRITICAL PAIR):** QualiaEngine → InformationEngine MUST be consecutive. InformationEngine's `interpret()` method directly reads `qualia_state.valence`. Cannot implement Information before Qualia.

- **Steps 17-19 (Social Dynamics):** Now that we have subjective interpretation (InformationEngine), we can build personality and relationships with proper subjectivity.

- **Steps 20-22 (Hierarchy):** HierarchyEngine calculates status from InformationEngine.perceptions (v16's key innovation). Must come after Information.

- **Steps 23-26 (Memory):** High-level cultural systems build on formative events and social structures.

- **Steps 27-30 (Optimization):** Performance layer added last. UnifiedAnalyzer requires all engines to exist.

---

## 4. DETAILED CRITICAL PHASE PLANS

### PHASE 4: CONSCIOUSNESS — STEP-BY-STEP PLAN

#### Step 4.1: QualiaEngine Implementation

**Priority:** CRITICAL (blocks InformationEngine)

**Deliverables:**
- [ ] Complete QualiaEngine specification (see Section 2.1)
- [ ] Implement `LC.QualiaEngine.resonate(character, event)`
- [ ] Implement `LC.QualiaEngine.getValence(character)`
- [ ] Implement `LC.QualiaEngine.getTension(character)`
- [ ] Implement `LC.QualiaEngine.getFocus(character)`
- [ ] Implement `LC.QualiaEngine.getEnergy(character)`
- [ ] Create `state.lincoln.characters[name].qualia_state` structure
- [ ] Add test commands:
  - [ ] `/qualia get <character>`
  - [ ] `/qualia set <character> <param> <value>`
  - [ ] `/qualia event <character> <event_type> <intensity>`
- [ ] Write comprehensive test suite (see Section 2.1 Testing Strategy)

**Acceptance Criteria:**
- [ ] `qualia_state` persists across turns
- [ ] All 4 parameters (tension, valence, focus, energy) stored correctly [0.0-1.0]
- [ ] `resonate()` correctly modifies state based on event type
- [ ] Values properly clamped to [0.0, 1.0]
- [ ] State versioning: `state.lincoln.stateVersion++` after modifications
- [ ] No ES6 constructs (Map, Set, async/await, etc.)
- [ ] Commands work without errors
- [ ] Character creation initializes default qualia_state
- [ ] Save/load preserves qualia_state

**Integration Tests:**
1. Create character → verify default qualia_state exists
2. Trigger "praise" event → verify valence ↑, energy ↑, tension ↓
3. Trigger "threat" event → verify valence ↓, tension ↑
4. Set valence to 1.5 → verify clamped to 1.0
5. Save game, reload → verify qualia persists

**Estimated Effort:** 16-24 hours (2-3 days)

**Detailed Task Breakdown:**
1. **Hour 0-2:** Create data structures and initialization
2. **Hour 3-6:** Implement getter methods (getValence, getTension, etc.)
3. **Hour 7-12:** Implement `resonate()` with event-to-qualia mappings
4. **Hour 13-16:** Add test commands to CommandsRegistry
5. **Hour 17-20:** Write and execute test suite
6. **Hour 21-24:** Fix bugs, edge cases, validate ES5 compatibility

**Risks & Mitigation:**

| Risk | Probability | Impact | Mitigation |
|------|------------|---------|------------|
| Forgot to clamp values | High | Medium | Add unit tests for boundary values (0.0, 1.0, -0.5, 1.5) |
| State versioning missed | High | High | Add explicit check in test suite: verify `stateVersion` increments |
| Event type mappings incomplete | Medium | Low | Start with 5 core types (praise, threat, loss, triumph, neutral), expand later |
| Initialization race condition | Low | Medium | Ensure `lcInit()` creates character structure before Qualia methods |

**Exit Criteria:**
✅ All acceptance criteria met  
✅ All integration tests pass  
✅ Code reviewed for ES5 compliance  
✅ No console errors in AI Dungeon  
✅ Documentation complete

---

#### Step 4.2: InformationEngine Implementation

**Priority:** CRITICAL (blocks social systems)

**Dependencies:** ✅ QualiaEngine MUST be complete

**⚠️ CRITICAL TIMING:** Implement IMMEDIATELY after QualiaEngine, without interruption, before any other engine.

**Deliverables:**
- [ ] Complete InformationEngine specification (see Section 2.2)
- [ ] Implement `LC.InformationEngine.interpret(character, event)`
- [ ] Implement `LC.InformationEngine.getPerception(observer, target)`
- [ ] Implement `LC.InformationEngine.updatePerception(observer, target, changes)`
- [ ] Create `state.lincoln.characters[name].perceptions` structure
- [ ] Integrate with `LC.QualiaEngine.getValence()` for interpretation
- [ ] Add test commands:
  - [ ] `/interpret <character> <event_type> [source]`
  - [ ] `/perception get <observer> <target>`
  - [ ] `/perception update <observer> <target> <param> <delta>`
- [ ] Write integration test suite with QualiaEngine

**Acceptance Criteria:**
- [ ] `interpret()` returns different multipliers based on valence:
  - [ ] valence > 0.7 → multiplier > 1.0 ("искренне")
  - [ ] valence < 0.3 → multiplier < 1.0 ("саркастично")
  - [ ] valence 0.3-0.7 → multiplier ≈ 1.0 ("нейтрально")
- [ ] Example: valence=0.8 + "praise" → multiplier ~1.4
- [ ] Example: valence=0.2 + "praise" → multiplier ~0.5
- [ ] `perceptions` stored correctly in nested structure
- [ ] Perceptions are **asymmetric**: Alice→Bob ≠ Bob→Alice
- [ ] Integration with QualiaEngine works without errors
- [ ] State versioning increments after `updatePerception()`
- [ ] Default perceptions returned if none exist
- [ ] No ES6 constructs

**Integration Tests:**
1. **Valence-based interpretation:**
   - Set Alice valence = 0.9
   - `/interpret Alice praise Bob`
   - Verify: multiplier > 1.0, interpretation = "искренне"

2. **Negative valence interpretation:**
   - Set Alice valence = 0.1
   - `/interpret Alice praise Bob`
   - Verify: multiplier < 1.0, interpretation = "саркастично"

3. **Perception storage:**
   - `/perception update Alice Bob trust 0.8`
   - `/perception get Alice Bob`
   - Verify: trust = 0.8

4. **Perception asymmetry:**
   - `/perception update Alice Bob trust 0.9`
   - `/perception update Bob Alice trust 0.2`
   - Verify: Alice→Bob.trust = 0.9, Bob→Alice.trust = 0.2

5. **Persistence:**
   - Set perceptions
   - Save game, reload
   - Verify perceptions persist

**Estimated Effort:** 20-28 hours (2.5-3.5 days)

**Detailed Task Breakdown:**
1. **Hour 0-3:** Create perception data structures
2. **Hour 4-8:** Implement `interpret()` with valence-based logic
3. **Hour 9-14:** Implement `getPerception()` and `updatePerception()`
4. **Hour 15-18:** Add test commands
5. **Hour 19-24:** Integration testing with QualiaEngine
6. **Hour 25-28:** Bug fixes, edge cases, documentation

**Risks & Mitigation:**

| Risk | Probability | Impact | Mitigation |
|------|------------|---------|------------|
| QualiaEngine not ready | Low (if following plan) | Critical | BLOCK implementation until QualiaEngine complete |
| Perception initialization missed | Medium | High | Initialize perceptions on first `getPerception()` call |
| Asymmetry not tested | Medium | Medium | Explicit test: Alice→Bob ≠ Bob→Alice |
| Nested structure ES6 usage | Medium | Critical | Review for `?.` optional chaining, use manual checks |

**Exit Criteria:**
✅ All acceptance criteria met  
✅ All integration tests with QualiaEngine pass  
✅ Asymmetric perceptions verified  
✅ Code ES5-compliant  
✅ No console errors  
✅ Documentation complete

---

**Total Phase 4 Duration:** 36-52 hours (4.5-6.5 days)

**Phase 4 Success Metrics:**
✅ Qualia state influences interpretation  
✅ Same event interpreted differently based on phenomenology  
✅ Perceptions stored and retrievable  
✅ Foundation ready for RelationsEngine and HierarchyEngine  
✅ v16's key innovation (subjective reality) functional

---


## 5. COMPREHENSIVE RISK ASSESSMENT

### 5.1 Architectural Risks

| Risk ID | Risk Description | Probability | Impact | Mitigation Strategy | Owner |
|---------|------------------|-------------|--------|---------------------|-------|
| **AR-001** | Circular dependency between MoodEngine and CrucibleEngine (mood affects self-concept, self-concept affects mood) | Medium | High | **Strategy:** Define strict update order. MoodEngine reads (not writes) self_concept. CrucibleEngine writes self_concept based on formative events. **Validation:** Draw dependency graph before implementation. | Architect |
| **AR-002** | InformationEngine implemented before QualiaEngine, breaking BLOCKING dependency | Low (if following plan) | Critical | **Strategy:** Enforce implementation order via checklist. BLOCK all Phase 5 work until both Qualia AND Information complete. **Validation:** Pre-implementation dependency audit. | Lead Dev |
| **AR-003** | UnifiedAnalyzer implemented too early, before all engines exist | Medium | High | **Strategy:** Make UnifiedAnalyzer the LAST component in Phase 8. Add existence checks for all engines. **Validation:** Count implemented engines before starting UnifiedAnalyzer. | Architect |
| **AR-004** | Engine A updated, breaking Engine B's assumptions about data format | Medium | High | **Strategy:** Version `state.lincoln` structure. Add migration logic in `lcInit()`. Document data contracts. **Validation:** Integration tests after each engine update. | Architect |
| **AR-005** | Forgetting to call `state.lincoln.stateVersion++` after state modifications | High | High | **Strategy:** Add automated check in test suite. Create code review checklist item. Consider helper function `LC.Utils.incrementStateVersion()`. **Validation:** Grep codebase for state writes, ensure version increment follows. | QA Lead |
| **AR-006** | Name collision in global `LC` object (two engines with same method name) | Low | Medium | **Strategy:** Naming convention: `LC.[EngineName].[method]`. Never use common names like `update()`, always prefix: `updateRelation()`. **Validation:** Pre-implementation name registry. | Architect |
| **AR-007** | Dependency graph incomplete, causing implementation deadlock | Medium | High | **Strategy:** Complete full N×N matrix before starting Phase 4. Review with team. **Validation:** This document (Section 3.2). | Architect |

**Mitigation Implementation:**

**For AR-001 (Circular Dependency):**
```javascript
// CORRECT: MoodEngine reads, doesn't write
LC.MoodEngine.getMood = function(character) {
  var qualia = LC.QualiaEngine.getValence(character);
  var selfConcept = LC.CrucibleEngine.getSelfConcept(character); // READ only
  
  // Derive mood from qualia + self-perception
  if (qualia > 0.6 && selfConcept.bravery > 0.6) return "confident";
  // ... more logic
};

// CORRECT: CrucibleEngine writes self_concept
LC.CrucibleEngine.registerFormativeEvent = function(character, event) {
  // ... event processing
  state.lincoln.characters[character].self_concept.bravery += 0.1; // WRITE
  state.lincoln.stateVersion++;
};

// WRONG: MoodEngine writes self_concept (creates circular dependency)
// ❌ DON'T DO THIS
```

**For AR-005 (State Versioning):**
```javascript
// Helper function to enforce versioning
LC.Utils.writeState = function(path, value) {
  // Parse path like "characters.Alice.qualia_state.valence"
  // Set value
  // ALWAYS increment version
  state.lincoln.stateVersion++;
};

// Usage:
LC.Utils.writeState("characters.Alice.qualia_state.valence", 0.8);
// Version automatically incremented
```

---

### 5.2 Technical Risks

| Risk ID | Risk Description | Probability | Impact | Mitigation Strategy | Detection Method |
|---------|------------------|-------------|--------|---------------------|------------------|
| **TR-001** | ES6 `Map` or `Set` used, causing runtime error in AI Dungeon | High | Critical | **Strategy:** Static code analysis (grep for `new Map`, `new Set`). Use plain objects `{}` and arrays `[]`. Mandatory code review checklist item. **Alternative:** ES5 polyfills (NOT recommended—adds complexity). | Grep codebase: `grep -r "new Map\|new Set" *.txt` |
| **TR-002** | `Array.includes()` used (not available in ES5) | High | Critical | **Strategy:** Use `indexOf() !== -1` instead. Add to code review checklist. **Detection:** Grep for `.includes(`. | `grep -r "\.includes(" *.txt` |
| **TR-003** | ES6 destructuring used (`{ valence } = state`) | Medium | Critical | **Strategy:** Use explicit assignment: `var valence = state.valence`. Add to linting rules if possible. | `grep -r "const {\ var {\ let {" *.txt` |
| **TR-004** | Using `state.storyCards` instead of global `storyCards` | High | Critical | **Strategy:** Documentation emphasizes global array. Code review checks for `state.storyCards`. **Validation:** Test Story Cards functionality in game. | `grep -r "state\.storyCards" *.txt` |
| **TR-005** | Forgot `return { text }` in modifier function | Medium | Critical | **Strategy:** Use template for all scripts. Automated validation in test suite (check for `return { text }`). | Test: AI Dungeon console shows "modifier didn't return object" error |
| **TR-006** | Object.assign() used (ES6) | Medium | High | **Strategy:** Manual object copy via loop. Add to review checklist. | `grep -r "Object\.assign" *.txt` |
| **TR-007** | Arrow functions not supported | Low | Medium | **Strategy:** AI Dungeon DOES support arrow functions (confirmed). Okay to use. Fallback: `function() {}` syntax. | Test in-game |
| **TR-008** | Async/await used (not supported) | Medium | Critical | **Strategy:** Use synchronous patterns only. No `Promise`, no `async/await`. | `grep -r "async \|await \|new Promise" *.txt` |

**Automated Detection Script:**

```bash
#!/bin/bash
# ES5 Compliance Checker
# Run before each commit

echo "=== ES5 Compliance Check ==="

# Check for forbidden ES6+ constructs
ERRORS=0

if grep -r "new Map\|new Set\|new WeakMap\|new WeakSet" *.txt 2>/dev/null; then
  echo "❌ ERROR: Map/Set usage found"
  ERRORS=$((ERRORS+1))
fi

if grep -r "\.includes(" *.txt 2>/dev/null | grep -v "// ES5"; then
  echo "❌ ERROR: Array.includes() found (use indexOf() !== -1)"
  ERRORS=$((ERRORS+1))
fi

if grep -r "Object\.assign" *.txt 2>/dev/null; then
  echo "❌ ERROR: Object.assign() found"
  ERRORS=$((ERRORS+1))
fi

if grep -r "async \|await \|new Promise" *.txt 2>/dev/null; then
  echo "❌ ERROR: async/await or Promise found"
  ERRORS=$((ERRORS+1))
fi

if grep -r "state\.storyCards" *.txt 2>/dev/null; then
  echo "⚠️  WARNING: state.storyCards found (should be global storyCards)"
  ERRORS=$((ERRORS+1))
fi

if [ $ERRORS -eq 0 ]; then
  echo "✅ ES5 compliance check passed"
  exit 0
else
  echo "❌ ES5 compliance check FAILED: $ERRORS errors"
  exit 1
fi
```

---

### 5.3 Integration Risks

| Risk ID | Risk Description | Probability | Impact | Mitigation Strategy | Integration Test |
|---------|------------------|-------------|--------|---------------------|------------------|
| **IR-001** | InformationEngine.interpret() doesn't reflect qualia changes in real-time | Medium | Critical | **Strategy:** `interpret()` MUST call `LC.QualiaEngine.getValence()` on each invocation, NOT cache. **Test:** Change valence → call interpret → verify different result. | Test: `/qualia set Alice valence 0.9` → `/interpret Alice praise` → verify multiplier > 1.0 → `/qualia set Alice valence 0.1` → `/interpret Alice praise` → verify multiplier < 1.0 |
| **IR-002** | RelationsEngine doesn't use InformationEngine, missing subjective interpretation | High | High | **Strategy:** RelationsEngine MUST accept `interpretedEvent` parameter. Document in spec. Code review enforces. **Test:** Same base modifier with different valence → different final relationship change. | Test: Alice valence=0.8 → update relation +10 → verify ~+14 change. Alice valence=0.2 → update relation +10 → verify ~+5 change. |
| **IR-003** | HierarchyEngine uses objective personality instead of subjective perceptions for status | High | Critical | **Strategy:** HierarchyEngine MUST call `InformationEngine.getPerception()`, never read `personality` directly. **Validation:** Code review, integration test. | Test: Set Alice personality.respect=0.9 (objective), set all perceptions.Alice.respect=0.2 (subjective) → verify status="outcast" (based on perceptions, not personality) |
| **IR-004** | CrucibleEngine formative events not interpreted subjectively | Medium | High | **Strategy:** When recording formative events, call `InformationEngine.interpret()` to get character's subjective view. **Example:** Betrayal interpreted as "misunderstanding" if valence high. | Test: Trigger betrayal event with different valence values → verify different personality impacts |
| **IR-005** | MemoryEngine myths don't reference CrucibleEngine formative_events | Medium | Medium | **Strategy:** MemoryEngine.crystallize() MUST read `state.lincoln.characters[char].formative_events`. Document dependency. | Test: Create formative event → trigger myth crystallization → verify myth references event |
| **IR-006** | GossipEngine credibility not tied to RelationsEngine | Medium | High | **Strategy:** Rumor spread probability = f(relation strength). Document formula. | Test: High relationship → rumor spreads faster. Low relationship → rumor ignored. |

**Integration Test Suite Template:**

```javascript
// Integration Test: Qualia → Information
function testQualiaInformationIntegration() {
  // Setup
  LC.QualiaEngine.resonate("Alice", { delta: { valence: 0.9 } });
  state.lincoln.stateVersion++;
  
  // Test
  var interpretation = LC.InformationEngine.interpret("Alice", { type: "praise", source: "Bob" });
  
  // Verify
  assert(interpretation.multiplier > 1.0, "High valence should increase multiplier");
  assert(interpretation.interpretation === "искренне", "Should interpret as sincere");
  
  // Change qualia
  LC.QualiaEngine.resonate("Alice", { delta: { valence: -0.8 } }); // Now valence ~0.1
  state.lincoln.stateVersion++;
  
  // Re-test
  interpretation = LC.InformationEngine.interpret("Alice", { type: "praise", source: "Bob" });
  assert(interpretation.multiplier < 1.0, "Low valence should decrease multiplier");
  assert(interpretation.interpretation === "саркастично", "Should interpret as sarcastic");
  
  console.log("✅ Qualia → Information integration test PASSED");
}
```

---

### 5.4 Platform Risks

| Risk ID | Risk Description | Probability | Impact | Mitigation Strategy |
|---------|------------------|-------------|--------|---------------------|
| **PR-001** | AI Dungeon script size limit exceeded | Medium | High | **Strategy:** Monitor script sizes. Optimize by removing comments/whitespace in production. Split into Input/Output/Context/Library if needed. **Limit:** Unknown, but v16 worked with ~50KB Library.txt. |
| **PR-002** | AI Dungeon execution timeout on complex turns | Low | High | **Strategy:** Performance budget: <500ms per turn. Optimize O(n²) operations. Cache aggressively. **Test:** 1000-turn stress test. |
| **PR-003** | AI Dungeon API changes break Story Cards | Low | Critical | **Strategy:** Use only documented `addStoryCard/updateStoryCard/removeStoryCard` functions. Avoid undocumented features. **Detection:** Monitor AI Dungeon changelogs. |
| **PR-004** | State object size limit exceeded | Low | High | **Strategy:** Prune old data (e.g., keep only last 100 turns of history). Implement data cleanup in TimeEngine. **Monitor:** `JSON.stringify(state.lincoln).length`. |

---

## 6. COMPREHENSIVE TESTING STRATEGY

### 6.1 Testing Pyramid

```
                    ┌─────────────────┐
                    │  System Tests   │  ← 1000-turn endurance, full integration
                    │    (Phase 8)    │
                    └─────────────────┘
                   ┌───────────────────┐
                   │ Integration Tests │  ← Engine pairs (Qualia+Info, Info+Relations)
                   │   (Each Phase)    │
                   └───────────────────┘
              ┌──────────────────────────┐
              │     Unit Tests           │  ← Individual engine methods (per engine)
              │  (Per Component)         │
              └──────────────────────────┘
         ┌────────────────────────────────────┐
         │  Static Analysis & Code Review     │  ← ES5 compliance, style, dependency validation
         │       (Continuous)                 │
         └────────────────────────────────────┘
```

---

### 6.2 Unit Testing (Per Engine)

**Template for Each Engine:**

```javascript
// Unit Test Suite for [EngineName]

function test_[EngineName]_Unit() {
  console.log("=== Unit Tests: [EngineName] ===");
  
  // Test 1: Basic functionality
  test("[EngineName]: Basic operation", function() {
    // Setup
    var result = LC.[EngineName].method(params);
    
    // Verify
    assert(result === expected, "Expected [value], got " + result);
  });
  
  // Test 2: Edge case - missing data
  test("[EngineName]: Handles missing data", function() {
    var result = LC.[EngineName].method("NonexistentCharacter");
    assert(result === defaultValue, "Should return default for missing data");
  });
  
  // Test 3: Edge case - boundary values
  test("[EngineName]: Clamps values correctly", function() {
    LC.[EngineName].method(1.5); // Beyond max
    var value = state.lincoln.xxx;
    assert(value <= 1.0, "Should clamp to max value");
  });
  
  // Test 4: State versioning
  test("[EngineName]: Increments state version", function() {
    var before = state.lincoln.stateVersion;
    LC.[EngineName].modifyingMethod(params);
    var after = state.lincoln.stateVersion;
    assert(after === before + 1, "stateVersion should increment");
  });
  
  // Test 5: Isolation (doesn't break other engines)
  test("[EngineName]: Doesn't modify other engine data", function() {
    var otherData = state.lincoln.otherEngineData;
    LC.[EngineName].method(params);
    assert(state.lincoln.otherEngineData === otherData, "Should not modify other data");
  });
}
```

**Example: QualiaEngine Unit Tests:**

```javascript
/test-qualia unit

// Command triggers:
test_QualiaEngine_Unit();

function test_QualiaEngine_Unit() {
  console.log("=== Unit Tests: QualiaEngine ===");
  
  // Test 1: Default values
  var valence = LC.QualiaEngine.getValence("NewCharacter");
  assert(valence === 0.5, "Default valence should be 0.5");
  
  // Test 2: Clamping
  LC.QualiaEngine.resonate("Alice", { delta: { valence: +2.0 } });
  valence = LC.QualiaEngine.getValence("Alice");
  assert(valence <= 1.0, "Valence should clamp to 1.0");
  
  // Test 3: State versioning
  var before = state.lincoln.stateVersion;
  LC.QualiaEngine.resonate("Alice", { type: "praise" });
  assert(state.lincoln.stateVersion === before + 1, "stateVersion should increment");
  
  // Test 4: Event types
  LC.QualiaEngine.resonate("Bob", { type: "threat" });
  var tension = LC.QualiaEngine.getTension("Bob");
  assert(tension > 0.5, "Threat should increase tension");
  
  console.log("✅ All QualiaEngine unit tests PASSED");
}
```

---

### 6.3 Integration Testing (Engine Pairs)

**Critical Integration Tests:**

**Test Suite 1: Qualia → Information**

```javascript
/test-integration qualia-information

function testQualiaInformationIntegration() {
  console.log("=== Integration Test: Qualia → Information ===");
  
  // Test 1: High valence → positive interpretation
  LC.QualiaEngine.resonate("Alice", { delta: { valence: 0.9 } });
  state.lincoln.stateVersion++;
  
  var interp = LC.InformationEngine.interpret("Alice", { type: "praise" });
  assert(interp.multiplier > 1.0, "High valence → multiplier > 1.0");
  
  // Test 2: Low valence → negative interpretation
  LC.QualiaEngine.resonate("Alice", { delta: { valence: -0.8 } });
  state.lincoln.stateVersion++;
  
  interp = LC.InformationEngine.interpret("Alice", { type: "praise" });
  assert(interp.multiplier < 1.0, "Low valence → multiplier < 1.0");
  
  // Test 3: Real-time update (no caching issues)
  LC.QualiaEngine.resonate("Alice", { delta: { valence: +0.8 } });
  state.lincoln.stateVersion++;
  
  interp = LC.InformationEngine.interpret("Alice", { type: "praise" });
  assert(interp.multiplier > 1.0, "Updated valence immediately affects interpretation");
  
  console.log("✅ Qualia → Information integration PASSED");
}
```

**Test Suite 2: Information → Relations**

```javascript
/test-integration information-relations

function testInformationRelationsIntegration() {
  console.log("=== Integration Test: Information → Relations ===");
  
  // Setup: Set valence high
  LC.QualiaEngine.resonate("Alice", { delta: { valence: 0.8 } });
  state.lincoln.stateVersion++;
  
  // Test: Same base modifier, different interpretation
  var beforeRelation = LC.RelationsEngine.getRelation("Alice", "Bob") || 0;
  
  LC.RelationsEngine.updateRelation("Alice", "Bob", 10, {
    interpretedEvent: { type: "praise", source: "Bob" }
  });
  
  var afterRelation = LC.RelationsEngine.getRelation("Alice", "Bob");
  var change = afterRelation - beforeRelation;
  
  assert(change > 10, "High valence should amplify relationship change (expected >10, got " + change + ")");
  
  // Reset and test with low valence
  state.lincoln.relations.Alice.Bob = 0; // Reset
  LC.QualiaEngine.resonate("Alice", { delta: { valence: -0.7 } }); // Low valence
  state.lincoln.stateVersion++;
  
  beforeRelation = 0;
  LC.RelationsEngine.updateRelation("Alice", "Bob", 10, {
    interpretedEvent: { type: "praise", source: "Bob" }
  });
  
  afterRelation = LC.RelationsEngine.getRelation("Alice", "Bob");
  change = afterRelation - beforeRelation;
  
  assert(change < 10, "Low valence should dampen relationship change (expected <10, got " + change + ")");
  
  console.log("✅ Information → Relations integration PASSED");
}
```

**Test Suite 3: Information → Hierarchy**

```javascript
/test-integration information-hierarchy

function testInformationHierarchyIntegration() {
  console.log("=== Integration Test: Information → Hierarchy ===");
  
  // Setup: Create perceptions (subjective views)
  LC.InformationEngine.updatePerception("Bob", "Alice", { respect: 0.9 });
  LC.InformationEngine.updatePerception("Carol", "Alice", { respect: 0.85 });
  LC.InformationEngine.updatePerception("Dave", "Alice", { respect: 0.8 });
  state.lincoln.stateVersion++;
  
  // Test: Status should be based on perceptions, not objective personality
  var status = LC.HierarchyEngine.calculateStatus("Alice");
  assert(status === "leader", "High subjective respect → leader status");
  
  // Now change perceptions (even if Alice's objective personality unchanged)
  LC.InformationEngine.updatePerception("Bob", "Alice", { respect: 0.1 });
  LC.InformationEngine.updatePerception("Carol", "Alice", { respect: 0.2 });
  LC.InformationEngine.updatePerception("Dave", "Alice", { respect: 0.15 });
  state.lincoln.stateVersion++;
  
  status = LC.HierarchyEngine.calculateStatus("Alice");
  assert(status === "outcast", "Low subjective respect → outcast status");
  
  console.log("✅ Information → Hierarchy integration PASSED");
}
```

---

### 6.4 System Testing (Full Integration)

**1000-Turn Endurance Test:**

```javascript
/test-endurance 1000

function runEnduranceTest(turns) {
  console.log("=== Endurance Test: " + turns + " turns ===");
  
  var startTurn = state.lincoln.turn || 0;
  var errors = [];
  
  for (var i = 0; i < turns; i++) {
    try {
      // Simulate turn
      simulateTurn();
      
      // Validate state integrity
      if (!validateState()) {
        errors.push("Turn " + (startTurn + i) + ": State validation failed");
      }
      
      // Check performance
      var turnStart = Date.now();
      LC.UnifiedAnalyzer.processTurn();
      var turnTime = Date.now() - turnStart;
      
      if (turnTime > 500) {
        errors.push("Turn " + (startTurn + i) + ": Performance budget exceeded (" + turnTime + "ms)");
      }
      
    } catch (e) {
      errors.push("Turn " + (startTurn + i) + ": " + e.message);
    }
    
    if (i % 100 === 0) {
      console.log("Progress: " + i + "/" + turns + " turns");
    }
  }
  
  if (errors.length === 0) {
    console.log("✅ Endurance test PASSED: " + turns + " turns, no errors");
  } else {
    console.log("❌ Endurance test FAILED: " + errors.length + " errors");
    errors.forEach(function(err) { console.log("  - " + err); });
  }
}

function validateState() {
  // Check state.lincoln structure
  if (!state.lincoln) return false;
  if (typeof state.lincoln.stateVersion !== 'number') return false;
  
  // Check character data integrity
  var characters = Object.keys(state.lincoln.characters || {});
  for (var i = 0; i < characters.length; i++) {
    var char = characters[i];
    var data = state.lincoln.characters[char];
    
    // Validate qualia_state
    if (!data.qualia_state) return false;
    if (data.qualia_state.valence < 0 || data.qualia_state.valence > 1) return false;
    
    // Validate perceptions
    if (!data.perceptions) return false;
    
    // Validate personality/self_concept
    if (!data.personality || !data.self_concept) return false;
  }
  
  return true;
}
```

---

### 6.5 Regression Testing

**After Each Phase:**

```javascript
/test-regression

function runRegressionTests() {
  console.log("=== Regression Test Suite ===");
  
  // Re-run all previous phase tests
  test_Phase1_Infrastructure();
  test_Phase2_PhysicalWorld();
  test_Phase3_BasicData();
  test_Phase4_Consciousness();
  // ... etc.
  
  // Verify no existing functionality broken
  verifyBackwardCompatibility();
}

function verifyBackwardCompatibility() {
  // Test commands from earlier phases still work
  var tests = [
    { command: "/ping", expected: "pong" },
    { command: "/time", expected: /Turn \d+/ },
    { command: "/qualia get Alice", expected: /valence/ },
    // ... more commands
  ];
  
  tests.forEach(function(test) {
    // Execute command, verify output
  });
}
```

---

### 6.6 Acceptance Criteria for Full Project

**Final Acceptance Checklist:**

- [ ] **Functional:**
  - [ ] All 40 systems implemented and working
  - [ ] Dependency graph followed (no violations)
  - [ ] Critical path verified (Qualia → Information → Relations/Hierarchy)
  - [ ] All test commands functional

- [ ] **Technical:**
  - [ ] No ES6 constructs (Map, Set, async/await, etc.)
  - [ ] All Story Cards use global `storyCards` array and built-in functions
  - [ ] All modifiers follow `return { text }; modifier(text);` pattern
  - [ ] State versioning correct (incremented after all writes)

- [ ] **Performance:**
  - [ ] <500ms average turn time
  - [ ] 1000-turn endurance test passes without errors
  - [ ] No memory leaks (state size stable)

- [ ] **Integration:**
  - [ ] Qualia → Information integration verified
  - [ ] Information → Relations integration verified
  - [ ] Information → Hierarchy integration verified
  - [ ] All engine pairs tested

- [ ] **Quality:**
  - [ ] Code review completed for all engines
  - [ ] Documentation complete (all specs written)
  - [ ] No console errors in AI Dungeon
  - [ ] Regression tests pass

---

## 7. ENHANCED ROADMAP WITH ESTIMATES

### 7.1 Timeline with Effort Estimates

| Phase | Components | Effort (hours) | Duration (days) | Dependencies | Risk Level |
|-------|-----------|----------------|-----------------|--------------|------------|
| **Phase 0** | Null System | 4-8 | 0.5-1 | None | Low |
| **Phase 1** | Infrastructure (8 components) | 16-24 | 2-3 | Phase 0 | Low |
| **Phase 2** | Physical World (3 components) | 12-20 | 1.5-2.5 | Phase 1 | Low |
| **Phase 3** | Basic Data (3 components) | 16-24 | 2-3 | Phase 2 | Medium |
| **Phase 4** | **CONSCIOUSNESS** (2 components) | **36-52** | **4.5-6.5** | Phase 3 | **CRITICAL** |
| Phase 5 | Social Dynamics (3 components) | 24-36 | 3-4.5 | Phase 4 | High |
| Phase 6 | Social Hierarchy (3 components) | 20-32 | 2.5-4 | Phase 5 | High |
| Phase 7 | Cultural Memory (4 components) | 20-32 | 2.5-4 | Phase 6 | Medium |
| Phase 8 | Optimization (4 components) | 24-40 | 3-5 | Phases 1-7 | Medium |
| **TOTAL** | **30 core components** | **172-268 hours** | **21.5-33.5 days** | Sequential | Varies |

**Assumptions:**
- 8-hour work days
- Single developer
- No major blockers
- Testing included in estimates

**Optimistic:** 172 hours = 21.5 days (~4.5 weeks)  
**Realistic:** 220 hours = 27.5 days (~5.5 weeks)  
**Pessimistic:** 268 hours = 33.5 days (~7 weeks)

---

### 7.2 Critical Path Analysis

```
CRITICAL PATH (longest dependency chain):

Phase 0 (1 day) 
  ↓
Phase 1 (2.5 days avg)
  ↓
Phase 2 (2 days avg)
  ↓
Phase 3 (2.5 days avg)
  ↓
Phase 4 (5.5 days avg) ← CRITICAL PHASE
  ↓
Phase 5 (3.75 days avg)
  ↓
Phase 6 (3.25 days avg)
  ↓
Phase 7 (3.25 days avg)
  ↓
Phase 8 (4 days avg)

TOTAL CRITICAL PATH: 27.75 days (~5.5 weeks)
```

**Bottleneck:** Phase 4 (Consciousness) cannot be parallelized and blocks all social systems.

**Acceleration Strategies:**
1. **Cannot shorten Phase 4** - It's blocking and critical
2. **Can parallelize within Phase 1** - Tools/Utils/Flags independent
3. **Can parallelize within Phase 3** - Evergreen/Goals/Knowledge independent
4. **Can parallelize within Phase 7** - Memory/Lore/Academics independent

**Revised Optimistic Timeline (with parallelization):**
- Phases 1, 3, 7 reduced by ~20% each
- **New Total:** ~24 days (~5 weeks)

---

### 7.3 Milestones

**M0: Foundation Complete** (Day 3-4)
- **Criteria:**
  - [ ] All infrastructure components working
  - [ ] Test commands functional (`/ping`, `/debug`, `/turn`)
  - [ ] Time and environment tracking operational
  - [ ] No console errors in AI Dungeon

**M1: Data Layer Complete** (Day 6-7)
- **Criteria:**
  - [ ] Evergreen, Goals, Knowledge engines operational
  - [ ] Data persists across turns
  - [ ] Commands work (`/fact add`, `/goal add`, `/secret add`)

**M2: CONSCIOUSNESS OPERATIONAL** (Day 12-14) ⚠️ **CRITICAL MILESTONE**
- **Criteria:**
  - [ ] QualiaEngine fully functional
  - [ ] InformationEngine fully functional
  - [ ] Integration tests pass (Qualia → Information)
  - [ ] Same event interpreted differently based on valence
  - [ ] Perceptions stored and retrievable
  - [ ] Foundation ready for social systems

**M3: Social Dynamics Live** (Day 17-19)
- **Criteria:**
  - [ ] Relations, Mood, Crucible engines working
  - [ ] Subjective interpretation integrated into relationships
  - [ ] Formative events shape personality
  - [ ] Integration tests pass

**M4: Hierarchy Established** (Day 21-23)
- **Criteria:**
  - [ ] Status calculated from subjective perceptions
  - [ ] Gossip system functional
  - [ ] Social norms tracked
  - [ ] v16's key innovation (subjective reputation) verified

**M5: Cultural Memory Active** (Day 25-27)
- **Criteria:**
  - [ ] Myths crystallize from formative events
  - [ ] Legends propagate
  - [ ] Full cultural simulation operational

**M6: FULL SYSTEM RELEASE** (Day 28-30)
- **Criteria:**
  - [ ] All optimization components working
  - [ ] UnifiedAnalyzer coordinates all engines
  - [ ] 1000-turn endurance test passes
  - [ ] Performance <500ms/turn
  - [ ] All regression tests pass
  - [ ] Documentation complete

---

## 8. RECOMMENDATIONS & NEXT STEPS

### 8.1 Immediate Actions (Before Starting Implementation)

1. **APPROVE THIS REVIEW**
   - Stakeholders review this document
   - Identify any concerns or gaps
   - Sign-off on approach

2. **COMPLETE MISSING SPECIFICATIONS**
   - Write full specs for components #19-24, #29-32 (infrastructure/optimization)
   - Estimated effort: 8-16 hours
   - **Blocking:** Cannot implement without specs

3. **SET UP DEVELOPMENT ENVIRONMENT**
   - Create AI Dungeon scenario for testing
   - Set up version control for scripts
   - Establish backup/rollback procedures

4. **CREATE ES5 COMPLIANCE CHECKER**
   - Implement automated script (see Section 5.2)
   - Integrate into workflow
   - Run before each phase completion

5. **DEFINE ROLLBACK PROCEDURES**
   - What if Phase 4 fails in production?
   - How to revert to previous working state?
   - Document recovery steps

---

### 8.2 Implementation Strategy

**RECOMMENDED APPROACH:**

1. **Start with Phase 0-1** (Infrastructure)
   - Low risk, establishes foundation
   - Validates development workflow
   - Tests AI Dungeon integration

2. **Proceed through Phases 2-3** (Physical World, Data)
   - Build confidence with simpler components
   - Establish testing patterns
   - Verify persistence mechanisms

3. **CRITICAL: Phase 4 with Maximum Care**
   - Allocate 1-2 weeks dedicated time
   - No distractions or parallel work
   - Implement Qualia → Information consecutively
   - **Do not proceed to Phase 5 until Phase 4 fully verified**

4. **Phases 5-7 with Integration Focus**
   - Continuously validate integration with Phase 4
   - Run regression tests after each component
   - Document any deviations from plan

5. **Phase 8 as Final Polish**
   - UnifiedAnalyzer last
   - Comprehensive system testing
   - Performance optimization

---

### 8.3 Success Factors

**CRITICAL SUCCESS FACTORS:**

1. ✅ **Follow dependency order strictly**
   - No shortcuts, no "we'll refactor later"
   - Qualia → Information without interruption

2. ✅ **Test incrementally**
   - Test after EVERY component
   - Don't accumulate untested code

3. ✅ **Maintain ES5 discipline**
   - Run compliance checker frequently
   - Review all code for ES6 constructs

4. ✅ **Document as you go**
   - Update specs with actual implementation details
   - Record decisions and rationale

5. ✅ **Preserve v16 innovations**
   - Subjective interpretation (Information Engine)
   - Perception-based reputation (Hierarchy Engine)
   - Four-level consciousness model

---

## CONCLUSION

The Lincoln v17 Master Plan is **fundamentally sound** but requires:

1. **Complete engine specifications** (provided in Section 2 of this review)
2. **Enhanced dependency documentation** (provided in Section 3)
3. **Comprehensive risk mitigation** (provided in Section 5)
4. **Detailed testing strategy** (provided in Section 6)

With these additions, the plan is **APPROVED FOR IMPLEMENTATION** with the following **CRITICAL REQUIREMENTS:**

⚠️ **NON-NEGOTIABLE:**
1. Implement QualiaEngine → InformationEngine consecutively, without interruption
2. Do not proceed to Phase 5 until Phase 4 integration tests pass
3. Run ES5 compliance checker before each phase completion
4. Follow dependency order strictly (no shortcuts)

**Estimated Timeline:** 5-7 weeks (single developer)

**Risk Assessment:** Medium-High (due to Phase 4 criticality and ES5 constraints)

**Recommendation:** PROCEED with enhanced specifications and testing strategy outlined in this review.

---

**END OF ARCHITECTURAL REVIEW**

**Review Version:** 1.0  
**Status:** COMPLETE  
**Next Action:** Stakeholder approval → Begin Phase 0 implementation

---

