
### 4.9 Social Architecture (Population, Character Lifecycle & Introduction)

#### Overview

The Social Architecture system addresses the fundamental limitation of narrative systems that operate as a "theater stage in the void" where the world beyond named protagonists doesn't exist. This feature pack introduces three interconnected systems:

1. **Population and Demographic Pressure** - Creates a virtual "background population" that intelligently prompts the AI to introduce new characters
2. **Character Categorization** - Separates characters into tiers (CORE, SECONDARY, EXTRA) based on narrative importance
3. **Character Lifecycle Management** - Manages character states (ACTIVE, FROZEN) to prevent information bloat while preserving narrative continuity

#### Population and Demographic Pressure

**Purpose:** Creates awareness of unnamed background characters and intelligently suggests when new characters should be introduced.

**Implementation:**

**State Initialization:**
```javascript
L.population = {
  unnamedStudents: 50,
  unnamedTeachers: 5
}
```

**Context Integration:**
- Added to context overlay as `⟦WORLD⟧` tag with low priority (weight: 200)
- Example: `⟦WORLD⟧ В школе учится около 50 других учеников и работает 5 учителей.`

**Demographic Pressure Detection:**

The `DemographicPressure` analyzer detects situations requiring new characters:

1. **Loneliness Pattern**
   - Trigger: Single character focus + loneliness indicators
   - Patterns: `один(а|и)?`, `сам(а|и)?`, `в одиночестве`, `никого не было`
   - Suggestion: `⟦SUGGESTION⟧ {CharName} один. Возможно, он с кем-то столкнется.`

2. **Expert Needed Pattern**
   - Trigger: Task requiring specialized knowledge
   - Examples:
     - `взломать/хакнуть` → "кто-то, кто разбирается в компьютерах"
     - `найти информацию/расследование` → "кто-то, кто может помочь с поиском"
     - `вылечить/лечение` → "кто-то с медицинскими знаниями"
     - `починить/отремонтировать` → "кто-то с техническими навыками"
     - `защитить/охрана` → "кто-то, кто может защитить"
   - Suggestion: `⟦SUGGESTION⟧ Нужен {expert type}.`

**Integration:**
- Analyzed automatically during `UnifiedAnalyzer.analyze()`
- Suggestions included in context overlay with high priority (weight: 760)

#### Character Categorization

**Character Types:**

| Type | Description | Creation | Promotion Criteria |
|------|-------------|----------|-------------------|
| **EXTRA** | Background character, minimal interaction | Default for new characters | >5 mentions in first 50 turns → SECONDARY |
| **SECONDARY** | Supporting character, regular interaction | Promoted from EXTRA | Manual assignment or promotion |
| **CORE** | Main protagonist | Manual assignment | N/A |

**Character Status:**

| Status | Description | Transition |
|--------|-------------|------------|
| **ACTIVE** | Included in context, can be mentioned | Default state |
| **FROZEN** | Excluded from context, preserved in memory | SECONDARY not seen for >100 turns |

**State Structure:**
```javascript
L.characters[name] = {
  mentions: 5,
  lastSeen: 42,
  firstSeen: 1,
  type: 'EXTRA',      // EXTRA, SECONDARY, or CORE
  status: 'ACTIVE',   // ACTIVE or FROZEN
  reputation: 50      // 0-100 scale
}
```

#### Character Lifecycle (CharacterGC)

**Purpose:** Automatically manages character lifecycle to prevent state bloat while preserving narrative continuity.

**Garbage Collection Rules:**

1. **Promotion Logic** (EXTRA → SECONDARY)
   - **Condition:** `mentions > 5 AND (turn - firstSeen) <= 50`
   - **Effect:** Character promoted to SECONDARY tier
   - **Reason:** Frequent early mentions indicate narrative importance

2. **Freezing Logic** (SECONDARY → FROZEN)
   - **Condition:** `type === 'SECONDARY' AND status === 'ACTIVE' AND (turn - lastSeen) > 100`
   - **Effect:** Character status changed to FROZEN
   - **Reason:** Long absence suggests character left the scene
   - **Note:** Character data preserved, excluded from context

3. **Unfreezing Logic** (FROZEN → ACTIVE)
   - **Condition:** Character mentioned in text
   - **Effect:** Status immediately changed to ACTIVE in `updateCharacterActivity()`
   - **Reason:** Character returns to narrative
   - **StateVersion:** Incremented to invalidate context cache

4. **Deletion Logic** (EXTRA cleanup)
   - **Condition:** `type === 'EXTRA' AND mentions <= 2 AND (turn - lastSeen) > 200`
   - **Effect:** Character completely removed from `L.characters`
   - **Reason:** Minimal interaction with extreme inactivity indicates disposable extra

**Execution Schedule:**
- Runs automatically every 50 turns: `if (L.turn % 50 === 0)`
- Integrated in `Output.txt` after text analysis
- System message (director-level): `📊 CharacterGC: {promoted} promoted, {frozen} frozen, {deleted} deleted`

**Context Filtering:**

FROZEN characters are excluded from context in two ways:

1. **getActiveCharacters()** - Skips characters with `status === 'FROZEN'`
2. **Context Overlay** - FROZEN characters don't appear in SCENE tags

**Example Lifecycle:**

```
Turn 1:   "Алекс" mentioned → Created as EXTRA, ACTIVE
Turn 5:   6th mention → Promoted to SECONDARY
Turn 50:  Still active, included in context
Turn 200: Not seen for 150 turns → Frozen to FROZEN status
Turn 250: "Алекс вернулся" → Unfrozen to ACTIVE
```

#### Integration with Other Systems

**UnifiedAnalyzer:**
- Calls `DemographicPressure.analyze()` during text analysis
- Suggestions automatically flow to context overlay

**Context Overlay:**
- Population info added as `⟦WORLD⟧` (low priority)
- Demographic suggestions added as `⟦SUGGESTION⟧` (high priority: 760)
- FROZEN characters filtered from `⟦SCENE⟧` tags

**State Management:**
- Uses `L.stateVersion` counter for cache invalidation
- Increments on character promotion, freezing, unfreezing, and deletion

**GossipEngine:**
- FROZEN characters can still be subjects of rumors
- But won't actively spread rumors (not in active character list)

#### Testing

Test file: `test_character_lifecycle.js`

**Coverage:**
- ✅ Population initialization
- ✅ Character creation with type/status fields
- ✅ Character promotion (EXTRA → SECONDARY)
- ✅ Character freezing (SECONDARY → FROZEN)
- ✅ Character unfreezing (FROZEN → ACTIVE)
- ✅ Character deletion (EXTRA cleanup)
- ✅ FROZEN character filtering from context
- ✅ Population context in overlay
- ✅ Demographic pressure detection (loneliness)
- ✅ Demographic pressure detection (expert needed)
- ✅ Demographic suggestions in context overlay

---
