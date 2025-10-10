# Social Engine (Norms & Hierarchy) - Quick Start Guide

## What is the Social Engine?

The Social Engine transforms NPCs from isolated individuals into members of a living society. Characters now experience:

- **Social Pressure** - Unwritten rules that emerge from group reactions
- **Status Hierarchy** - Dynamic ranking from outcasts to opinion leaders
- **Social Consequences** - Actions affect reputation and influence
- **Credibility** - Status determines how much others believe you

## Quick Examples

### Example 1: Rise to Leadership

```javascript
// Character performs helpful actions
LC.HierarchyEngine.updateCapital('Эшли', { type: 'POSITIVE_ACTION' });
LC.HierarchyEngine.updateCapital('Эшли', { type: 'POSITIVE_ACTION' });
LC.HierarchyEngine.updateCapital('Эшли', { type: 'POSITIVE_ACTION' });

// After 6 positive actions, capital: 100 → 148
LC.HierarchyEngine.recalculateStatus();

// Result: Эшли becomes 'leader'
console.log(L.characters['Эшли'].social.status);  // 'leader'
```

### Example 2: Fall to Outcast

```javascript
// Character violates social norms repeatedly
LC.HierarchyEngine.updateCapital('Леонид', {
  type: 'NORM_VIOLATION',
  normStrength: 0.9,
  witnessCount: 5
});

// Multiple negative actions
LC.HierarchyEngine.updateCapital('Леонид', { type: 'NEGATIVE_ACTION' });
LC.HierarchyEngine.updateCapital('Леонид', { type: 'NEGATIVE_ACTION' });

// After violations, capital: 100 → 38
LC.HierarchyEngine.recalculateStatus();

// Result: Леонид becomes 'outcast'
console.log(L.characters['Леонид'].social.status);  // 'outcast'
```

### Example 3: Status Affects Gossip

```javascript
// Leader spreading rumor - high credibility
LC.GossipEngine.Propagator.spreadRumor('rumor_001', 'Эшли', 'target');
// Success rate: ~100% (1.5× multiplier)

// Outcast spreading same rumor - low credibility
LC.GossipEngine.Propagator.spreadRumor('rumor_001', 'Леонид', 'target');
// Success rate: ~20% (0.2× multiplier)
```

## Key Concepts

### Social Capital (0-200)

Your "points" in the social hierarchy:
- Start at: **100** (neutral)
- Leader threshold: **140+**
- Outcast threshold: **<40**

**How to gain capital:**
- Positive actions: +8
- Following strong norms: +5
- Helping others

**How to lose capital:**
- Negative actions: -5
- Violating norms: -10 to -20 (depends on norm strength)
- Being witnessed doing bad things

### Social Status

Three tiers based on capital:

1. **Leader** (capital ≥ 140, top-ranked)
   - Rumors spread 50% more effectively
   - Appears as "⟦STATUS: Name⟧ Лидер мнений" in AI context
   - Highest social influence

2. **Member** (40 ≤ capital < 140)
   - Normal social standing
   - No special effects
   - Most characters start here

3. **Outcast** (capital < 40)
   - Rumors only spread 20% as effectively
   - Higher rumor distortion (50% vs 30%)
   - Appears as "⟦STATUS: Name⟧ Изгой" in AI context

### Social Norms

Dynamic rules that emerge from group behavior:

```javascript
// Check norm strength
const strength = LC.NormsEngine.getNormStrength('betrayal');
// Returns 0.0-1.0 (default: 0.5 if not established)

// Strong norm (0.8): Violating costs ~16 capital with 5 witnesses
// Weak norm (0.3): Violating costs ~6 capital with 5 witnesses
```

## Running the Demo

See it in action:

```bash
node demo_social_engine.js
```

This shows:
1. Three characters start equal (capital: 100)
2. Эшли performs helpful actions → becomes leader
3. Леонид violates norms → becomes outcast
4. Status affects gossip credibility
5. STATUS tags appear in context

## Running Tests

Verify everything works:

```bash
# Social Engine specific tests (27 tests)
node tests/test_social_engine.js

# All social architecture tests (12 tests)
node tests/validate_social_architecture.js

# Verify no regressions
node tests/test_crucible.js
node test_living_world.js
```

## Integration Points

The Social Engine automatically integrates with:

### 1. LivingWorld Engine
When NPCs perform SOCIAL_POSITIVE or SOCIAL_NEGATIVE actions during off-screen simulation, their capital updates automatically.

### 2. GossipEngine
Rumor spreading now considers the source's status. Leaders are more believable, outcasts are dismissed.

### 3. Context Overlay
Leaders and outcasts appear with STATUS tags in the AI context, influencing narrative generation.

### 4. Periodic Updates
Every 20 turns, the UnifiedAnalyzer recalculates everyone's status based on their current capital.

## Architecture

```
Character performs action
       ↓
LivingWorld.generateFact()
       ↓
HierarchyEngine.updateCapital()
  (modifies character.social.capital)
       ↓
[Every 20 turns via UnifiedAnalyzer]
HierarchyEngine.recalculateStatus()
  (updates character.social.status)
       ↓
    ┌──┴──┐
    ↓     ↓
GossipEngine    Context Overlay
(credibility)   (⟦STATUS⟧ tags)
```

## API Reference

### HierarchyEngine

```javascript
// Update social capital
LC.HierarchyEngine.updateCapital(characterName, eventData);
// eventData.type: 'POSITIVE_ACTION', 'NEGATIVE_ACTION', 
//                 'NORM_VIOLATION', 'NORM_CONFORMITY'

// Recalculate all statuses
LC.HierarchyEngine.recalculateStatus();

// Get character's status
const status = LC.HierarchyEngine.getStatus(characterName);
// Returns: 'leader', 'member', or 'outcast'
```

### NormsEngine

```javascript
// Process event to update norms (advanced usage)
LC.NormsEngine.processEvent({
  type: 'betrayal',
  actor: 'Ashley',
  target: 'Max',
  witnesses: ['Chloe', 'Leo'],
  relationsBefore: { 'Chloe': { 'Ashley': 60 } }
});

// Get norm strength
const strength = LC.NormsEngine.getNormStrength('betrayal');
// Returns: 0.0-1.0
```

## Files Modified

- **Library v16.0.8.patched.txt** - Core implementation
  - Lines 1446-1449: L.society initialization
  - Lines 1874-1882: character.social initialization
  - Lines 4781-5044: NormsEngine and HierarchyEngine
  - Lines 2986-2993: Periodic status recalculation
  - Lines 3787-3850: GossipEngine credibility integration
  - Lines 5643-5657: Context overlay STATUS tags

## Documentation

- **SOCIAL_ENGINE_IMPLEMENTATION_SUMMARY.md** - Detailed technical documentation
- **SYSTEM_DOCUMENTATION.md** - Section 3.11 added
- **tests/test_social_engine.js** - Test suite (27 tests)
- **demo_social_engine.js** - Interactive demonstration

## Key Features

✅ **Emergent Dynamics** - Norms emerge from group reactions, not hardcoded  
✅ **Zero Breaking Changes** - All additions, no modifications to existing behavior  
✅ **Automatic Integration** - Works with LivingWorld, GossipEngine, Context  
✅ **Fully Tested** - 27 dedicated tests + all existing tests still pass  
✅ **Production Ready** - Complete with documentation and demo  

## Summary

The Social Engine adds a crucial missing layer to the simulation: **society**. Characters are no longer just individuals with goals and relationships - they're members of a social group with its own pressures, hierarchies, and consequences. This creates more realistic and nuanced social dynamics in the narrative.

**Bottom Line**: NPCs now live in a society, not a vacuum. Actions have social consequences. Status matters. Welcome to the social fabric of Lincoln Heights.
