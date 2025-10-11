# Subjective Reality Engine - Quick Reference

## TL;DR

**Before:** All NPCs see events the same way. Relations are symmetric.  
**After:** Each NPC interprets events through their own phenomenal state. Relations are asymmetric.

**Impact:** Same compliment can be sincere to one character, sarcasm to another.

---

## Quick Start

### 1. Basic Usage (Automatic)

Just use characters normally. The system works automatically:

```javascript
const L = LC.lcInit();
L.aliases = { 'Алекс': ['алекс'], 'Борис': ['борис'] };

// Characters created with perceptions automatically
LC.updateCharacterActivity("Алекс встретил Бориса", false);

// Set different emotional states
L.characters['Алекс'].qualia_state.valence = 0.8;      // Happy
L.characters['Борис'].qualia_state.somatic_tension = 0.9; // Tense

// Text analysis uses subjective interpretation automatically
LC.RelationsEngine.analyze("Алекс хвалит Бориса");

// Result: Asymmetric perceptions
// Алекс → Борис: Sincere, big affection increase
// Борис → Алекс: Suspicious, small affection increase, trust decrease
```

### 2. Check Perceptions

```javascript
// Get Алекс's view of Борис
const alexViewOfBoris = L.characters['Алекс'].perceptions['Борис'];
// → { affection: 60, trust: 50, respect: 55, rivalry: 30 }

// Get Борис's view of Алекс (different!)
const borisViewOfAlex = L.characters['Борис'].perceptions['Алекс'];
// → { affection: 45, trust: 30, respect: 70, rivalry: 50 }

// Using RelationsEngine
const alexToBoris = LC.RelationsEngine.getRelation('Алекс', 'Борис');
const borisToAlex = LC.RelationsEngine.getRelation('Борис', 'Алекс');
```

### 3. Manual Interpretation

```javascript
// Create event
const event = {
  type: 'social',
  action: 'compliment',
  rawModifier: 5
};

// Interpret through character's lens
const char = L.characters['Алекс'];
const interpretation = LC.InformationEngine.interpret(char, event);

console.log(interpretation.interpretation);    // "sincere" or "sarcasm"
console.log(interpretation.subjectiveModifier); // Modified value
console.log(interpretation.trustModifier);      // Trust change (if any)

// Apply interpretation
LC.InformationEngine.updatePerception('Алекс', 'Борис', interpretation);
```

---

## Interpretation Rules Cheat Sheet

| Event | Qualia Condition | Result | Modifier Change |
|-------|------------------|--------|-----------------|
| **Compliment** | valence > 0.7 (happy) | "sincere" | ×1.3 |
| **Compliment** | tension > 0.8 (stressed) | "sarcasm" | ×0.3, trust -5 |
| **Compliment** | neutral | "polite" | ×1.0 |
| **Insult** | tension > 0.7 | "threatening" | ×1.5 |
| **Insult** | valence > 0.7 | "banter" | ×0.4 |
| **Betrayal** | personality.trust > 0.7 | "devastating" | ×1.3 |
| **Betrayal** | personality.trust < 0.3 | "expected" | ×0.9 |
| **Loyalty** | personality.trust < 0.3 | "surprising" | ×1.4 |

---

## Common Patterns

### Pattern 1: Unrequited Feelings

```javascript
// Алекс loves Борис, but Борис is suspicious
L.characters['Алекс'].perceptions['Борис'] = {
  affection: 80, trust: 70, respect: 60, rivalry: 10
};

L.characters['Борис'].perceptions['Алекс'] = {
  affection: 30, trust: 20, respect: 50, rivalry: 40
};

// Narrative: "Алекс keeps trying to befriend Борис, but Борис thinks Алекс wants something"
```

### Pattern 2: Mutual Misunderstanding

```javascript
// Both like each other but think the other doesn't like them
L.characters['Алекс'].perceptions['Борис'] = {
  affection: 70, trust: 40, respect: 60, rivalry: 30
};

L.characters['Борис'].perceptions['Алекс'] = {
  affection: 65, trust: 35, respect: 55, rivalry: 35
};

// Narrative: "Two people who could be friends but each thinks the other is cold"
```

### Pattern 3: Tense Character Arc

```javascript
// Start: Paranoid character
L.characters['Параноик'].qualia_state.somatic_tension = 0.9;
L.characters['Параноик'].qualia_state.valence = 0.2;

// Multiple positive interactions interpreted as suspicious
LC.LivingWorld.runOffScreenCycle({ type: 'ADVANCE_TO_NEXT_MORNING' });

// Later: Character relaxes
L.characters['Параноик'].qualia_state.somatic_tension = 0.3;
L.characters['Параноик'].qualia_state.valence = 0.7;

// Same interactions now interpreted as sincere
// Perceptions gradually improve
```

---

## API Reference

### LC.InformationEngine

#### `interpret(character, event)`
- **Parameters:**
  - `character` - Character object from L.characters
  - `event` - Event object: `{type, action, rawModifier, actor, target}`
- **Returns:** Interpreted event with `interpretation`, `subjectiveModifier`, optional `trustModifier`

#### `updatePerception(perceiver, perceived, interpretation)`
- **Parameters:**
  - `perceiver` - Character name (who's perceiving)
  - `perceived` - Character name (who's being perceived)
  - `interpretation` - Result from `interpret()`
- **Returns:** void (modifies perceiver's perceptions)

### LC.RelationsEngine (Enhanced)

#### `getRelation(char1, char2)`
- Prioritizes `character.perceptions`, falls back to legacy `L.evergreen.relations`
- Returns object: `{affection, trust, respect, rivalry}` or number (legacy)

#### `getVector(char1, char2, vector)`
- Gets specific perception dimension
- `vector` can be: 'affection', 'trust', 'respect', 'rivalry'
- Returns number 0-100

#### `updateRelation(char1, char2, change, options)`
- `change` - number or object with vector changes
- `options.interpretedEvent` - if provided, uses InformationEngine
- `options.usePerceptions` - false to force legacy mode

---

## Backward Compatibility

### Legacy Code Works Unchanged

```javascript
// Old code still works
L.evergreen.relations = {
  'Алекс': { 'Борис': 50 },
  'Борис': { 'Алекс': 50 }
};

LC.RelationsEngine.updateRelation('Алекс', 'Борис', 10);
// → Updates evergreen.relations symmetrically (50 → 60 for both)
```

### Detection Logic

System uses perceptions if:
1. Characters exist in `L.characters`
2. Characters have `qualia_state` or `perceptions` (indicating full characters)
3. `options.usePerceptions` is not explicitly `false`

Otherwise falls back to legacy symmetric relations.

---

## Debugging Tips

### Check Which System is Being Used

```javascript
const char = L.characters['Алекс'];
if (char.perceptions) {
  console.log("Using perceptions system");
} else if (L.evergreen.relations?.['Алекс']) {
  console.log("Using legacy relations");
} else {
  console.log("No relations yet");
}
```

### View All Perceptions

```javascript
const char = L.characters['Алекс'];
for (const otherChar in char.perceptions) {
  console.log(`Алекс → ${otherChar}:`, char.perceptions[otherChar]);
}
```

### Force Legacy Mode

```javascript
// Explicitly use legacy mode
LC.RelationsEngine.updateRelation('Алекс', 'Борис', 10, { 
  usePerceptions: false 
});
```

---

## Performance Notes

- **Memory:** O(N²) for N characters (e.g., 100 characters = 10,000 perception entries)
- **CPU:** +0.1ms per interpretation (negligible)
- **Recommendation:** Fine for narrative games with < 200 active characters

---

## Common Mistakes

### ❌ Wrong: Expecting symmetric perceptions

```javascript
// Don't assume symmetry!
if (L.characters['Алекс'].perceptions['Борис'].affection === 
    L.characters['Борис'].perceptions['Алекс'].affection) {
  // This is rarely true!
}
```

### ✅ Right: Embrace asymmetry

```javascript
const alexLovesBoris = L.characters['Алекс'].perceptions['Борис'].affection > 70;
const borisLovesAlex = L.characters['Борис'].perceptions['Алекс'].affection > 70;

if (alexLovesBoris && !borisLovesAlex) {
  console.log("Unrequited feelings!");
}
```

### ❌ Wrong: Modifying perceptions directly without bounds checking

```javascript
L.characters['Алекс'].perceptions['Борис'].affection += 100; // Can exceed 100!
```

### ✅ Right: Use RelationsEngine or InformationEngine

```javascript
LC.RelationsEngine.updateRelation('Алекс', 'Борис', { affection: 50 });
// or
LC.InformationEngine.updatePerception('Алекс', 'Борис', interpretation);
```

---

## Examples from Tests

See working examples in:
- `tests/test_subjective_reality.js` - Unit tests
- `tests/test_integration_subjective_livingworld.js` - Integration tests

---

**Last Updated:** October 11, 2025  
**Version:** 1.0  
**Status:** Production Ready ✓
