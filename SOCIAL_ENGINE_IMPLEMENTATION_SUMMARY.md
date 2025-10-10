# Social Engine Implementation Summary

## Overview

The Social Engine implements a dynamic system of social norms and hierarchy that creates realistic group dynamics and social pressure. Characters no longer exist in a social vacuum - they must navigate unwritten rules, maintain their reputation, and deal with the consequences of becoming social outcasts or leaders.

## What Was Implemented

### 1. Data Structures (Task 1)

**Location**: `Library v16.0.8.patched.txt`, lines 1446-1449 (lcInit), 1874-1882 (updateCharacterActivity)

**L.society Object**:
```javascript
L.society = {
  norms: {}  // Dynamic social norms tracked by type
};
```

**Character.social Object**:
```javascript
character.social = {
  status: 'member',    // 'leader', 'member', or 'outcast'
  capital: 100,        // Social capital points [0-200]
  conformity: 0.5      // Conformity to norms [0-1]
};
```

### 2. NormsEngine (Task 2)

**Location**: `Library v16.0.8.patched.txt`, lines 4781-4877

**Purpose**: Dynamically tracks and measures the strength of unwritten social rules based on group reactions.

**Key Functions**:

- `processEvent(eventData)` - Analyzes group reactions to establish/modify norms
- `getNormStrength(normType)` - Returns strength of a specific norm [0-1]

**Norm Structure**:
```javascript
L.society.norms[normType] = {
  strength: 0.5,        // How strong is this norm [0-1]
  lastUpdate: turn,     // When was it last modified
  violations: 0,        // Count of violations
  reinforcements: 0     // Count of reinforcements
};
```

**Logic**:
- If >70% of witnesses react negatively to an action, the norm strengthens
- If >70% react positively, the norm weakens (it's actually acceptable)
- Actors who violate strong norms lose social capital
- Norms slowly decay if not reinforced

### 3. HierarchyEngine (Task 3)

**Location**: `Library v16.0.8.patched.txt`, lines 4879-5044

**Purpose**: Calculates and maintains social status hierarchy based on characters' actions and conformity.

**Key Functions**:

- `updateCapital(characterName, eventData)` - Modifies social capital based on actions
- `recalculateStatus()` - Periodically recalculates everyone's status
- `getStatus(characterName)` - Returns current status

**Status Calculation**:
```javascript
// Thresholds
LEADER_THRESHOLD = 140;     // Top character with capital >= 140
OUTCAST_THRESHOLD = 40;     // Anyone with capital < 40
// Everyone else is 'member'
```

**Capital Changes**:
- NORM_VIOLATION: -10 × normStrength × min(witnessCount/3, 2)
- NORM_CONFORMITY: +5 × normStrength
- POSITIVE_ACTION: +8
- NEGATIVE_ACTION: -5

### 4. Integration with Existing Systems (Task 4)

#### A. LivingWorld Integration

**Location**: Lines 4552-4558, 4609-4615

When NPCs perform SOCIAL_POSITIVE or SOCIAL_NEGATIVE actions, their social capital is automatically updated.

```javascript
// After relationship change
LC.HierarchyEngine.updateCapital(characterName, {
  type: 'POSITIVE_ACTION'  // or 'NEGATIVE_ACTION'
});
```

#### B. GossipEngine Integration

**Location**: Lines 3787-3850

Rumor spreading now considers the source's social status:

```javascript
// Leaders (status: 'leader')
credibilityMultiplier = 1.5;  // Rumors spread 50% more often

// Outcasts (status: 'outcast')
credibilityMultiplier = 0.2;  // Rumors only spread 20% of the time
distortionChance = 0.5;        // Higher distortion rate
```

#### C. Periodic Status Recalculation

**Location**: Lines 2986-2993 (UnifiedAnalyzer)

Every 20 turns, status is automatically recalculated:

```javascript
if (L.turn && L.turn % 20 === 0) {
  LC.HierarchyEngine.recalculateStatus();
}
```

#### D. Context Overlay Integration

**Location**: Lines 5643-5657 (composeContextOverlay), 5686 (weight function)

Leaders and outcasts appear in AI context with STATUS tags:

```
⟦STATUS: Эшли⟧ Лидер мнений
⟦STATUS: Леонид⟧ Изгой
```

Weight: 728 (high priority, between TRAITS and MOOD)

## Architecture Diagram

```
Player Input / AI Output
         ↓
UnifiedAnalyzer.analyze()
         ↓
    ┌────┴────┐
    ↓         ↓
RelationsEngine  LivingWorld.generateFact()
    ↓              ↓
    └──────┬───────┘
           ↓
    HierarchyEngine.updateCapital()
    (modifies character.social.capital)
           ↓
    [Every 20 turns]
    HierarchyEngine.recalculateStatus()
    (updates character.social.status)
           ↓
    ┌──────┴──────┐
    ↓             ↓
GossipEngine    composeContextOverlay()
(credibility)   (⟦STATUS⟧ tags)
```

## Testing

### Test Suite

**Location**: `tests/test_social_engine.js`

**Coverage**:
- ✅ Data structure initialization (6 tests)
- ✅ NormsEngine existence and functionality (4 tests)
- ✅ HierarchyEngine existence and functionality (4 tests)
- ✅ Social capital updates (3 tests)
- ✅ Status transitions (3 tests)
- ✅ Context overlay integration (2 tests)
- ✅ GetStatus method (3 tests)
- ✅ Capital capping (2 tests)

**Total**: 27/27 tests passing

### Demo

**Location**: `demo_social_engine.js`

Demonstrates complete social dynamics workflow:
1. Characters start with equal capital (100)
2. Эшли performs helpful actions → gains capital → becomes leader
3. Леонид violates norms repeatedly → loses capital → becomes outcast
4. Status affects gossip credibility (leader: 100% success, outcast: 0% success)
5. Status appears in context overlay

## Key Design Decisions

### 1. Social Capital as Currency

Rather than direct manipulation of status, characters earn/lose "social capital" through their actions. Status is then derived from capital, creating a more natural and emergent hierarchy.

### 2. Dynamic Norms

Norms are not hardcoded - they emerge from how the group reacts. If everyone approves of "breaking the rules," that becomes the new norm.

### 3. Witness-Based Enforcement

Social pressure requires witnesses. Private actions don't affect social standing as much as public ones.

### 4. Status Affects Influence

Being a leader or outcast has mechanical effects (gossip credibility), creating meaningful gameplay consequences.

### 5. Periodic Recalculation

Status doesn't change instantly - it's recalculated every 20 turns, preventing rapid status fluctuations.

## Usage Examples

### Updating Capital Directly

```javascript
LC.HierarchyEngine.updateCapital('Ashley', {
  type: 'NORM_VIOLATION',
  normStrength: 0.8,
  witnessCount: 5
});
// Ashley loses ~13 capital (10 × 0.8 × 2)
```

### Checking Status

```javascript
const status = LC.HierarchyEngine.getStatus('Ashley');
// Returns: 'leader', 'member', or 'outcast'
```

### Getting Norm Strength

```javascript
const strength = LC.NormsEngine.getNormStrength('betrayal');
// Returns: 0.5 (default) or current strength [0-1]
```

## Integration Points for Future Development

### 1. NormsEngine Event Processing (Planned but not fully integrated)

The `NormsEngine.processEvent()` function is implemented but requires explicit calls with witness data:

```javascript
// To be called after major relationship events
LC.NormsEngine.processEvent({
  type: 'betrayal',
  actor: 'Ashley',
  target: 'Max',
  witnesses: ['Chloe', 'Leo'],
  relationsBefore: { 'Chloe': { 'Ashley': 60 } }
});
```

**Integration Opportunity**: Auto-detect witnesses from nearby characters in scene tracking.

### 2. LivingWorld Decision Weighting (Not Implemented)

As described in the problem statement, NPCs could factor in social pressure when making decisions:

```javascript
// Potential enhancement
const chanceOfAction = baseChance 
  * character.social.conformity 
  * normStrength;
```

**Current State**: Capital is updated after actions, but doesn't influence decision-making yet.

### 3. RelationsEngine Outcast Penalties (Not Implemented)

Attempting to befriend an outcast could cost social capital:

```javascript
// Potential enhancement
if (targetStatus === 'outcast') {
  LC.HierarchyEngine.updateCapital(actor, {
    type: 'NEGATIVE_ACTION'
  });
}
```

**Current State**: No penalty for associating with outcasts.

## Performance Considerations

- **Norm Storage**: Norms are stored per-type, not per-instance, minimizing memory
- **Status Recalculation**: Only runs every 20 turns, O(n log n) where n = active characters
- **Capital Updates**: O(1) operation, no iteration required
- **Context Caching**: STATUS tags respect the stateVersion cache invalidation system

## Backward Compatibility

All changes are additive:
- New `L.society` object auto-initializes
- New `character.social` object auto-initializes
- Existing systems continue to function without Social Engine
- No breaking changes to existing data structures

## Future Enhancements

1. **Norm Archetypes**: Pre-defined norm sets for different groups (school, gang, corporate)
2. **Reputation Recovery**: Mechanisms for outcasts to regain status
3. **Cliques**: Sub-groups with their own norms and hierarchies
4. **Social Events**: Special events triggered by status changes
5. **Conformity Pressure**: High-conformity characters automatically follow strong norms

## Success Metrics

✅ All 27 tests passing
✅ All existing tests still passing (validate_social_architecture, test_crucible, test_living_world)
✅ Demo shows complete workflow from equal start to leader/outcast differentiation
✅ Integration with 4 major systems (LivingWorld, GossipEngine, UnifiedAnalyzer, Context)
✅ Zero breaking changes to existing functionality

## Conclusion

The Social Engine successfully implements the architecture described in the issue. Characters now exist in a living social environment where:

- **Norms** emerge from group reactions
- **Hierarchy** forms based on conformity and actions
- **Status** has mechanical effects on influence
- **Pressure** creates meaningful social consequences

This transforms NPCs from isolated individuals into members of a society, adding a crucial layer of realism to the simulation.
