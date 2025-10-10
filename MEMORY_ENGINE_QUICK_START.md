# Memory Engine Quick Start Guide

## What is the Memory Engine?

The Memory Engine transforms significant events into cultural myths that shape the collective identity of Lincoln Heights. Events that would normally be forgotten become legendary stories that influence future characters and behavior.

## Key Concepts

### 1. Formative Events
Major events that shape culture:
- Relationship changes >80 points (heroic rescues, major betrayals)
- First leader status assignment
- Significant goal achievements

### 2. Mythologization
Events older than 50 turns transform into abstract myths:
- Concrete details fade (names, locations, specific actions)
- Moral lessons remain (trust, loyalty, achievement, leadership)
- Heroes become legendary figures
- Strength reflects cultural impact (0.7-1.0)

### 3. Cultural Influence
Myths actively shape behavior:
- New characters inherit cultural values (personality traits adjusted)
- Social norms strengthened by relevant myths (+20% boost)
- AI receives zeitgeist context tag describing culture

## How It Works

### Automatic Archiving
When major events occur, they're automatically saved:
```javascript
// This happens automatically in Crucible.analyzeEvent()
if (relationshipChange > 80) {
  // Event is archived to L.society.myths
}
```

### Automatic Mythologization
Every 100 turns, old events become myths:
```javascript
// This happens automatically in LC.incrementTurn()
if (L.turn % 100 === 0) {
  LC.MemoryEngine.runMythologization();
}
```

### Automatic Cultural Influence
New characters automatically reflect culture:
```javascript
// This happens automatically in updateCharacterActivity()
// If strong loyalty myths exist:
character.personality.trust = 0.68; // instead of 0.5
```

## Checking Current Myths

```javascript
const L = LC.lcInit();

// See all myths
console.log(L.society.myths);

// Get dominant myth (defines zeitgeist)
const dominant = LC.MemoryEngine.getDominantMyth();
console.log(dominant);
// Output: { theme: 'loyalty_rescue', hero: 'Максим', moral: 'защищать друзей — правильно', strength: 0.9 }

// Check myth strength for a theme
const loyaltyStrength = LC.MemoryEngine.getMythStrengthForTheme('loyalty_rescue');
console.log(loyaltyStrength); // 0.9
```

## Examples

### Example 1: Hero's Journey
```
Turn 10: Максим rescues Хлоя from bully
         → Event archived (loyalty_rescue theme)
         
Turn 60: Event becomes myth
         → Myth created: "защищать друзей — правильно"
         → Strength: 0.85
         
Turn 65: New student София arrives
         → Her trust starts at 0.67 (boosted from 0.5)
         → Culture of loyalty influences her personality
```

### Example 2: Leadership Legacy
```
Turn 20: Виктор becomes first leader
         → Event archived (leadership theme)
         
Turn 70: Event becomes myth
         → Myth created: "лидеры заслуживают уважения"
         → Strength: 0.85
         
Turn 75: AI generates story
         → Context includes: ⟦ZEITGEIST⟧ В этой школе лидеры задают тон и пользуются уважением.
         → AI writes story respecting leadership culture
```

## Myth Themes

| Theme | Trigger | Moral | Effect |
|-------|---------|-------|--------|
| loyalty_rescue | Relationship +80+ | "защищать друзей — правильно" | New chars: +trust |
| betrayal | Relationship -80+ | "предательство недопустимо" | New chars: -trust |
| achievement | Goal success | "упорство ведёт к успеху" | Neutral baseline |
| leadership | First leader | "лидеры заслуживают уважения" | Neutral baseline |

## Zeitgeist Messages

The dominant myth creates a cultural atmosphere:

- **loyalty_rescue**: "В этой школе героев уважают, а предателей презирают."
- **betrayal**: "В этой школе доверие трудно заработать и легко потерять."
- **achievement**: "В этой школе ценят упорство и достижения."
- **leadership**: "В этой школе лидеры задают тон и пользуются уважением."

These appear as `⟦ZEITGEIST⟧` tags in the AI context, guiding narrative generation.

## Testing

### Run Tests
```bash
node tests/test_memory_engine.js
```

### Run Demo
```bash
node demo_memory_engine.js
```

## Integration with Other Systems

### With Crucible (Character Evolution)
- Same events that evolve personality also create myths
- Personal growth and cultural memory happen together

### With Social Engine
- Myths strengthen social norms
- Cultural memory reinforces group behavior

### With Context System
- Dominant myth becomes zeitgeist
- AI receives cultural framing automatically

## Advanced Usage

### Manual Myth Creation (Not Recommended)
While the system is fully automatic, you can manually add myths if needed:
```javascript
L.society.myths.push({
  type: 'myth',
  theme: 'custom_theme',
  hero: 'CharacterName',
  moral: 'Your moral lesson',
  strength: 0.8,
  createdTurn: L.turn,
  originalTurn: L.turn - 100
});
```

### Clearing Myths (Testing Only)
```javascript
L.society.myths = [];
```

### Forcing Mythologization (Testing Only)
```javascript
LC.MemoryEngine.runMythologization();
```

## Performance

- **Memory**: Max 20 myths stored (auto-pruned)
- **CPU**: Mythologization runs only every 100 turns
- **Cache**: Context overlay cached, no repeated computation

## Troubleshooting

### Myths not appearing?
1. Check if formative events occurred (relation change >80)
2. Wait 50+ turns after event
3. Wait for turn divisible by 100 (mythologization trigger)

### New characters not influenced?
1. Check if myths exist: `L.society.myths`
2. Verify myth strength: `LC.MemoryEngine.getMythStrengthForTheme('loyalty_rescue')`
3. Effect is subtle: trust changes by ±0.15-0.2 max

### Zeitgeist not in context?
1. Check if myths exist
2. Verify dominant myth: `LC.MemoryEngine.getDominantMyth()`
3. Context cache may be stale, will refresh on state change

## Best Practices

1. **Let it happen naturally** - Don't force myth creation
2. **Major events only** - Only >80 point changes create myths
3. **Give it time** - Myths form after 50 turns, influence builds gradually
4. **Trust the system** - Cultural influence is subtle but persistent

## Next Steps

See `MEMORY_ENGINE_IMPLEMENTATION_SUMMARY.md` for technical details.

Run `demo_memory_engine.js` for an interactive demonstration.
