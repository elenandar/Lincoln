# Engines 2.0 Quick Reference

Quick reference guide for using RelationsEngine 2.0 and GoalsEngine 2.0.

## RelationsEngine 2.0 - Multi-Vector Relations

### Get Relationship

```javascript
// Get full relationship (number or object)
const rel = LC.RelationsEngine.getRelation('Alice', 'Bob');

// Get specific vector
const trust = LC.RelationsEngine.getVector('Alice', 'Bob', 'trust');
const affection = LC.RelationsEngine.getVector('Alice', 'Bob', 'affection');
const respect = LC.RelationsEngine.getVector('Alice', 'Bob', 'respect');
const rivalry = LC.RelationsEngine.getVector('Alice', 'Bob', 'rivalry');
```

### Update Relationship

```javascript
// Legacy numeric update (backward compatible)
LC.RelationsEngine.updateRelation('Alice', 'Bob', 10);  // +10 to relation

// Multi-vector update
LC.RelationsEngine.updateRelation('Alice', 'Bob', {
  affection: 5,   // +5 affection
  trust: 10,      // +10 trust
  respect: -3,    // -3 respect
  rivalry: 2      // +2 rivalry
});
```

### Vector Ranges

All vectors use 0-100 scale:
- **0-30**: Low (холодны, не доверяют, не уважают)
- **30-50**: Neutral
- **50-70**: Positive (дружелюбны, доверяют, уважают)
- **70-100**: High (близки, полностью доверяют, глубоко уважают)

### Event Type Mappings

| Event | Affection | Trust | Respect | Rivalry |
|-------|-----------|-------|---------|---------|
| Romance | +12 | +8 | +5 | -3 |
| Conflict | -8 | -5 | +2 | +7 |
| Betrayal | -20 | -25 | -10 | +15 |
| Loyalty | +8 | +12 | +5 | -5 |

---

## GoalsEngine 2.0 - Hierarchical Plans

### Create Goal with Plan

```javascript
// Automatic (via analyze)
LC.GoalsEngine.analyze("Максим хочет найти улики.", "output");
// Creates goal with auto-generated plan

// Manual
const goalKey = `${character}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
L.goals[goalKey] = {
  character: character,
  text: goalText,
  status: "active",
  turnCreated: L.turn,
  plan: LC.GoalsEngine.generateBasicPlan(goalText),
  planProgress: 0
};
```

### Update Plan Progress

```javascript
// Mark current step as in-progress
LC.GoalsEngine.updatePlanProgress(goalKey, 'in-progress');

// Complete current step (advances to next)
LC.GoalsEngine.updatePlanProgress(goalKey, 'complete');
```

### Plan Templates

Plans are auto-generated based on keywords:

**Investigation** (найти, узнать, раскрыть):
1. Собрать первоначальную информацию
2. Проверить источники
3. Сделать вывод

**Competition** (победить, соревнование):
1. Подготовиться
2. Выполнить основное действие
3. Добиться результата

**Achievement** (стать, добиться):
1. Начать работу над целью
2. Достичь промежуточного прогресса
3. Завершить достижение

**Help** (помочь, поддержать):
1. Определить, что нужно
2. Предпринять действие

**Generic** (fallback):
1. Начать работу
2. Продолжить усилия
3. Достичь цели

### Goal Structure

```javascript
{
  character: "Максим",
  text: "найти улики",
  status: "active",      // or "completed", "failed"
  turnCreated: 10,
  plan: [
    { text: "Step 1", status: "complete" },
    { text: "Step 2", status: "in-progress" },
    { text: "Step 3", status: "pending" }
  ],
  planProgress: 1        // Current step index (0-based)
}
```

---

## Context Overlay Display

### Relations

**Numeric (legacy):**
```
⟦RELATION⟧ Alice и Bob — хорошие друзья
```

**Multi-vector:**
```
⟦RELATION⟧ Alice и Bob — близки, доверяют, уважают
⟦RELATION⟧ Charlie и Diana — холодны, не доверяют, соперничают
```

### Goals

**Without plan:**
```
⟦GOAL⟧ Цель Максим: найти улики
```

**With plan:**
```
⟦GOAL⟧ Цель Максим: найти улики [Шаг 2/3: Проверить источники]
```

---

## LivingWorld Integration

### Goal Pursuit

```javascript
LC.LivingWorld.generateFact(characterName, {
  type: 'PURSUE_GOAL',
  goal: goalObject,
  goalKey: goalKey
});
```

**Progress Logic:**
- Each pursuit adds 0.25 to progress
- After 4 pursuits (progress = 1.0):
  - Current step marked 'complete'
  - Advances to next step
  - Progress resets to 0
- When all steps complete:
  - Goal status → 'completed'

### Social Interactions

```javascript
// Positive interaction
LC.LivingWorld.generateFact(characterName, {
  type: 'SOCIAL_POSITIVE',
  target: otherCharacter,
  mood: 'HAPPY'  // Optional: affects intensity
});

// Negative interaction
LC.LivingWorld.generateFact(characterName, {
  type: 'SOCIAL_NEGATIVE',
  target: otherCharacter,
  mood: 'ANGRY'  // Optional: affects intensity
});
```

**Modifier Calculation:**
- Base positive: +5
- Base negative: -5
- HAPPY/EXCITED mood: +8
- ANGRY/FRUSTRATED mood: -10

---

## Backward Compatibility

### Old Code Still Works

```javascript
// These all work unchanged:
L.evergreen.relations['Alice']['Bob'] = 50;
const rel = L.evergreen.relations['Alice']['Bob'];

L.goals['key'] = {
  character: 'Alice',
  text: 'goal text',
  status: 'active',
  turnCreated: 10
  // No plan - still valid
};
```

### Mixed Systems

```javascript
// Some relations numeric, some multi-vector - both work!
L.evergreen.relations['Alice']['Bob'] = 50;  // Numeric
L.evergreen.relations['Charlie']['Diana'] = { affection: 70, trust: 60, ... };  // Multi-vector

// Query both with same API
const aliceTrust = LC.RelationsEngine.getVector('Alice', 'Bob', 'trust');  // Derived from 50
const charlieTrust = LC.RelationsEngine.getVector('Charlie', 'Diana', 'trust');  // From object
```

---

## Common Patterns

### Check Relationship Quality

```javascript
const trust = LC.RelationsEngine.getVector(char1, char2, 'trust');
if (trust > 70) {
  // High trust - character will share secrets
} else if (trust < 30) {
  // Low trust - character will be suspicious
}
```

### Track Goal Progress

```javascript
const goal = L.goals[goalKey];
if (goal.plan && goal.planProgress < goal.plan.length) {
  const currentStep = goal.plan[goal.planProgress];
  console.log(`Working on: ${currentStep.text} (${currentStep.status})`);
}
```

### Complex Relationship

```javascript
// Characters who respect each other but are rivals
LC.RelationsEngine.updateRelation('Alice', 'Bob', {
  affection: 0,    // No friendship
  trust: 5,        // Slight distrust
  respect: 15,     // Admiration for skills
  rivalry: 20      // Strong competition
});
```

---

## Troubleshooting

### "Relation is null"
Make sure relation exists before querying. Use `getVector()` which returns 50 (neutral) for missing relations.

### "Plan is undefined"
Old goals don't have plans. Check `if (goal.plan)` before accessing.

### "Values out of range"
`updateRelation()` automatically clamps to valid ranges (numeric: -100 to 100, vectors: 0 to 100).

### "Changes not persisting"
Make sure to use helper functions instead of direct state manipulation:
```javascript
// ❌ Don't do this
L.evergreen.relations[char1][char2] = value;

// ✓ Do this
LC.RelationsEngine.updateRelation(char1, char2, value);
```

---

## Performance Tips

1. **Batch updates**: Update multiple vectors in one call
2. **Use getVector()**: Faster than getting full relation and extracting
3. **Cache results**: If checking same relation multiple times in one turn
4. **Plan size**: Keep plans to 3-5 steps for best narrative pacing

---

## Further Reading

- `ENGINES_2.0_IMPLEMENTATION.md` - Complete technical documentation
- `SYSTEM_DOCUMENTATION.md` - Overall system architecture
- `tests/test_relations_2.0.js` - Working examples of relation features
- `tests/test_goals_2.0.js` - Working examples of goal features
