# Social Architecture Feature - Quick Start Guide

## Overview

The Social Architecture feature transforms the Lincoln narrative engine from a "theater stage in the void" into a living world with background population, intelligent character introductions, and smart character lifecycle management.

## Quick Test

Run the validation script to verify the feature is working:

```bash
node validate_social_architecture.js
```

Expected output:
```
✅ Population initialized
✅ Character has type field
✅ Character has status field
...
🎉 Social Architecture feature is fully operational!
```

## Demo

Run the interactive demo to see all features in action:

```bash
node demo_character_lifecycle.js
```

This demonstrates:
- Character creation and tracking
- Demographic pressure detection
- Character promotion, freezing, and unfreezing
- Character deletion
- Context overlay integration

## Running Tests

Run the comprehensive test suite:

```bash
node test_character_lifecycle.js
```

All 11 tests should pass:
- Population initialization
- Character creation with type/status
- Character promotion (EXTRA → SECONDARY)
- Character freezing (SECONDARY → FROZEN)
- Character unfreezing (FROZEN → ACTIVE)
- Character deletion
- Context filtering
- Demographic pressure detection

## Core Features

### 1. Population System

Virtual background population that provides context:

```javascript
L.population = {
  unnamedStudents: 50,
  unnamedTeachers: 5
}
```

Appears in context as:
```
⟦WORLD⟧ В школе учится около 50 других учеников и работает 5 учителей.
```

### 2. Demographic Pressure

Intelligently suggests when new characters should be introduced:

**Loneliness Detection:**
- Trigger: Single active character + isolation keywords
- Output: `⟦SUGGESTION⟧ {Character} один. Возможно, он с кем-то столкнется.`

**Expert Detection:**
- Trigger: Task requiring specialized skills
- Output: `⟦SUGGESTION⟧ Нужен {expert type}.`

### 3. Character Categorization

Characters are automatically categorized:

- **EXTRA**: Background characters (default)
- **SECONDARY**: Supporting characters (promoted automatically)
- **CORE**: Main protagonists (manual)

### 4. Character Lifecycle

Characters have states managed automatically:

- **ACTIVE**: Included in context, actively participating
- **FROZEN**: Preserved in memory but excluded from context

**Lifecycle Rules:**

1. **Promotion**: EXTRA → SECONDARY when mentioned >5 times in first 50 turns
2. **Freezing**: SECONDARY → FROZEN after 100 turns of inactivity
3. **Unfreezing**: FROZEN → ACTIVE automatically when mentioned
4. **Deletion**: EXTRA with ≤2 mentions and >200 turns inactive

## Usage Examples

### Example 1: Character Creation

```javascript
// Character is automatically created with type and status
LC.updateCharacterActivity("Алекс пришел в школу", false);

// Result:
L.characters['Алекс'] = {
  mentions: 1,
  lastSeen: 1,
  firstSeen: 1,
  type: 'EXTRA',      // Default
  status: 'ACTIVE',   // Default
  reputation: 50
}
```

### Example 2: Character Promotion

```javascript
// After 6 mentions in first 50 turns:
L.turn = 40;
LC.CharacterGC.run();

// Result:
L.characters['Алекс'].type === 'SECONDARY'  // Promoted!
```

### Example 3: Character Freezing

```javascript
// After 100 turns of inactivity:
L.turn = 200;
LC.CharacterGC.run();

// Result:
L.characters['Алекс'].status === 'FROZEN'  // Preserved but off-stage
```

### Example 4: Character Unfreezing

```javascript
// Mention frozen character:
LC.updateCharacterActivity("Алекс вернулся", false);

// Result:
L.characters['Алекс'].status === 'ACTIVE'  // Back in the narrative!
```

### Example 5: Demographic Pressure

```javascript
// Analyze text for character introduction opportunities:
LC.DemographicPressure.analyze("Максим сидел один в пустом классе.");

// Result:
const suggestions = LC.DemographicPressure.getSuggestions();
// ['⟦SUGGESTION⟧ Максим один. Возможно, он с кем-то столкнется.']
```

## Integration Points

### With UnifiedAnalyzer

DemographicPressure is automatically called during text analysis:

```javascript
LC.UnifiedAnalyzer.analyze(text, actionType);
// Calls LC.DemographicPressure.analyze(text) internally
```

### With Context Overlay

Population and suggestions automatically appear in context:

```javascript
const overlay = LC.composeContextOverlay({ limit: 2000 });
// Includes:
// - ⟦WORLD⟧ population context (weight: 200, low priority)
// - ⟦SUGGESTION⟧ demographic suggestions (weight: 760, high priority)
```

### With Output Processing

CharacterGC runs automatically every 50 turns:

```javascript
// In Output.txt, after text analysis:
if (L.turn % 50 === 0) {
  LC.CharacterGC.run();
}
```

## Configuration

All configuration is automatic, but you can adjust:

### Population Size

```javascript
L.population.unnamedStudents = 100;  // More students
L.population.unnamedTeachers = 10;   // More teachers
```

### Character Type (Manual)

```javascript
// Promote important character to CORE
L.characters['Максим'].type = 'CORE';
```

### Character Status (Manual Freeze)

```javascript
// Manually freeze a character
L.characters['Временный'].status = 'FROZEN';
```

## Performance

- **Memory**: ~100 bytes per feature
- **CPU**: O(n) every 50 turns for GC, O(p) per turn for demographic analysis
- **Context**: Population ~100 chars, suggestions variable
- **Impact**: Minimal, designed for efficiency

## Backward Compatibility

✅ Fully backward compatible  
✅ Existing characters get type/status fields automatically  
✅ No breaking changes to existing functionality  
✅ All existing tests pass

## Documentation

- **SYSTEM_DOCUMENTATION.md**: Section 3.9 - Complete API documentation
- **SOCIAL_ARCHITECTURE_SUMMARY.md**: Comprehensive implementation details
- **This file**: Quick start guide

## Troubleshooting

### Character not being promoted?

Check that:
- Character has >5 mentions
- Within first 50 turns since creation
- CharacterGC has run (every 50 turns)

### Demographic suggestions not appearing?

Check that:
- Character is active (lastSeen within 3 turns)
- Text contains trigger keywords
- Context cache is cleared (`LC._contextCache = {}`)

### Character deletion unexpected?

Characters are only deleted if:
- Type is EXTRA
- Mentions ≤ 2
- Not seen for >200 turns

SECONDARY and CORE characters are never deleted.

## Support

For issues or questions:
1. Run `node validate_social_architecture.js` to verify installation
2. Check `SYSTEM_DOCUMENTATION.md` Section 3.9 for API details
3. Review `SOCIAL_ARCHITECTURE_SUMMARY.md` for implementation details
4. Examine `demo_character_lifecycle.js` for usage examples

---

**Feature Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: 2025-10-10
