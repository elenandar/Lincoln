## 6.4 Self-Concept (Я-Концепция) - CrucibleEngine 2.0

### Overview

The **Self-Concept** system extends the Crucible Engine to version 2.0, implementing a psychological dual-trait model where characters possess both **objective personality traits** (who they really are) and **perceived self-concept** (who they think they are).

This creates a more realistic psychological model reflecting research that shows formative events affect **self-perception** more profoundly than they change core personality traits.

### Core Architecture

#### Dual Trait System

Each character has two parallel trait structures:

```javascript
character: {
  personality: {           // Objective reality - who they ARE
    trust: 0.6,
    bravery: 0.7,
    idealism: 0.5,
    aggression: 0.3
  },
  self_concept: {          // Perceived reality - who they THINK they are
    perceived_trust: 0.4,
    perceived_bravery: 0.5,
    perceived_idealism: 0.3,
    perceived_aggression: 0.4
  }
}
```

**Key Principles:**

1. **Initial Alignment**: New characters start with `self_concept` matching `personality` (accurate self-awareness)
2. **Divergence Through Experience**: Formative events change self-concept MORE than objective personality
3. **Internal Conflict**: When the gap exceeds 0.2, the character experiences psychological conflict
4. **Behavioral Primacy**: The AI portrays characters based on their self-concept, not objective traits

### Evolution Mechanics

#### Change Ratios

Formative events affect self-concept **2.5-3x stronger** than objective personality:

**Betrayal Example** (relationship change < -40):
```javascript
// Self-concept changes significantly
self_concept.perceived_trust:    -0.25  (25% decrease)
self_concept.perceived_idealism: -0.15  (15% decrease)

// Objective personality changes modestly
personality.trust:               -0.10  (10% decrease)
personality.idealism:            -0.05  (5% decrease)
```

**Success Example** (goal completion):
```javascript
// Self-concept: Confidence boost
self_concept.perceived_bravery:  +0.15  (15% increase)
self_concept.perceived_idealism: +0.10  (10% increase)

// Objective: Modest improvement
personality.bravery:             +0.05  (5% increase)
personality.idealism:            +0.03  (3% increase)
```

#### Event-Specific Changes

| Event Type | Self-Concept Impact | Objective Impact | Ratio |
|------------|-------------------|------------------|-------|
| Betrayal (trust) | -0.25 | -0.10 | 2.5x |
| Rescue (trust) | +0.20 | +0.08 | 2.5x |
| Rescue (bravery) | +0.15 | +0.05 | 3.0x |
| Goal Success (bravery) | +0.15 | +0.05 | 3.0x |
| Goal Failure (idealism) | -0.15 | -0.05 | 3.0x |
| Public Humiliation (trust) | -0.15 | -0.05 | 3.0x |

### Context Integration

#### TRAITS Tag (Modified)

The context overlay now shows traits based on **self-concept** when divergence is detected:

```javascript
// Without divergence
⟦TRAITS: Иван⟧ смел и готов рисковать

// With divergence (perceived_bravery < reality)
⟦TRAITS: Иван⟧ осторожен и боится рисковать
```

The AI sees and portrays the character through their self-perception.

#### CONFLICT Tag (New)

When self-concept diverges from personality by >0.2, a conflict tag appears:

```
⟦CONFLICT: Иван⟧ Внутренний конфликт: недооценивает свою храбрость
```

**Conflict Messages:**
- `недооценивает свою доверчивость` - underestimates trustworthiness
- `переоценивает свою доверчивость` - overestimates trustworthiness
- `недооценивает свою храбрость` - underestimates bravery
- `переоценивает свою храбрость` - overestimates bravery

**Priority**: CONFLICT tags have priority 735 (between SECRET and TRAITS), ensuring they appear prominently.

### Director Messages

Messages now emphasize self-perception changes:

**Before (v1.0):**
```
"Борис пережил(а) предательство и стал(а) менее доверчив(ой)."
```

**After (v2.0):**
```
"Борис пережил(а) предательство и теперь считает себя менее доверчив(ым/ой)."
```

The phrase "теперь считает себя" (now considers himself/herself) explicitly frames this as a change in self-belief.

### Character Archetypes

#### The Wounded Optimist

```javascript
personality.trust: 0.7           // Objectively still trusts
self_concept.perceived_trust: 0.3  // Sees self as cynical
```

**Behavior**: Acts defensive and cynical but occasionally shows unexpected trust. Internal conflict between belief and nature.

#### The Impostor Hero

```javascript
personality.bravery: 0.4          // Not particularly brave
self_concept.perceived_bravery: 0.7  // Thinks they're a hero
```

**Behavior**: Takes risks beyond actual capability. Potential for dramatic failure when confidence exceeds reality.

#### The Broken Idealist

```javascript
personality.idealism: 0.7         // Still has hope
self_concept.perceived_idealism: 0.3  // Thinks they've lost it
```

**Behavior**: Claims to be cynical and pragmatic but acts hopefully when it matters. Words don't match actions.

### Psychological Foundation

The self-concept system is grounded in psychological research:

1. **Self-Concept Theory**: Behavior is driven more by self-perception than objective traits
2. **Self-Fulfilling Prophecy**: Believing you're cowardly makes you act cowardly (even if you're not)
3. **Trauma Psychology**: Negative events damage self-esteem more severely than they change core traits
4. **Impostor Syndrome**: Success can inflate self-confidence beyond actual capability

### Future Enhancements

**Self-Concept Drift:**
- Gradual alignment toward reality over time
- Social support helping improve self-perception

**Therapy Mechanics:**
- Events that help characters see themselves accurately
- Counseling improving self-awareness

**LivingWorld Integration:**
- Decision-making based on perceived traits
- Character with high objective bravery but low perceived bravery avoiding risks

**Dialogue Integration:**
- Characters reference their self-doubt: "I'm not brave enough for this"
- Even when objectively they are

### Testing

**Test File**: `tests/test_self_concept.js`

**Coverage:**
- ✅ Self-concept initialization
- ✅ Evolution ratios (self-concept changes more)
- ✅ Conflict detection and display
- ✅ Context overlay integration
- ✅ All event types (betrayal, success, failure, rumors)

**Backward Compatibility**: All existing Crucible tests pass unchanged.

**Demo**: `demo_self_concept.js` showcases two characters evolving through formative events, demonstrating the gap between reality and self-perception.

### Technical Implementation

**Location**: `Library v16.0.8.patched.txt`

**Key Functions:**
- Lines 1904-1913: Self-concept initialization
- Lines 5367-5428: Enhanced `_handleRelationChange` with self-concept
- Lines 5430-5470: Enhanced `_handleGoalComplete` with self-concept
- Lines 5472-5510: Enhanced `_handleRumorSpread` with self-concept
- Lines 6823-6910: Context overlay with self-concept and conflict detection

### Usage Example

```javascript
// Create character with misaligned self-concept
L.characters['Джон'] = {
  type: 'MAIN',
  status: 'ACTIVE',
  personality: {
    trust: 0.8,        // Objectively trusting
    bravery: 0.7       // Objectively brave
  },
  self_concept: {
    perceived_trust: 0.3,    // Sees self as cynical
    perceived_bravery: 0.4   // Sees self as cowardly
  }
};

// Trigger evolution
LC.Crucible.analyzeEvent({
  type: 'RELATION_CHANGE',
  character: 'Джон',
  change: -50  // Major betrayal
});

// Self-concept drops further, objective personality changes less
// Context shows: циничен и не доверяет людям (based on self-concept)
// Context shows: ⟦CONFLICT⟧ недооценивает свою доверчивость
```

### Philosophy

**"We are shaped not by what happens to us, but by what we believe happened to us."**

The self-concept system recognizes that psychological realism requires modeling not just objective traits, but the subjective experience of those traits. A character who believes they're a coward will act like one, even if their objective bravery is high. This creates rich opportunities for character arcs about self-discovery, overcoming self-doubt, or confronting inflated egos.

---
