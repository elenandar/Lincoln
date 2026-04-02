## 6.5 Qualia Engine (The Phenomenal Core)

### Философия Дизайна

Этот движок был создан для решения фундаментальной проблемы: **симуляция мыслей без симуляции ощущений неполна**. Персонаж — это не просто набор решений и планов; это живое существо с телом, которое испытывает напряжение, усталость, удовольствие и дискомфорт. Qualia Engine создаёт базовый, до-когнитивный слой "внутренней погоды", который окрашивает все последующие ментальные процессы. Он отвечает на вопрос: **как персонаж себя физически чувствует прямо сейчас?**

### Overview

The Qualia Engine represents the **lowest-level layer of consciousness simulation** in Lincoln. While other engines simulate thoughts, decisions, and personality, the Qualia Engine simulates the raw, pre-cognitive, bodily sensations that form the foundation of all experience.

**Core Concept:**
Characters don't just think and decide—they **feel** on a visceral, somatic level. The Qualia Engine tracks four fundamental dimensions of phenomenal experience:

1. **Somatic Tension** (0-1): Muscle/nerve tension, fight-or-flight arousal
2. **Valence** (0-1): Basic affective tone (0=unpleasant, 1=pleasant)
3. **Focus Aperture** (0-1): Breadth of attention (0=tunnel vision, 1=diffuse)
4. **Energy Level** (0-1): Physical energy/wakefulness

These dimensions form a character's "internal weather" that colors all their thoughts and actions.

### Architecture

#### Qualia State Structure

Every character automatically receives a `qualia_state` object on creation:

```javascript
character.qualia_state = {
  somatic_tension: 0.3,  // Мышечное/нервное напряжение [0-1]
  valence: 0.5,          // Базовый аффект (0-неприятно, 1-приятно)
  focus_aperture: 0.7,   // Широта фокуса (0-туннельное зрение, 1-рассеянность)
  energy_level: 0.8      // Уровень энергии/бодрости [0-1]
};
```

**Default Values:**
- `somatic_tension: 0.3` - Slightly relaxed baseline
- `valence: 0.5` - Neutral mood
- `focus_aperture: 0.7` - Moderately broad attention
- `energy_level: 0.8` - Good energy baseline

#### Limbic Resonator: Event-to-Sensation Mapping

The `LC.QualiaEngine.resonate(character, event)` function translates external events into changes in internal sensations **without cognitive interpretation**.

**Event Types and Effects:**

**Social Events:**
```javascript
// Compliment/Praise
valence += 0.1
somatic_tension -= 0.05

// Insult/Criticism
valence -= 0.2
somatic_tension += 0.15

// Threat/Aggression
valence -= 0.25
somatic_tension += 0.3
focus_aperture -= 0.2  // Tunnel vision
```

**Environmental Events:**
```javascript
// Loud Noise
somatic_tension += 0.3
focus_aperture -= 0.2

// Calm/Peaceful
somatic_tension -= 0.1
valence += 0.05
```

**Physical Events:**
```javascript
// Pain/Injury
valence -= 0.3
somatic_tension += 0.4
energy_level -= 0.2

// Rest/Relaxation
somatic_tension -= 0.15
energy_level += 0.1
```

**Achievement Events:**
```javascript
// Success/Progress
valence += 0.15
energy_level += 0.1

// Failure/Setback
valence -= 0.15
energy_level -= 0.15
```

All changes are multiplied by an `intensity` parameter (default 1.0) and clamped to [0, 1].

#### Group Resonance: Emotional Contagion

The `LC.QualiaEngine.runGroupResonance(characterNames, convergenceRate)` function simulates how people in the same space unconsciously synchronize their internal states.

**Mechanism:**
1. Calculate group average for each qualia dimension
2. Move each character's state toward the group average
3. Creates shared "atmosphere" in a room

```javascript
// Example: Tense person enters calm group
// Over time, their tension decreases
// Group's calmness slightly decreases
// Eventually: shared moderate tension level
```

**Convergence Rate:** Default 0.1 (10% movement per cycle)

### Integration Points

#### 1. Automatic Initialization

In `updateCharacterActivity()`, every character receives `qualia_state` on first mention (alongside `personality` and `social`).

#### 2. LivingWorld Engine Integration

When characters perform autonomous actions, the Qualia Engine updates their sensations:

**Social Positive Actions:**
```javascript
// Target receives compliment
LC.QualiaEngine.resonate(targetChar, {
  type: 'social',
  action: 'compliment',
  intensity: modifier / 10
});
```

**Social Negative Actions:**
```javascript
// Target receives insult
LC.QualiaEngine.resonate(targetChar, {
  type: 'social',
  action: 'insult',
  intensity: Math.abs(modifier) / 10
});

// Actor feels aggression
LC.QualiaEngine.resonate(actorChar, {
  type: 'social',
  action: 'aggression',
  intensity: Math.abs(modifier) / 10
});
```

**Goal Pursuit:**
```javascript
// Working on goal creates focused energy
LC.QualiaEngine.resonate(char, {
  type: 'achievement',
  action: 'progress',
  intensity: 0.5
});
```

### Use Cases

#### 1. Pre-Cognitive Foundation

Qualia states influence higher-level systems:
- High `somatic_tension` → defensive decisions
- Low `valence` → pessimistic interpretations
- Low `focus_aperture` → missing social cues
- Low `energy_level` → reduced initiative

#### 2. Atmosphere Simulation

Group resonance creates emergent room dynamics:
- Tense meeting → everyone becomes tenser
- One person's joy spreads to group
- Shared grief in memorial

#### 3. Bodily Grounding

Characters' decisions rooted in visceral experience:
- "I felt sick to my stomach"
- "My heart was pounding"
- "Everything felt fuzzy"

### Technical Implementation

**Core Functions:**

```javascript
LC.QualiaEngine = {
  /**
   * Translates events into sensation changes
   * @param {object} character - Character from L.characters
   * @param {object} event - {type, actor, action, target, intensity}
   */
  resonate(character, event) { /* ... */ },
  
  /**
   * Simulates emotional contagion in groups
   * @param {Array<string>} characterNames - Characters in same location
   * @param {number} convergenceRate - How fast states converge (0-1)
   */
  runGroupResonance(characterNames, convergenceRate = 0.1) { /* ... */ }
};
```

**Bounds Enforcement:**
All qualia values are clamped to [0, 1] after every change to ensure numerical stability.

**Performance:**
- No text generation overhead
- Pure state manipulation
- Minimal computational cost
