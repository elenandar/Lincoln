# Self-Concept Quick Start Guide

## What is Self-Concept?

**Self-Concept** (Я-Концепция) is a dual-trait psychological system where characters have:
- **Personality**: Who they objectively are
- **Self-Concept**: Who they think they are

The gap between these creates **internal conflict** and psychological depth.

---

## Quick Examples

### Example 1: The Broken Idealist

```javascript
// After a major betrayal
Character.personality.trust = 0.6;           // Still fairly trusting
Character.self_concept.perceived_trust = 0.3; // Sees self as cynical

// AI receives:
// ⟦TRAITS⟧ циничен и не доверяет людям (acts cynical)
// ⟦CONFLICT⟧ недооценивает свою доверчивость (internal conflict)
```

**Behavior**: Acts cynical but occasionally shows unexpected trust, creating complexity.

### Example 2: The Impostor

```javascript
// After a big success
Character.personality.bravery = 0.45;          // Modestly brave
Character.self_concept.perceived_bravery = 0.65; // Thinks he's a hero

// AI receives:
// ⟦TRAITS⟧ смел и готов рисковать (acts brave)
// ⟦CONFLICT⟧ переоценивает свою храбрость (overconfident)
```

**Behavior**: Takes risks beyond actual ability, potential for failure.

---

## How It Works

### 1. Automatic Initialization

Every character gets self-concept during creation:

```javascript
// Happens automatically in updateCharacterActivity()
character.self_concept = {
  perceived_trust: character.personality.trust,
  perceived_bravery: character.personality.bravery,
  perceived_idealism: character.personality.idealism,
  perceived_aggression: character.personality.aggression
};
```

Initially **aligned** (self-concept = personality).

### 2. Formative Events Change Self-Concept MORE

When Crucible analyzes events:

```javascript
// Betrayal event
LC.Crucible.analyzeEvent({
  type: 'RELATION_CHANGE',
  character: 'Мария',
  change: -50  // Major betrayal
});

// Result:
// personality.trust:      -10% (small change)
// self_concept.perceived_trust: -25% (BIG change)
```

**Ratio**: Self-concept changes ~2.5-3x more than objective personality.

### 3. Divergence Creates Conflict

When the gap is >0.2, AI sees conflict:

```javascript
Math.abs(personality.trust - self_concept.perceived_trust) > 0.2
// → ⟦CONFLICT⟧ tag appears in context
```

---

## Event Types & Changes

### Betrayal (RELATION_CHANGE, change < -40)

```javascript
self_concept.perceived_trust:    -0.25  (major hit)
self_concept.perceived_idealism: -0.15
personality.trust:               -0.10  (smaller)
personality.idealism:            -0.05

Message: "теперь считает себя менее доверчив(ым/ой)"
```

### Rescue (RELATION_CHANGE, change > 40)

```javascript
self_concept.perceived_trust:   +0.20  (big boost)
self_concept.perceived_bravery: +0.15
personality.trust:              +0.08  (modest)
personality.bravery:            +0.05

Message: "теперь считает себя более смел(ым/ой) и надежн(ым/ой)"
```

### Success (GOAL_COMPLETE, success: true)

```javascript
self_concept.perceived_bravery:  +0.15  (confidence!)
self_concept.perceived_idealism: +0.10
personality.bravery:             +0.05  (small)
personality.idealism:            +0.03

Message: "теперь верит в свою смелость"
```

### Failure (GOAL_COMPLETE, success: false)

```javascript
self_concept.perceived_idealism: -0.15  (loss of hope)
self_concept.perceived_bravery:  -0.10
personality.idealism:            -0.05  (small)
```

### Public Humiliation (RUMOR_SPREAD, count >= 5)

```javascript
self_concept.perceived_trust:   -0.15  (shamed)
self_concept.perceived_bravery: -0.10
personality.trust:              -0.05  (small)

Message: "стал(а) менее уверен(ой) в себе из-за слухов"
```

---

## Context Tags

### TRAITS Tag

Shows how character acts (based on self-concept when diverged):

```
⟦TRAITS: Иван⟧ циничен и не доверяет людям
```

Uses `perceived_trust` if divergence detected, otherwise `trust`.

### CONFLICT Tag

Shows internal struggle when reality ≠ self-perception:

```
⟦CONFLICT: Иван⟧ Внутренний конфликт: недооценивает свою доверчивость
```

**Messages**:
- `недооценивает свою доверчивость` - underestimates trust
- `переоценивает свою доверчивость` - overestimates trust  
- `недооценивает свою храбрость` - underestimates bravery
- `переоценивает свою храбрость` - overestimates bravery
- `считает себя менее доверчивым чем есть` - thinks less trusting
- `считает себя более доверчивым чем есть` - thinks more trusting

---

## Testing

### Run Tests

```bash
# Self-concept specific tests
node tests/test_self_concept.js

# Verify backward compatibility
node tests/test_crucible.js

# Demo
node demo_self_concept.js
```

### Expected Output

```
✅ ALL TESTS PASSED

Self-Concept (Я-Концепция) is fully operational!
Characters now have dual trait systems:
  - personality: objective traits (who they really are)
  - self_concept: perceived traits (who they think they are)
```

---

## Manual Testing

### Create a Conflicted Character

```javascript
const L = LC.lcInit();
L.characters['Тест'] = {
  type: 'MAIN',
  status: 'ACTIVE',
  personality: {
    trust: 0.8,      // Actually trusting
    bravery: 0.7,    // Actually brave
    idealism: 0.6,
    aggression: 0.2
  },
  self_concept: {
    perceived_trust: 0.3,    // Thinks cynical
    perceived_bravery: 0.4,  // Thinks cowardly
    perceived_idealism: 0.6,
    perceived_aggression: 0.2
  }
};
```

### Check Context

```javascript
L.turn = 10;
L.characters['Тест'].lastSeen = 10;
const context = LC.composeContextOverlay({ limit: 1500 });
console.log(context.text);
```

### Expected Context

```
⟦TRAITS: Тест⟧ циничен и не доверяет людям
⟦CONFLICT: Тест⟧ Внутренний конфликт: недооценивает свою доверчивость, недооценивает свою смелость
⟦SCENE⟧ Focus on: Тест
```

---

## Character Archetypes

### The Wounded Optimist

```javascript
personality.trust: 0.7       // Still trusts people
self_concept.perceived_trust: 0.3  // Thinks they don't
```

**Story**: Betrayed in the past, acts defensive but shows surprising trust.

### The Impostor Hero

```javascript
personality.bravery: 0.4     // Not that brave
self_concept.perceived_bravery: 0.7  // Thinks they're a hero
```

**Story**: One success made them overconfident, takes dangerous risks.

### The Self-Aware Cynic

```javascript
personality.trust: 0.3       // Actually cynical
self_concept.perceived_trust: 0.3  // Knows it
```

**Story**: No conflict - accurate self-assessment (rare!).

### The Broken Idealist

```javascript
personality.idealism: 0.7    // Still has hope
self_concept.perceived_idealism: 0.3  // Thinks they've lost it
```

**Story**: Claims to be cynical but acts hopefully when it matters.

---

## Integration with Game Loop

### During Character Creation

```javascript
// Automatic - happens in updateCharacterActivity()
LC.updateCharacterActivity(text, isContext);
// Characters get self_concept that matches personality
```

### During Story Events

```javascript
// Major relationship change
LC.RelationsEngine.updateRelation(char1, char2, -50);
// → Triggers Crucible
// → Self-concept changes more than personality

// Goal completion
LC.GoalsEngine.completeGoal(goalKey);
// → Triggers Crucible  
// → Self-concept.perceived_bravery increases

// Rumor spread
LC.GossipEngine.spreadRumor(rumor, targetCount);
// → Triggers Crucible
// → Self-concept.perceived_trust decreases
```

### In Context Generation

```javascript
// Every turn
const context = LC.composeContextOverlay();
// AI sees:
// - Traits based on self-concept (when diverged)
// - Conflict tags for internal struggles
```

---

## Tips for Writers

### Creating Drama

1. **Underestimating Self**: Character has ability but lacks confidence
   - Potential for growth arc
   - "I can't do this" → actually succeeds
   
2. **Overestimating Self**: Character has confidence but lacks ability
   - Potential for failure/humbling
   - "I can handle this" → actually fails

3. **Gradual Alignment**: Events that help character see reality
   - Friend's encouragement
   - Undeniable proof of capability
   - Therapy/counseling

### Avoiding Confusion

- Keep divergence meaningful (>0.2 gap)
- Don't create contradictory behaviors
- Use CONFLICT tags to explain to AI
- Have characters reference their self-doubt/overconfidence

---

## Troubleshooting

### "Character not showing CONFLICT tag"

Check divergence:
```javascript
const gap = Math.abs(
  character.personality.trust - 
  character.self_concept.perceived_trust
);
console.log('Gap:', gap);  // Must be > 0.2
```

### "Self-concept not changing"

Verify character importance:
```javascript
character.type === 'MAIN' || character.type === 'SECONDARY'
// Only important characters get strong self-concept changes
```

### "Changes too small"

Check event magnitude:
```javascript
// Betrayal needs change < -40
// Rescue needs change > 40
// Goals just need success/failure
// Rumors need spreadCount >= 5
```

---

## File Locations

- **Implementation**: `Library v16.0.8.patched.txt`
  - Lines 1904-1913: Initialization
  - Lines 5367-5510: Crucible Engine 2.0
  - Lines 6823-6963: Context overlay integration

- **Tests**: `tests/test_self_concept.js`

- **Demo**: `demo_self_concept.js`

- **Docs**: `SELF_CONCEPT_IMPLEMENTATION_SUMMARY.md`

---

## Quick Reference Table

| Event | Self-Concept Change | Objective Change | Ratio |
|-------|-------------------|------------------|-------|
| Betrayal (trust) | -0.25 | -0.10 | 2.5x |
| Rescue (trust) | +0.20 | +0.08 | 2.5x |
| Rescue (bravery) | +0.15 | +0.05 | 3.0x |
| Success (bravery) | +0.15 | +0.05 | 3.0x |
| Failure (idealism) | -0.15 | -0.05 | 3.0x |
| Rumor (trust) | -0.15 | -0.05 | 3.0x |

**Key Insight**: Formative events change how we see ourselves (self-concept) much more than who we actually are (personality).
