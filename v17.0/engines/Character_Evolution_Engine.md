## 6. Character Evolution Engine (The Crucible)

### Философия Дизайна

Crucible Engine решает проблему статичных персонажей: **опыт должен изменять людей, а не только их настроение**. В реальной жизни предательство, триумф, травма оставляют постоянные отметины на личности. Этот движок моделирует эволюцию характера через формативные события, превращая реакции в судьбу. Он отвечает на вопрос: **каким человеком меня сделали эти события?** Расширение Self-Concept добавляет второй слой: **каким человеком я себя теперь считаю?**

### 6.1 Philosophy: From Behavior to Destiny

The Crucible represents the final tier of NPC simulation in Lincoln. While other engines simulate reactions, moods, and autonomous actions, **The Crucible simulates evolution**. It answers the fundamental question: *How do formative experiences change who a character fundamentally is?*

**Core Principle:** NPCs should not just react to events—they should be transformed by them. Betrayal, triumph, and trauma leave permanent marks on personality, not just temporary mood changes.

### 6.2 Personality Core

Each character has a `personality` object with four core traits, each ranging from 0.0 to 1.0:

#### Trait Definitions

**trust** (Доверчивость)
- **Low (< 0.3):** Cynical, paranoid, assumes the worst
- **Medium (0.3-0.7):** Balanced, cautious optimism
- **High (> 0.7):** Naive, trusting, easily manipulated

**bravery** (Смелость)
- **Low (< 0.3):** Timid, risk-averse, afraid of conflict
- **Medium (0.3-0.7):** Balanced, calculated risks
- **High (> 0.7):** Bold, reckless, seeks danger

**idealism** (Идеализм)
- **Low (< 0.3):** Pragmatic, cynical, "ends justify means"
- **Medium (0.3-0.7):** Balanced worldview
- **High (> 0.7):** Idealistic, believes in justice and good

**aggression** (Агрессивность)
- **Low (< 0.2):** Peaceful, conflict-avoidant
- **Medium (0.2-0.7):** Normal assertiveness
- **High (> 0.7):** Hostile, confrontational, quick to anger

#### Default Values

New characters start with neutral, balanced traits:
```javascript
personality: {
  trust: 0.5,       // Balanced trust
  bravery: 0.5,     // Balanced courage
  idealism: 0.5,    // Balanced worldview
  aggression: 0.3   // Slightly below average (most people aren't aggressive)
}
```

### 6.3 Formative Events (The Catalyst)

Not all events trigger personality evolution. Only **formative events**—those with sufficient emotional intensity—can fundamentally change a character.

#### Event Types and Triggers

**RELATION_CHANGE** (from RelationsEngine)
- **Betrayal:** Relationship drops by ≥40 points
  - Effect: Decreases `trust` by 0.2, `idealism` by 0.1
  - Message: "X пережил(а) предательство и стал(а) менее доверчив(ой)."
  
- **Heroic Rescue:** Relationship increases by ≥40 points
  - Effect: Increases `trust` by 0.15, `bravery` by 0.1
  - Message: "X был(а) спасен(а) и стал(а) более смел(ой) и доверчив(ой)."
  
- **Extreme Hatred:** Final relationship value < -70
  - Effect: Increases `aggression` by 0.1
  - No message (subtle change)

**GOAL_COMPLETE** (from GoalsEngine)
- **Success:** Major goal achieved
  - Effect: Increases `bravery` by 0.1, `idealism` by 0.05
  - Message: "X достиг(ла) важной цели и стал(а) более смел(ой)."
  
- **Failure:** Major goal failed
  - Effect: Decreases `idealism` by 0.1
  - No message (internalized disappointment)

**RUMOR_SPREAD** (from GossipEngine)
- **Widespread Negative Gossip:** Rumor spread to ≥5 people with negative spin
  - Effect: Decreases `trust` by 0.1, increases `aggression` by 0.05
  - Message: "X стал(а) более замкнут(ой) из-за слухов."

#### Importance Filter

Only **MAIN** and **SECONDARY** characters experience significant personality evolution. **EXTRA** characters remain static to reduce computational complexity and narrative noise.

### 6.4 Integration Points

The Crucible is automatically invoked by other engines when significant events occur:

#### RelationsEngine Integration

After updating relationship values in `RelationsEngine.analyze()`:
```javascript
LC.Crucible.analyzeEvent({
  type: 'RELATION_CHANGE',
  character: char1,
  otherCharacter: char2,
  change: modifier,        // The relationship change amount
  finalValue: newValue     // The final relationship value
});
```

Also integrated in `LivingWorld.generateFact()` for SOCIAL_POSITIVE and SOCIAL_NEGATIVE actions.

#### GoalsEngine Integration (Planned)

When a goal is marked complete or failed:
```javascript
LC.Crucible.analyzeEvent({
  type: 'GOAL_COMPLETE',
  character: goalOwner,
  success: true/false
});
```

#### GossipEngine Integration (Planned)

When a rumor reaches maximum spread:
```javascript
LC.Crucible.analyzeEvent({
  type: 'RUMOR_SPREAD',
  character: rumorSubject,
  spreadCount: knownByCount,
  spin: 'positive'/'negative'/'neutral'
});
```

### 6.5 Influence on World Systems

Personality traits actively modify NPC behavior across multiple systems:

#### Context Overlay (composeContextOverlay)

Personality traits appear as ⟦TRAITS⟧ tags with priority 730 (between SECRETS and MOOD):

```
⟦TRAITS: Борис⟧ циничен и не доверяет людям, агрессивен и конфликтен
⟦TRAITS: Анна⟧ наивен и открыт, смел и готов рисковать
```

**Priority:** 730 (placed between SECRETS at 740 and MOOD at 725)

Only appears for **HOT** characters (in current scene focus).

#### LivingWorldEngine Integration (Planned)

In `simulateCharacter()`, personality traits will weight action probabilities:

```javascript
// Example: Low trust reduces chance of positive social actions
const chanceOfSocialPositive = 0.5 * character.personality.trust;

// Example: High aggression increases chance of negative actions
const chanceOfSocialNegative = 0.3 * (1 + character.personality.aggression);
```

#### RelationsEngine Modifiers (Planned)

Personality affects how relationships change:

```javascript
// Example: Low trust slows relationship improvement
const finalChange = baseChange * (0.8 + 0.4 * character.personality.trust);

// Example: High aggression amplifies negative interactions
if (eventType === 'conflict') {
  modifier *= (1 + 0.3 * character.personality.aggression);
}
```
