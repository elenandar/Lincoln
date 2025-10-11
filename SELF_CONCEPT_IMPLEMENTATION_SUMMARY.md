# Self-Concept Implementation Summary

## Overview

The **Self-Concept** (Я-Концепция) feature extends the Crucible Engine to version 2.0, implementing a psychological dual-trait system where characters have both **objective personality traits** (who they really are) and **perceived self-concept** (who they think they are).

This creates a more realistic psychological model where formative events primarily affect how characters perceive themselves, rather than immediately changing their core personality. The gap between reality and self-perception generates internal conflict and character depth.

---

## What Was Implemented

### 1. Self-Concept Initialization

**Location**: `Library v16.0.8.patched.txt`, lines ~1904-1913

**Implementation**: During character creation, every character now receives a `self_concept` object alongside their `personality`:

```javascript
// Initialize self-concept (perceived traits) if not present
if (!rec.self_concept) {
  // Self-concept starts matching objective personality
  rec.self_concept = {
    perceived_trust: rec.personality.trust,
    perceived_bravery: rec.personality.bravery,
    perceived_idealism: rec.personality.idealism,
    perceived_aggression: rec.personality.aggression
  };
}
```

**Key Points**:
- Self-concept is initialized to match personality (aligned self-awareness)
- As formative events occur, the gap between them grows
- Both objects use the same 0-1 scale for consistency

### 2. CrucibleEngine 2.0: Self-Concept Evolution

**Location**: `Library v16.0.8.patched.txt`, lines 5367-5510

**Philosophy**: Formative events now primarily change **self-perception** rather than objective traits. This reflects psychological research showing that trauma and triumph affect how we see ourselves more than who we actually are.

#### Relation Change Handler

**Betrayal Example** (change < -40):
```javascript
// Self-concept changes MORE than objective personality
character.self_concept.perceived_trust -= 0.25;      // -25%
character.self_concept.perceived_idealism -= 0.15;   // -15%

// Objective personality changes less
character.personality.trust -= 0.1;                   // -10%
character.personality.idealism -= 0.05;              // -5%
```

**Ratio**: Self-concept changes are **2.5x stronger** than objective personality changes.

**Rescue/Loyalty Example** (change > 40):
```javascript
// Self-concept changes MORE
character.self_concept.perceived_trust += 0.2;       // +20%
character.self_concept.perceived_bravery += 0.15;    // +15%

// Objective personality changes less  
character.personality.trust += 0.08;                  // +8%
character.personality.bravery += 0.05;               // +5%
```

#### Goal Completion Handler

**Success**:
```javascript
// Self-concept: Confidence boost
character.self_concept.perceived_bravery += 0.15;    // +15%
character.self_concept.perceived_idealism += 0.1;    // +10%

// Objective: Modest improvement
character.personality.bravery += 0.05;                // +5%
character.personality.idealism += 0.03;              // +3%
```

**Failure**:
```javascript
// Self-concept: Loss of confidence
character.self_concept.perceived_idealism -= 0.15;   // -15%
character.self_concept.perceived_bravery -= 0.1;     // -10%

// Objective: Smaller impact
character.personality.idealism -= 0.05;              // -5%
```

#### Rumor Spread Handler

**Public Humiliation** (spreadCount >= 5, spin: 'negative'):
```javascript
// Self-concept: Severe damage to self-esteem
character.self_concept.perceived_trust -= 0.15;      // -15%
character.self_concept.perceived_bravery -= 0.1;     // -10%

// Objective: Modest impact
character.personality.trust -= 0.05;                  // -5%
character.personality.aggression += 0.03;            // +3%
```

### 3. Context Overlay Integration

**Location**: `Library v16.0.8.patched.txt`, lines 6823-6910

**Purpose**: The AI sees characters through their **self-concept** rather than objective personality when there's a significant divergence (>0.2).

**Implementation**:

1. **Trait Analysis**: Uses `perceived_*` values when divergence is detected
2. **Conflict Detection**: Generates `⟦CONFLICT⟧` tags when gaps are significant
3. **Behavioral Guidance**: AI portrays characters based on how they see themselves

**Example Context Output**:
```
⟦TRAITS: Иван⟧ циничен и не доверяет людям
⟦CONFLICT: Иван⟧ Внутренний конфликт: недооценивает свою доверчивость, недооценивает свою смелость
```

This tells the AI:
- Иван **acts** cynical (based on self-concept)
- But he's **objectively** more trusting than he thinks
- This internal conflict can manifest in behavior

**Divergence Detection**:
```javascript
const hasDivergence = (objTrait, perceivedTrait) => {
  if (perceivedTrait === undefined) return false;
  return Math.abs(objTrait - perceivedTrait) > 0.2;
};
```

**Conflict Messages**:
- `недооценивает свою доверчивость` - underestimates their trustworthiness
- `переоценивает свою доверчивость` - overestimates their trustworthiness
- `недооценивает свою храбрость` - underestimates their bravery
- `переоценивает свою храбрость` - overestimates their bravery

### 4. Context Priority System

**Location**: `Library v16.0.8.patched.txt`, lines 6940-6963

**New Tag**: `⟦CONFLICT:⟧` with priority 735 (between SECRET and TRAITS)

```javascript
if (line.indexOf("⟦SECRET⟧") === 0) return 740;
if (line.indexOf("⟦CONFLICT:") === 0) return 735;  // NEW
if (line.indexOf("⟦TRAITS:") === 0) return 730;
```

This ensures conflict information appears prominently in the context.

---

## Testing

### Test Coverage

**File**: `tests/test_self_concept.js` (370 lines)

**Tests**:
1. ✅ Self-concept initialization alongside personality
2. ✅ Self-concept changes MORE than objective personality
3. ✅ Internal conflict from self-concept divergence
4. ✅ Context overlay shows self-concept traits and conflict
5. ✅ Goal success primarily affects self-concept
6. ✅ Public humiliation damages self-concept more

**All tests pass** ✅

### Backward Compatibility

**File**: `tests/test_crucible.js`

All existing Crucible tests continue to pass, confirming that the self-concept feature is fully backward compatible.

---

## Demo Script

**File**: `demo_self_concept.js` (300 lines)

**Story**: Two students experience formative events that change their self-perception:

1. **Мария** - Experiences betrayal
   - Objective trust: 0.70 → 0.60 (-10%)
   - Perceived trust: 0.70 → 0.45 (-25%)
   - **Result**: She still trusts more than she thinks she does

2. **Артём** - Achieves success
   - Objective bravery: 0.40 → 0.45 (+5%)
   - Perceived bravery: 0.40 → 0.55 (+15%)
   - **Result**: His confidence exceeds his actual courage

**Key Demonstration**:
- Shows the gap between reality and self-perception
- Displays context overlay with CONFLICT tags
- Explains the psychological philosophy

---

## Director Messages

Messages now emphasize **self-perception** changes:

**Old**:
```
"Борис пережил(а) предательство и стал(а) менее доверчив(ой)."
```

**New**:
```
"Борис пережил(а) предательство и теперь считает себя менее доверчив(ым/ой)."
```

The addition of "теперь считает себя" (now considers himself/herself) emphasizes that this is a change in self-perception, not just behavior.

---

## Integration Points

### Current Integration

1. **Character Creation** (`updateCharacterActivity`)
   - Automatically initializes self-concept for all characters
   
2. **Crucible Engine** (`analyzeEvent`)
   - All formative events now affect self-concept
   
3. **Context Overlay** (`composeContextOverlay`)
   - AI receives self-concept-based traits
   - Conflict tags inform AI of internal struggles

### Future Integration Opportunities

1. **LivingWorld Engine**
   - Characters could make decisions based on perceived traits
   - A character with high objective bravery but low perceived bravery might avoid risks
   
2. **Dialogue System**
   - Characters could reference their self-concept in dialogue
   - "I'm not brave enough" (even if they objectively are)
   
3. **Therapy/Counseling Mechanics**
   - Events that help align self-concept with reality
   - Character growth through improved self-awareness

---

## Psychological Foundation

### The Philosophy

The self-concept system is based on psychological research showing:

1. **Self-Concept Theory**: Our behavior is driven more by who we think we are than who we actually are
2. **Self-Fulfilling Prophecy**: If we believe we're cowardly, we act cowardly (even if we're not)
3. **Trauma Psychology**: Negative events damage self-esteem more than they change core traits
4. **Impostor Syndrome**: Success can create a gap where achievements exceed self-belief

### Real-World Examples

**Underestimating Self** (Low self-concept, high reality):
- Talented artist who thinks they're mediocre
- Brave person who sees themselves as cowardly after failure
- Trustworthy person who believes they can't be trusted after betrayal

**Overestimating Self** (High self-concept, low reality):
- Minor success inflating self-confidence beyond skill level
- Rescue making someone feel braver than they actually are
- Single achievement creating unrealistic self-image

---

## Technical Details

### Data Structure

```javascript
character: {
  personality: {           // Objective reality
    trust: 0.6,
    bravery: 0.7,
    idealism: 0.5,
    aggression: 0.3
  },
  self_concept: {          // Perceived reality
    perceived_trust: 0.4,
    perceived_bravery: 0.5,
    perceived_idealism: 0.3,
    perceived_aggression: 0.4
  }
}
```

### Bounds Checking

Both `personality` and `self_concept` traits are clamped to [0, 1]:

```javascript
// Ensure all personality values stay within [0, 1]
for (const trait in character.personality) {
  character.personality[trait] = Math.max(0, Math.min(1, character.personality[trait]));
}

// Ensure all self-concept values stay within [0, 1]
if (character.self_concept) {
  for (const trait in character.self_concept) {
    character.self_concept[trait] = Math.max(0, Math.min(1, character.self_concept[trait]));
  }
}
```

### Change Ratios

| Event Type | Self-Concept Change | Objective Change | Ratio |
|------------|---------------------|------------------|-------|
| Betrayal (trust) | -0.25 | -0.10 | 2.5x |
| Betrayal (idealism) | -0.15 | -0.05 | 3.0x |
| Rescue (trust) | +0.20 | +0.08 | 2.5x |
| Rescue (bravery) | +0.15 | +0.05 | 3.0x |
| Success (bravery) | +0.15 | +0.05 | 3.0x |
| Success (idealism) | +0.10 | +0.03 | 3.3x |
| Failure (idealism) | -0.15 | -0.05 | 3.0x |
| Rumor (trust) | -0.15 | -0.05 | 3.0x |

**Average Ratio**: ~2.8x stronger impact on self-concept

---

## Usage Examples

### Creating a Character with Mismatched Self-Concept

```javascript
L.characters['Джон'] = {
  type: 'MAIN',
  status: 'ACTIVE',
  personality: {
    trust: 0.8,        // Objectively trusting
    bravery: 0.7,      // Actually brave
    idealism: 0.6,
    aggression: 0.2
  },
  self_concept: {
    perceived_trust: 0.3,      // Sees himself as cynical
    perceived_bravery: 0.4,    // Sees himself as cowardly
    perceived_idealism: 0.6,
    perceived_aggression: 0.2
  }
};
```

When Джон appears in a scene, the context will show:
```
⟦TRAITS: Джон⟧ циничен и не доверяет людям
⟦CONFLICT: Джон⟧ Внутренний конфликт: недооценивает свою доверчивость, недооценивает свою смелость
```

### Triggering Self-Concept Changes

```javascript
// Betrayal damages self-perception
LC.Crucible.analyzeEvent({
  type: 'RELATION_CHANGE',
  character: 'Джон',
  otherCharacter: 'Предатель',
  change: -50,
  finalValue: -40
});

// Success boosts self-confidence
LC.Crucible.analyzeEvent({
  type: 'GOAL_COMPLETE',
  character: 'Джон',
  success: true
});

// Public humiliation damages self-esteem
LC.Crucible.analyzeEvent({
  type: 'RUMOR_SPREAD',
  character: 'Джон',
  spreadCount: 7,
  spin: 'negative'
});
```

---

## Future Enhancements

### 1. Self-Concept Drift

Over time, self-concept could slowly drift toward reality:

```javascript
// Gradual alignment (once per day?)
const drift = 0.02;
if (character.self_concept.perceived_trust < character.personality.trust) {
  character.self_concept.perceived_trust += drift;
} else if (character.self_concept.perceived_trust > character.personality.trust) {
  character.self_concept.perceived_trust -= drift;
}
```

### 2. Social Influence

Friends could help improve self-concept through support:

```javascript
// Friend's encouragement
character.self_concept.perceived_bravery += 0.05;
// Message: "Благодаря поддержке друзей, начинает верить в себя"
```

### 3. Therapy Mechanics

Explicit events that improve self-awareness:

```javascript
LC.Crucible.analyzeEvent({
  type: 'THERAPY_SESSION',
  character: 'Джон',
  insight: 'trust'  // Helps align perceived_trust with reality
});
```

### 4. Compound Conflicts

Track multiple types of internal conflict:

```javascript
character.conflicts = [
  { type: 'impostor_syndrome', trait: 'bravery', severity: 0.3 },
  { type: 'underestimation', trait: 'trust', severity: 0.5 }
];
```

---

## Conclusion

The Self-Concept feature successfully implements psychological realism in character evolution:

✅ **Dual Trait System**: Objective vs. Perceived traits  
✅ **Psychological Accuracy**: Self-perception changes faster than core traits  
✅ **Internal Conflict**: Divergence creates depth  
✅ **AI Integration**: Context overlay uses self-concept for behavior  
✅ **Director Messages**: Emphasize belief changes  
✅ **Full Testing**: Comprehensive test suite  
✅ **Demo**: Clear demonstration of features  
✅ **Backward Compatible**: All existing tests pass  

**Impact**: Characters now have rich inner lives where formative events shape not just who they are, but who they believe themselves to be. This creates opportunities for character arcs about self-discovery, overcoming self-doubt, or confronting inflated egos.

**Philosophy**: *"We are shaped not by what happens to us, but by what we believe happened to us."*
