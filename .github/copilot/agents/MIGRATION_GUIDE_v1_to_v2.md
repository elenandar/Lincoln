# Migration Guide: lincoln-dev.yml v1 → v2

## Overview

This guide explains the critical changes between lincoln-dev.yml (v17.0.0) and lincoln-dev-v2.yml (v17.0.0-v2), based on corrections discovered in Master Plan v2.0.

**Status:** CRITICAL - v1 contains fundamental errors that will cause runtime failures in AI Dungeon.

**Migration Priority:** IMMEDIATE - All development must use v2 going forward.

---

## Critical Changes Summary

### 1. Library.txt Execution Model - COMPLETELY WRONG in v1

**v1 (INCORRECT):**
```yaml
## 5.1 Initialization Pattern (Library.txt)

var modifier = function(text) {
  // One-time initialization
  if (!state.initialized) {
    state.initialized = true;
    
    // Create shared namespace
    if (!state.shared) state.shared = {};
    
    // Create LC object
    state.shared.LC = {
      // ...
    };
  }
  
  return {text: text};
};
```

**PROBLEMS:**
- ❌ Assumes Library runs "once on game load"
- ❌ Uses `state.shared` which DOESN'T EXIST
- ❌ Uses one-time `if (!state.initialized)` pattern
- ❌ Tries to persist LC object in state

**v2 (CORRECT):**
```javascript
// Library.txt - NO modifier pattern required

// 1. Idempotent initialization (check version, not flag)
if (!state.lincoln || state.lincoln.version !== "17.0.0") {
    state.lincoln = {
        version: "17.0.0",
        // ...
    };
}

// 2. Create LC object EVERY TIME
const LC = {
    VERSION: "17.0.0",
    // ... engines
};

// 3. LC exists in Library scope, available via closure
// NO state.shared - it doesn't exist!
```

**WHY:**
- ✅ Library executes BEFORE EACH hook (3x per turn)
- ✅ LC must be recreated each time
- ✅ state.lincoln persists, LC doesn't
- ✅ Version check prevents re-initialization

**Execution Flow (REALITY):**
```
User types input:
  1. Library.txt executes → creates LC
  2. Input.txt executes → uses LC via closure
  
AI processes context:
  3. Library.txt executes AGAIN → creates LC AGAIN
  4. Context.txt executes → uses LC via closure
  
AI generates output:
  5. Library.txt executes AGAIN → creates LC AGAIN
  6. Output.txt executes → uses LC via closure
```

---

### 2. state.shared - FATAL ERROR in v1

**v1 (INCORRECT):**
```javascript
// Create shared namespace
if (!state.shared) state.shared = {};

// Create LC object
state.shared.LC = {
  // ...
};

// Later access:
var LC = state.shared && state.shared.LC;
```

**PROBLEM:**
- ❌ `state.shared` DOES NOT EXIST in AI Dungeon
- ❌ Will cause runtime error: "Cannot read property 'LC' of undefined"

**v2 (CORRECT):**
```javascript
// In Library.txt
const LC = {
    // ... engines
};

// In Input/Context/Output.txt
const modifier = (text) => {
    // LC available via closure from Library scope
    var result = LC.QualiaEngine.getValence("Alice");
    return {text: text};
};
```

**WHY:**
- ✅ LC exists in Library scope
- ✅ Available to scripts via JavaScript closure
- ✅ No need to persist LC (recreated each time)

---

### 3. ES5 Rules - TOO STRICT in v1

**v1 (INCORRECT):**
```yaml
### ❌ ABSOLUTELY FORBIDDEN (Will break in AI Dungeon):

// Arrow functions
const fn = () => {};           // ❌ FORBIDDEN
var fn = function() {};         // ✅ CORRECT

// Template literals  
`Hello ${name}`;                // ❌ FORBIDDEN
'Hello ' + name;                // ✅ CORRECT

// const/let
const x = 1;                    // ❌ IMPLIED FORBIDDEN
let y = 2;                      // ❌ IMPLIED FORBIDDEN
var z = 3;                      // ✅ CORRECT
```

**PROBLEMS:**
- ❌ Claims arrow functions forbidden (they WORK in AI Dungeon)
- ❌ Claims const/let problematic (they WORK in AI Dungeon)
- ❌ Too conservative - rejects working features

**v2 (CORRECT):**
```yaml
### ✅ ALLOWED (confirmed working):
// Arrow functions
const fn = () => {};                    // ✅ WORKS
const fn = (x) => x * 2;                // ✅ WORKS

// const/let
const x = 5;                            // ✅ WORKS
let y = 10;                             // ✅ WORKS

// Template literals - TEST FIRST
`Hello ${name}`;                        // ⚠️  MAY WORK - test in-game
'Hello ' + name;                        // ✅ GUARANTEED to work
```

**WHY:**
- ✅ AI Dungeon supports SOME ES6 features
- ✅ Arrow functions confirmed working
- ✅ const/let confirmed working
- ✅ Accurate boundaries prevent unnecessary restrictions

**Still FORBIDDEN (will cause errors):**
- ❌ Map/Set/WeakMap
- ❌ Array.includes() / Array.find()
- ❌ Object.assign()
- ❌ async/await/Promise
- ❌ for...of loops
- ❌ Destructuring
- ❌ Spread operator

---

### 4. Initialization Pattern

**v1 (INCORRECT):**
```javascript
// One-time initialization
if (!state.initialized) {
  state.initialized = true;
  
  state.shared.LC = {
    // ...
  };
}
```

**PROBLEMS:**
- ❌ One-time flag approach
- ❌ Doesn't handle version upgrades
- ❌ Uses non-existent state.shared

**v2 (CORRECT):**
```javascript
// Idempotent initialization with version check
if (!state.lincoln || state.lincoln.version !== "17.0.0") {
    state.lincoln = {
        version: "17.0.0",
        stateVersion: 0,
        turn: 0,
        characters: {},
        // ... rest of structure
    };
}
```

**WHY:**
- ✅ Idempotent - safe to run multiple times
- ✅ Version-based - handles upgrades
- ✅ No need for separate initialized flag

---

### 5. CommandsRegistry - Map vs Object

**v1 (INCORRECT):**
```javascript
// Implied Map usage (ES6)
const commandsRegistry = new Map();
commandsRegistry.set('ping', handler);
```

**PROBLEM:**
- ❌ Map is ES6, not available in AI Dungeon
- ❌ Will cause runtime error

**v2 (CORRECT):**
```javascript
// Plain object (ES5 compatible)
LC.CommandsRegistry = {
    commands: {},  // Plain object, NOT Map!
    
    register: function(name, handler) {
        this.commands[name] = handler;
    },
    
    process: function(text) {
        if (!text || !text.startsWith('/')) {
            return { handled: false };
        }
        
        var parts = text.slice(1).split(' ');
        var command = parts[0];
        var args = parts.slice(1);
        
        if (this.commands[command]) {
            var output = this.commands[command](args);
            return { handled: true, output: output || " " };
        }
        
        return { handled: false };
    }
};

// Register commands
LC.CommandsRegistry.register('ping', function(args) {
    return "pong";
});
```

**WHY:**
- ✅ Plain objects work in ES5
- ✅ No runtime errors
- ✅ Same functionality as Map

---

### 6. Empty String Handling

**v1 (INCOMPLETE):**
- Doesn't document empty string rules clearly

**v2 (CORRECT):**
```yaml
## 4.3 Empty String Handling - CRITICAL

**Input Script:**
return { text: "" };              // ❌ ERROR "Unable to run scenario scripts"
return { text: " " };              // ✅ OK, minimal input
return { text: " ", stop: true };  // ✅ OK, stops processing

**Output Script:**
return { text: "" };          // ❌ ERROR "A custom script failed"
return { text: " " };         // ✅ OK, minimal output
return { text: text };        // ✅ OK, normal output
```

**WHY:**
- ✅ AI Dungeon rejects empty strings in Input/Output
- ✅ Must return at least a space " "
- ✅ Prevents cryptic runtime errors

---

## Migration Checklist

When migrating code from v1 to v2 patterns:

### In Library.txt:
- [ ] Remove `var modifier = function(text) { ... }` wrapper
- [ ] Remove `modifier(text);` call at end
- [ ] Remove `if (!state.initialized)` checks
- [ ] Remove ALL `state.shared` references
- [ ] Add version check: `if (!state.lincoln || state.lincoln.version !== "17.0.0")`
- [ ] Change from `var` to `const` for LC object
- [ ] Ensure LC created fresh each time (not persisted)

### In Input/Context/Output.txt:
- [ ] Keep `const modifier = (text) => { ... }` pattern
- [ ] Keep `modifier(text);` call at end
- [ ] Remove `var LC = state.shared && state.shared.LC;`
- [ ] Access LC directly (via closure)
- [ ] Never return empty string "" from Input or Output
- [ ] Use " " (space) instead of ""

### In Engine Implementations:
- [ ] Change `new Map()` to `{}` (plain object)
- [ ] Change `array.includes()` to `array.indexOf() !== -1`
- [ ] Change `array.find()` to manual for loop
- [ ] Change `Object.assign()` to manual copy
- [ ] Remove destructuring `{x, y} = obj`
- [ ] Remove spread operator `...array`
- [ ] Arrow functions OK to use
- [ ] const/let OK to use

### In Command Handlers:
- [ ] Register in `LC.CommandsRegistry.commands` object
- [ ] Use `LC.CommandsRegistry.register(name, handler)`
- [ ] Never return empty string - return " " minimum

---

## Common Pitfalls When Migrating

### Pitfall 1: Forgetting Library Runs 3x Per Turn

**WRONG:**
```javascript
// In Library.txt
var counter = 0;
counter++;  // Will be 3 after one turn!
```

**CORRECT:**
```javascript
// In Library.txt
if (!state.lincoln) state.lincoln = { counter: 0 };

// In Output.txt
const modifier = (text) => {
    var L = LC.lcInit();
    L.counter++;  // Increments once per turn
    L.stateVersion++;
    return {text: text};
};
```

### Pitfall 2: Trying to Persist LC

**WRONG:**
```javascript
state.LC = LC;  // Don't do this!
```

**CORRECT:**
```javascript
// LC exists only in Library scope
// Recreated each time Library runs
// No need to persist it
```

### Pitfall 3: Using state.shared

**WRONG:**
```javascript
state.shared.myData = { ... };
```

**CORRECT:**
```javascript
state.lincoln.myData = { ... };
```

### Pitfall 4: One-time Initialization

**WRONG:**
```javascript
if (!state.initialized) {
    state.initialized = true;
    // ... setup
}
```

**CORRECT:**
```javascript
if (!state.lincoln || state.lincoln.version !== "17.0.0") {
    state.lincoln = {
        version: "17.0.0",
        // ... setup
    };
}
```

---

## Testing Your Migration

After migrating code, test with these commands:

1. **Test Library initialization:**
   ```
   /debug
   ```
   Should return: "Lincoln v17 | Turn: X | Version: Y"

2. **Test command registry:**
   ```
   /ping
   ```
   Should return: "pong"

3. **Test engine access:**
   ```
   /qualia get Alice
   ```
   Should return qualia values, not errors

4. **Check console:**
   - No "undefined" errors
   - No "state.shared" errors
   - No Map/Set errors

---

## Before/After Examples

### Example 1: Library.txt

**BEFORE (v1):**
```javascript
var modifier = function(text) {
  if (!state.initialized) {
    state.initialized = true;
    
    if (!state.shared) state.shared = {};
    
    state.shared.LC = {
      QualiaEngine: {},
      InformationEngine: {}
    };
  }
  
  return {text: text};
};

modifier(text);
```

**AFTER (v2):**
```javascript
// No modifier wrapper in Library!

if (!state.lincoln || state.lincoln.version !== "17.0.0") {
    state.lincoln = {
        version: "17.0.0",
        stateVersion: 0,
        characters: {},
        // ... rest
    };
}

const LC = {
    QualiaEngine: {},
    InformationEngine: {},
    // ... rest
};
```

### Example 2: Input.txt Command Processing

**BEFORE (v1):**
```javascript
var modifier = function(text) {
  var LC = state.shared && state.shared.LC;
  if (!LC) return {text: text};
  
  var L = LC.lcInit();
  var trimmed = text.trim();
  
  if (trimmed.charAt(0) === '/') {
    // ... command processing
  }
  
  return {text: text};
};

modifier(text);
```

**AFTER (v2):**
```javascript
const modifier = (text) => {
  // LC available via closure - no need to check
  var trimmed = text.trim();
  
  if (trimmed.charAt(0) === '/') {
    var result = LC.CommandsRegistry.process(trimmed);
    if (result.handled) {
      return {text: result.output || " ", stop: true};
    }
  }
  
  return {text: text};
};

modifier(text);
```

### Example 3: Engine Implementation

**BEFORE (v1):**
```javascript
// In Library.txt
state.shared.LC.QualiaEngine = {
  resonate: function(character, event) {
    var L = this.lcInit();
    // ... implementation
  }
};
```

**AFTER (v2):**
```javascript
// In Library.txt
LC.QualiaEngine = {
  resonate: function(character, event) {
    var L = LC.lcInit();
    
    if (!L.characters[character]) {
      L.characters[character] = {
        qualia_state: {
          somatic_tension: 0.5,
          valence: 0.5,
          focus_aperture: 0.5,
          energy_level: 0.5
        }
      };
    }
    
    var qualia = L.characters[character].qualia_state;
    
    if (event.type === 'praise') {
      qualia.valence = Math.min(1.0, qualia.valence + 0.1);
    }
    
    L.stateVersion++;
  },
  
  getValence: function(character) {
    var L = LC.lcInit();
    if (!L.characters[character]) return 0.5;
    return L.characters[character].qualia_state.valence;
  }
};
```

---

## FAQ

**Q: Why does Library run 3 times per turn?**
A: AI Dungeon executes Library before EACH hook (Input, Context, Output). This is the platform's architecture, not a choice.

**Q: Why not persist LC in state to avoid recreating it?**
A: Because:
1. It's recreated automatically by Library execution
2. Engines don't store state in themselves - only in state.lincoln
3. Smaller state footprint
4. Follows AI Dungeon's execution model

**Q: Can I use template literals?**
A: Maybe - they might work, but aren't guaranteed. Test in-game first. String concatenation with + is always safe.

**Q: Can I use arrow functions?**
A: Yes! Confirmed working in AI Dungeon. Use them freely.

**Q: What if I need Map/Set functionality?**
A: Use plain objects {} for Map, plain arrays [] for Set. See ES5 patterns in v2 documentation.

**Q: How do I access LC in Input/Context/Output scripts?**
A: LC is available via JavaScript closure from Library scope. Just use it directly - no state.shared needed.

---

## Resources

- **Master Plan v2.0:** `/v17.0/PROJECT_LINCOLN_v17_MASTER_PLAN_v2.md`
- **New Agent:** `.github/copilot/agents/lincoln-dev-v2.yml`
- **Old Agent (deprecated):** `.github/copilot/agents/lincoln-dev.yml`

---

## Timeline

- **v1 created:** Based on incorrect understanding of AI Dungeon
- **Master Plan v2.0 corrections:** October 26, 2025
- **v2 created:** October 26, 2025
- **Migration deadline:** IMMEDIATE - stop using v1 now

---

## Summary

The v1 → v2 migration fixes fundamental architectural errors:

1. ✅ **Correct execution model** - Library runs 3x per turn
2. ✅ **No state.shared** - use closure instead
3. ✅ **Idempotent initialization** - version-based
4. ✅ **Accurate ES5/ES6 boundaries** - arrow functions OK
5. ✅ **Proper patterns** - all examples work in real AI Dungeon

**ACTION REQUIRED:** 
- Use lincoln-dev-v2.yml for all development
- Migrate any existing v1 code to v2 patterns
- Test thoroughly in AI Dungeon after migration
