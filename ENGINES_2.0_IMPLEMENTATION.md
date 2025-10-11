# RelationsEngine 2.0 & GoalsEngine 2.0 Implementation Summary

## Overview

This document describes the implementation of multi-vector relationships and hierarchical goal plans for the Lincoln simulation system, as specified in the "Epic: Refactor Core Engines for Social Fabric Integration" issue.

## RelationsEngine 2.0: Multi-Vector Relationships

### Motivation

The previous scalar relationship system (single -100 to +100 value) was too simplistic for deep social simulation. Real relationships are multifaceted - you can trust someone without liking them, or respect a rival.

### Architecture

#### Data Structure

Relationships can now be stored in two formats:

**Legacy Format (Backward Compatible):**
```javascript
L.evergreen.relations['Alice']['Bob'] = 50  // Numeric value -100 to 100
```

**Multi-Vector Format (New):**
```javascript
L.evergreen.relations['Alice']['Bob'] = {
  affection: 70,   // 0-100: How much Alice likes Bob
  trust: 65,       // 0-100: How much Alice trusts Bob
  respect: 80,     // 0-100: How much Alice respects Bob
  rivalry: 20      // 0-100: Competitive feelings toward Bob
}
```

#### Vector Semantics

- **Affection** (0-100): Emotional warmth, liking, friendship
- **Trust** (0-100): Reliability, confidence in the other's intentions
- **Respect** (0-100): Admiration, recognition of capabilities/achievements
- **Rivalry** (0-100): Competitive feelings, desire to outperform

### API Functions

#### `RelationsEngine.getRelation(char1, char2)`
Returns the relationship value between two characters (number or object).

```javascript
const rel = LC.RelationsEngine.getRelation('Alice', 'Bob');
// Returns: 50 (numeric) or { affection: 70, trust: 65, ... } (object)
```

#### `RelationsEngine.getVector(char1, char2, vector)`
Gets a specific vector value. Automatically derives vectors from numeric relations.

```javascript
const trust = LC.RelationsEngine.getVector('Alice', 'Bob', 'trust');
// Returns: 65 (for multi-vector) or derived value (for numeric)
```

#### `RelationsEngine.updateRelation(char1, char2, change)`
Updates relationship values. Accepts numeric or object changes.

```javascript
// Legacy numeric update
LC.RelationsEngine.updateRelation('Alice', 'Bob', 10);

// Multi-vector update
LC.RelationsEngine.updateRelation('Alice', 'Bob', {
  affection: 5,
  trust: 10,
  respect: -3
});
```

### Event Type Mappings

Different interaction types affect vectors differently:

| Event Type | Affection | Trust | Respect | Rivalry |
|------------|-----------|-------|---------|---------|
| Romance    | +12       | +8    | +5      | -3      |
| Conflict   | -8        | -5    | +2      | +7      |
| Betrayal   | -20       | -25   | -10     | +15     |
| Loyalty    | +8        | +12   | +5      | -5      |

### Context Overlay Integration

The context overlay now displays nuanced relationship descriptions:

**Legacy Format:**
```
⟦RELATION⟧ Alice и Bob — хорошие друзья
```

**Multi-Vector Format:**
```
⟦RELATION⟧ Alice и Bob — близки, доверяют, уважают
```

### Backward Compatibility

- All existing code using numeric relations continues to work
- Numeric relations automatically derive vector values when queried
- Mixed systems (some numeric, some multi-vector) work correctly
- Automatic conversion from numeric to multi-vector when vector update is applied

### Integration Points

#### LivingWorld Engine
- Uses `updateRelation()` for SOCIAL_POSITIVE and SOCIAL_NEGATIVE actions
- Supports both numeric and multi-vector relation checks
- Mood affects relationship change magnitude

#### Crucible Engine
- Receives vectorChange in RELATION_CHANGE events
- Can use vector changes for more nuanced personality evolution
- Falls back to numeric change if vectors not available

#### HierarchyEngine
- Social capital updates work with both relation types
- Trust vector can be used for credibility checks

---

## GoalsEngine 2.0: Hierarchical Goal Plans

### Motivation

Simple text-based goals ("найти улики") don't capture the complexity of achieving objectives. Real goals require plans with multiple steps.

### Architecture

#### Data Structure

Goals now include a plan array with subtasks:

**Legacy Format (Backward Compatible):**
```javascript
L.goals['goalKey'] = {
  character: 'Максим',
  text: 'найти улики',
  status: 'active',
  turnCreated: 10
}
```

**Hierarchical Format (New):**
```javascript
L.goals['goalKey'] = {
  character: 'Максим',
  text: 'найти улики против директора',
  status: 'active',
  turnCreated: 10,
  plan: [
    { text: 'Собрать первоначальную информацию', status: 'pending' },
    { text: 'Проверить источники', status: 'in-progress' },
    { text: 'Сделать вывод', status: 'pending' }
  ],
  planProgress: 1  // Currently on step index 1
}
```

#### Step Status Values
- `'pending'` - Not yet started
- `'in-progress'` - Currently working on this step
- `'complete'` - Step finished

### API Functions

#### `GoalsEngine.generateBasicPlan(goalText)`
Generates a plan with subtasks based on goal keywords.

```javascript
const plan = LC.GoalsEngine.generateBasicPlan('найти улики');
// Returns: [
//   { text: 'Собрать первоначальную информацию', status: 'pending' },
//   { text: 'Проверить источники', status: 'pending' },
//   { text: 'Сделать вывод', status: 'pending' }
// ]
```

**Plan Templates by Goal Type:**

| Goal Keywords | Plan Steps |
|---------------|------------|
| найти, узнать, раскрыть | Собрать информацию → Проверить источники → Сделать вывод |
| победить, соревнование | Подготовиться → Выполнить действие → Добиться результата |
| помочь, поддержать | Определить, что нужно → Предпринять действие |
| стать, добиться | Начать работу → Достичь прогресса → Завершить |
| (generic) | Начать работу → Продолжить усилия → Достичь цели |

#### `GoalsEngine.updatePlanProgress(goalKey, status)`
Updates progress through plan steps.

```javascript
// Mark current step as in-progress
LC.GoalsEngine.updatePlanProgress(goalKey, 'in-progress');

// Complete current step and advance
LC.GoalsEngine.updatePlanProgress(goalKey, 'complete');
```

### Context Overlay Integration

Goals now display current step progress:

```
⟦GOAL⟧ Цель Максим: найти улики [Шаг 2/3: Проверить источники]
```

Components:
- Character name
- Goal text
- Current step number / total steps
- Current step description

### LivingWorld Integration

The LivingWorld engine now tracks plan execution:

1. Character pursues goal (PURSUE_GOAL action)
2. Progress counter increments (0.25 per turn)
3. Every 4 work sessions (progress = 1.0):
   - Current step marked 'complete'
   - planProgress advances to next step
   - Progress counter resets to 0
4. When all steps complete:
   - Goal status changes to 'completed'

### Backward Compatibility

- Goals without plans still work correctly
- Context overlay handles missing plan gracefully
- LivingWorld progress tracking works with plan-less goals
- All existing goal detection and storage code unchanged

### Benefits

**For Narrative:**
- More detailed goal tracking visible to AI
- Natural progression through complex objectives
- Better story pacing with milestone steps

**For Simulation:**
- Characters follow logical sequences
- Plan progress can trigger events
- Failed steps can create interesting complications

---

## Testing

### New Test Files

#### `tests/test_relations_2.0.js`
- Helper function existence
- Backward compatibility with numeric relations
- Multi-vector relation support
- Automatic conversion
- Context overlay integration
- Bounds checking (0-100 range)
- Integration with analyze()

**Results:** 8/8 tests passed ✓

#### `tests/test_goals_2.0.js`
- Plan generation functions
- Different goal type templates
- Goal creation with plans
- Plan progress updates
- Context overlay display
- Backward compatibility with plan-less goals
- LivingWorld integration

**Results:** 7/7 tests passed ✓

### Existing Test Validation

All existing tests continue to pass:
- `tests/test_engines.js` ✓
- `tests/test_goals.js` ✓
- `validate_living_world.js` ✓ (25/25 tests)

---

## Migration Guide

### For Existing Systems

**No migration required!** Both engines are fully backward compatible.

### To Adopt New Features

#### Multi-Vector Relations

```javascript
// Start using vector updates instead of numeric
LC.RelationsEngine.updateRelation('Alice', 'Bob', {
  affection: 5,
  trust: 10
});

// Query specific vectors
const trust = LC.RelationsEngine.getVector('Alice', 'Bob', 'trust');
```

#### Hierarchical Goals

Goals created by `GoalsEngine.analyze()` automatically include plans. No code changes needed!

To manually create a goal with a plan:
```javascript
const goalKey = 'char_key123';
L.goals[goalKey] = {
  character: 'Character',
  text: 'goal description',
  status: 'active',
  turnCreated: L.turn,
  plan: LC.GoalsEngine.generateBasicPlan('goal description'),
  planProgress: 0
};
```

---

## Future Enhancements

### RelationsEngine 2.0

1. **Custom Vector Updates**: Allow specific interaction types to define their own vector changes
2. **Asymmetric Relations**: Different vectors for A→B vs B→A
3. **Vector Visualization**: Debug tools to visualize relationship complexity
4. **Relationship Events**: Trigger events when vectors cross thresholds

### GoalsEngine 2.0

1. **Dynamic Plan Generation**: Use AI to generate contextual plans
2. **Plan Branching**: Multiple paths to achieve goals
3. **Sub-goal Dependencies**: Some steps require other goals to complete first
4. **Plan Modification**: Characters adapt plans based on circumstances
5. **Collaborative Goals**: Plans that involve multiple characters

---

## Technical Details

### Performance

- Helper functions add minimal overhead (single object/array lookups)
- Plan generation is template-based (no AI calls)
- Context overlay formatting is efficient string manipulation
- No impact on simulation speed (tested with 100 characters)

### Memory

- Multi-vector relations: ~4x memory vs numeric (4 numbers vs 1)
- Plans: ~3-5 objects per goal (typically 3 steps)
- Both acceptable for typical scenarios (10-50 active goals/relationships)

### Code Changes

**Modified Files:**
- `Library v16.0.8.patched.txt` (~200 lines added/modified)

**New Files:**
- `tests/test_relations_2.0.js` (217 lines)
- `tests/test_goals_2.0.js` (265 lines)

**Total Impact:** ~700 lines of code (including tests and comments)

---

## Conclusion

RelationsEngine 2.0 and GoalsEngine 2.0 successfully implement the vision outlined in the Epic issue while maintaining 100% backward compatibility. The new systems enable deeper, more nuanced simulation while requiring no changes to existing code.

The multi-vector relationship system allows characters to have complex, realistic relationships with multiple dimensions. The hierarchical goal system enables characters to pursue objectives through logical, step-by-step plans that create better narrative pacing and more believable behavior.

Both engines are production-ready, fully tested, and integrated with the existing Lincoln Heights ecosystem.
