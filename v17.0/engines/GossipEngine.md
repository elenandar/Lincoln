### 4.7 Social Simulation (GossipEngine)

#### Overview

The GossipEngine creates a dynamic social ecosystem by tracking rumors, managing character reputations, and simulating gossip spread through character interactions. It consists of two sub-modules: Observer and Propagator.

#### State Structure

**Rumors:**
```javascript
state.lincoln.rumors = [
  {
    id: 'rumor_1234567_abc',
    text: 'Макс поцеловал Хлою',
    type: 'romance',          // romance, conflict, betrayal, achievement
    subject: 'Максим',         // Primary subject
    target: 'Хлоя',            // Secondary subject (optional)
    spin: 'neutral',           // positive, neutral, negative
    turn: 10,                  // When rumor originated
    knownBy: ['Эшли', 'София'], // Characters who know this rumor
    distortion: 0.5,           // Cumulative distortion (0-10+)
    verified: false,           // Whether rumor is confirmed
    status: 'ACTIVE',          // ACTIVE, FADED, or ARCHIVED
    fadedAtTurn: 25            // Turn when status became FADED (optional)
  }
];
```

**Reputation:**
```javascript
state.lincoln.characters['Максим'].reputation = 75; // 0-100 scale
```

#### Observer Sub-Module

**Purpose:** Watches for gossip-worthy events and creates rumors.

**Detected Event Types (Russian-only):**
- **Romance** — Kisses, confessions, romantic interactions
- **Conflict** — Fights, arguments, confrontations
- **Betrayal** — Betrayals, deceptions, cheating
- **Achievement** — Wins, awards, accomplishments
- **Academic Failure** — Bad grades, failed tests
- **Teacher Meeting** — Called to principal, private teacher conversations
- **Truancy** — Skipping class, absence without permission

**Enhanced Interpretation Matrix:**
The Observer applies relationship-based AND mood-based interpretation:
- If witness likes subject → Positive spin
- If witness dislikes subject → Negative spin
- If witness is ANGRY → More aggressive interpretation
- If witness is JEALOUS → Negative spin against subject (especially for romance/achievement)
- Neutral relationships → Neutral spin

**Special Event Interpretations:**
- **Academic Failure:** Friends interpret sympathetically ("учитель его завалил"), others neutrally ("он совсем не учится")
- **Teacher Meeting:** Negative relationships see punishment ("его отчитывали за поведение"), jealous witnesses see favoritism ("он теперь любимчик")
- **Truancy:** Friends see illness ("кажется, он заболел"), others see habit ("он постоянно прогуливает")

**Example:**
```javascript
Text: "Максим получил двойку"
Witnesses: ['Хлоя'] (lastSeen within 2 turns)
Relation: Хлоя→Максим = 50 (friends)
Mood: Хлоя is not jealous/angry
Result: Rumor created with positive spin ("учитель его завалил")
```

#### Propagator Sub-Module

**Purpose:** Spreads rumors between characters and distorts them over time.

**Spread Mechanics:**
- Automatic propagation when characters interact (20% chance)
- Manual propagation via `/rumor spread` command
- 30% chance of distortion with each spread
- Distortion accumulates: +0.5 per spread event

**Reputation Effects:**
Rumors affect character reputation when spread:
- **Romance:** +2 (positive) or -1 (negative)
- **Conflict:** -3
- **Betrayal:** -5
- **Achievement:** +5
- **Distortion penalty:** -floor(distortion)

**Reputation Scale:**
- 80-100: Excellent
- 60-79: Good
- 40-59: Neutral
- 20-39: Poor
- 0-19: Bad

#### Commands

**`/rumor`** — List all active rumors
```
Output:
🗣️ ACTIVE RUMORS (2):
1. [abc123] "Макс поцеловал Хлою..." - Known by 3, Distortion: 0.5
2. [def456] "София победила в соревновании..." - Known by 5, Distortion: 1.0
```

**`/rumor add <text> about <char>`** — Create custom rumor
```
Example: /rumor add secretly dating about Максим
Output: 🗣️ Rumor created: "secretly dating" (ID: rumor_...)
```

**`/rumor spread <id> from <char1> to <char2>`** — Manually spread rumor
```
Example: /rumor spread abc123 from Эшли to София
Output: ✅ Rumor spread from Эшли to София
System (director): 🗣️ Слух распространился: Эшли → София
```

**`/reputation`** — Show all character reputations
```
Output:
⭐ CHARACTER REPUTATIONS:
Максим: 72/100
Хлоя: 85/100
Эшли: 45/100
```

**`/reputation <char>`** — Show specific character's reputation
```
Example: /reputation Максим
Output: ⭐ Максим: 72/100 (Good)
```

**`/reputation set <char> <value>`** — Set reputation manually
```
Example: /reputation set Максим 90
Output: ✅ Reputation set: Максим = 90
```

#### Rumor Lifecycle

**Purpose:** Manages rumor lifecycle to prevent state bloat and maintain performance in long-running games.

**Lifecycle Stages:**

1. **ACTIVE** (Default)
   - Newly created rumors start in this state
   - Can be spread between characters
   - Included in analysis and propagation
   - Transition: When 75% of characters know the rumor → FADED

2. **FADED**
   - Rumor is widely known and no longer spreads
   - Cannot be propagated to new characters
   - Marked with `fadedAtTurn` timestamp
   - Transition: After 50 turns in FADED state → ARCHIVED

3. **ARCHIVED**
   - Rumor is removed from `L.rumors` array
   - Automatically cleaned up by garbage collector
   - Cannot be recovered

**Garbage Collection (GossipGC):**

The `LC.GossipEngine.runGarbageCollection()` function manages the rumor lifecycle:

- **Triggers:**
  - Every 25 turns (`L.turn % 25 === 0`)
  - When rumors array exceeds 100 items (`L.rumors.length > 100`)

- **Process:**
  1. Check each ACTIVE rumor for knowledge threshold (75% of characters)
  2. Mark qualifying rumors as FADED, add `fadedAtTurn` field
  3. Check each FADED rumor for age (50+ turns since fading)
  4. Mark old rumors as ARCHIVED
  5. Filter out all ARCHIVED rumors from array
  6. Log summary to director level

**Configuration:**
```javascript
const KNOWLEDGE_THRESHOLD = 0.75;  // 75% of characters must know
const FADE_AGE_THRESHOLD = 50;     // 50 turns before archival
```

**Example:**
```javascript
// Turn 10: Rumor created (ACTIVE)
rumor = { status: 'ACTIVE', knownBy: ['A'], turn: 10 }

// Turn 15: 75% know it (ACTIVE → FADED)
rumor = { status: 'FADED', knownBy: ['A','B','C'], fadedAtTurn: 15 }

// Turn 65: 50 turns passed (FADED → ARCHIVED → Removed)
// Rumor no longer exists in L.rumors
```

**State Structure:**
```javascript
{
  id: 'rumor_123',
  text: 'Макс поцеловал Хлою',
  status: 'ACTIVE',      // or 'FADED', 'ARCHIVED'
  fadedAtTurn: 25,       // Added when status becomes FADED
  // ... other fields
}
```

#### Integration with Other Systems

**RelationsEngine Integration:**
- Interpretation matrix uses relationship values
- Rumor spread affects relationships indirectly through reputation

**Character Tracking:**
- Only creates rumors about "important" characters (tracked by EvergreenEngine)
- Witnesses must be recently active (lastSeen within 2 turns)

**UnifiedAnalyzer Integration:**
- Automatically called during text analysis
- Observer watches for gossip-worthy events
- Propagator auto-spreads when characters interact

#### Architecture

```
Output/UnifiedAnalyzer
    ↓ Calls: LC.GossipEngine.analyze(text)
Library/GossipEngine
    ↓ Observer.observe() → Detect events, create rumors
    ↓   → applyInterpretationMatrix() → Adjust spin based on relationships
    ↓ Propagator.autoPropagate() → Spread rumors between active characters
    ↓   → spreadRumor() → Add character to knownBy, add distortion
    ↓   → updateReputation() → Modify subject's reputation
Library/RelationsEngine
    ↓ Read relationship values for interpretation
Library/EvergreenEngine
    ↓ Validate character importance
Context
    → Reputation affects character perception
```

#### Practical Examples

**Example 1: Rumor Generation with Interpretation**

```
Input: "Максим поцеловал Хлою в библиотеке."
Active Characters: Максим (turn 10), Хлоя (turn 10), Эшли (turn 9)
Relationships: Эшли→Максим = -25 (dislikes)

Result:
L.rumors.push({
  id: 'rumor_1234',
  text: 'Максим поцеловал Хлою',
  type: 'romance',
  subject: 'Максим',
  target: 'Хлоя',
  spin: 'negative',  // Because Эшли dislikes Максим
  turn: 10,
  knownBy: ['Эшли'],
  distortion: 0,
  verified: false
});

System (director): 🗣️ Новый слух: "Максим поцеловал Хлою" (witnessed by 1 people)
```

**Example 2: Automatic Rumor Propagation**

```
Turn 11: "Эшли и София говорили в коридоре"
Active Characters: Эшли, София
Existing Rumors: Эшли knows rumor_1234

Process:
1. Detect interaction between Эшли and София
2. Find rumors Эшли knows but София doesn't
3. 20% chance → SUCCESS
4. Spread rumor_1234 from Эшли to София
5. 30% chance distortion → Add 0.5 to distortion
6. Update Максим's reputation: -1 (negative romance rumor)

Result:
rumor_1234.knownBy = ['Эшли', 'София']
rumor_1234.distortion = 0.5
L.characters['Максим'].reputation = 74 (was 75)

System (director): 🗣️ Слух распространился: Эшли → София
```

**Example 3: Reputation Impact**

```
Initial State:
Максим.reputation = 75

Rumor Spreads:
1. Romance (negative): -1 → 74
2. Conflict rumor about Максим: -3 → 71
3. Achievement rumor: +5 → 76
4. Betrayal rumor with distortion 2: -5 - 2 = -7 → 69

Final: Максим.reputation = 69 (Good)
```

**Example 4: Interpretation Matrix in Action**

```
Event: "Макс предал Хлою"
Witnesses: Эшли, София, Джейк

Relationships:
- Эшли→Макс = -30 (dislikes) → Negative spin reinforced
- София→Макс = 0 (neutral) → Neutral spin
- Джейк→Макс = 40 (likes) → Positive spin (soften the rumor)

Base rumor type: betrayal (negative)
Final spin after matrix: Still negative (majority effect)
Distortion varies by witness relationship strength
```

---
