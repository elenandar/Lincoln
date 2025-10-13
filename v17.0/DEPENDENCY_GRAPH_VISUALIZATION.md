# Project Lincoln v17: Dependency Graph Visualization

**Purpose:** Visual representation of all 40 systems and their dependencies  
**Date:** October 13, 2025  
**Based on:** V16_MECHANICS_AUDIT.md

---

## Critical Path: The Inevitable Sequence

```
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 1: INFRASTRUCTURE                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  lcInit  │  │currentAct│  │ Commands │  │LC.Tools  │       │
│  │  (#33)   │  │ ion(#34) │  │Registry  │  │LC.Utils  │       │
│  └─────┬────┘  └─────┬────┘  │  (#24)   │  │(#19-20)  │       │
│        └─────────────┼────────┴─────┬────┴─────┬───────┘       │
│                      └──────────────┴──────────┘                │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PHASE 2: PHYSICAL WORLD                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  TimeEngine  │  │ Environment  │  │     CKB      │         │
│  │    (#7)      │  │  Engine (#8) │  │    (#18)     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PHASE 3: BASE DATA                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Evergreen   │  │    Goals     │  │  Knowledge   │         │
│  │  Engine (#1) │  │  Engine (#2) │  │  Engine (#6) │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
╔═════════════════════════════════════════════════════════════════╗
║              ⚠️  PHASE 4: CONSCIOUSNESS — CRITICAL  ⚠️          ║
║                                                                 ║
║  ┌────────────────────────────────────────────────────────┐    ║
║  │              QualiaEngine (#15)                        │    ║
║  │         Phenomenal Core (Level 1)                      │    ║
║  │  • somatic_tension, valence, focus, energy             │    ║
║  └──────────────────────┬─────────────────────────────────┘    ║
║                         │                                       ║
║                         │ BLOCKING DEPENDENCY                   ║
║                         │ (InformationEngine CANNOT work        ║
║                         │  without QualiaEngine.qualia_state)   ║
║                         ▼                                       ║
║  ┌────────────────────────────────────────────────────────┐    ║
║  │          InformationEngine (#5)                        │    ║
║  │       Subjective Reality (Level 2)                     │    ║
║  │  • interpret(character, event) ← reads qualia_state    │    ║
║  │  • perceptions: trust, respect, competence             │    ║
║  └────────────────────────────────────────────────────────┘    ║
║                                                                 ║
║  ⚠️  These TWO systems MUST be implemented SEQUENTIALLY,       ║
║      WITHOUT INTERRUPTION, BEFORE social systems               ║
╚═════════════════════════════════════════════════════════════════╝
                               │
                               │ FUNCTIONAL DEPENDENCIES
                               │ (RelationsEngine & HierarchyEngine
                               │  NEED InformationEngine)
                               │
           ┌───────────────────┼───────────────────┐
           │                   │                   │
           ▼                   ▼                   ▼
┌─────────────────┐  ┌──────────────────┐  ┌──────────────┐
│  MoodEngine     │  │ RelationsEngine  │  │  Crucible    │
│     (#3)        │  │      (#4)        │  │ Engine (#16) │
│                 │  │                  │  │              │
│ Emotions &      │  │ WITH Information │  │ Character    │
│ States          │  │ Engine integration│  │ Evolution    │
└─────────────────┘  └──────────────────┘  └──────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│               PHASE 6: SOCIAL HIERARCHY                         │
│  ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ HierarchyEngine  │  │   Gossip     │  │   Social     │     │
│  │      (#10)       │  │ Engine (#9)  │  │ Engine (#11) │     │
│  │                  │  │              │  │              │     │
│  │ WITH Information │  │  Rumors &    │  │  Norms &     │     │
│  │ Engine.perceptions│  │  Credibility │  │  Conformity  │     │
│  └──────────────────┘  └──────────────┘  └──────────────┘     │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│               PHASE 7: CULTURAL MEMORY                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Memory     │  │     Lore     │  │  Academics   │         │
│  │ Engine (#12) │  │ Engine (#13) │  │ Engine (#14) │         │
│  │              │  │              │  │              │         │
│  │ Myths from   │  │  Legends &   │  │  Academic    │         │
│  │ formative    │  │  Cultural    │  │  Tracking    │         │
│  │ events       │  │  Artifacts   │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│               PHASE 8: OPTIMIZATION                             │
│  ┌────────────────────────────────────────────────────────┐    │
│  │           UnifiedAnalyzer (#29)                        │    │
│  │                                                        │    │
│  │  Coordinates ALL engines in single pass:              │    │
│  │  • TimeEngine                                          │    │
│  │  • EvergreenEngine                                     │    │
│  │  • GoalsEngine                                         │    │
│  │  • MoodEngine                                          │    │
│  │  • EnvironmentEngine                                   │    │
│  │  • GossipEngine                                        │    │
│  │  • RelationsEngine                                     │    │
│  │  • HierarchyEngine                                     │    │
│  │  • LoreEngine                                          │    │
│  │                                                        │    │
│  │  ⚠️  MUST be implemented LAST                          │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Four-Level Consciousness Model: The Cascade

```
╔═══════════════════════════════════════════════════════════════╗
║  EVENT: "Alice praises Bob"                                   ║
╚═══════════════════════════════════════════════════════════════╝
                          │
                          ▼
    ┌───────────────────────────────────────────────────┐
    │  LEVEL 1: PHENOMENOLOGY (QualiaEngine)            │
    │  ┌─────────────────────────────────────────────┐  │
    │  │  Bob.qualia_state BEFORE:                   │  │
    │  │    valence: 0.3 (unpleasant)                │  │
    │  │    tension: 0.7 (high tension)              │  │
    │  │                                              │  │
    │  │  Event "praise" triggers resonance:         │  │
    │  │    valence: 0.3 → 0.5 (+0.2)                │  │
    │  │    tension: 0.7 → 0.5 (-0.2)                │  │
    │  └─────────────────────────────────────────────┘  │
    └─────────────────┬─────────────────────────────────┘
                      │ qualia_state influences interpretation
                      ▼
    ┌───────────────────────────────────────────────────┐
    │  LEVEL 2: PSYCHOLOGY (InformationEngine)          │
    │  ┌─────────────────────────────────────────────┐  │
    │  │  InformationEngine.interpret(Bob, "praise") │  │
    │  │                                              │  │
    │  │  if (valence > 0.7):                        │  │
    │  │    → "sincere" (multiplier: 1.5)            │  │
    │  │  elif (valence < 0.3):                      │  │
    │  │    → "sarcastic" (multiplier: 0.4)          │  │
    │  │  else:                                       │  │
    │  │    → "neutral" (multiplier: 1.0)            │  │
    │  │                                              │  │
    │  │  Bob's valence = 0.5 → "neutral"            │  │
    │  │  Relation change: +10 × 1.0 = +10           │  │
    │  └─────────────────────────────────────────────┘  │
    └─────────────────┬─────────────────────────────────┘
                      │ interpretation shapes personality
                      ▼
    ┌───────────────────────────────────────────────────┐
    │  LEVEL 3: PERSONALITY (CrucibleEngine)            │
    │  ┌─────────────────────────────────────────────┐  │
    │  │  Bob experiences moderate praise              │
    │  │                                              │  │
    │  │  IF this happens repeatedly:                │  │
    │  │    personality.trust += 0.01                │  │
    │  │    self_concept.perceived_trust += 0.02     │  │
    │  │                                              │  │
    │  │  Formative events archived if:              │  │
    │  │    - Extreme relation change (>80)          │  │
    │  │    - Public humiliation                     │  │
    │  │    - First leadership position              │  │
    │  └─────────────────────────────────────────────┘  │
    └─────────────────┬─────────────────────────────────┘
                      │ character determines social behavior
                      ▼
    ┌───────────────────────────────────────────────────┐
    │  LEVEL 4: SOCIOLOGY (Hierarchy, Memory, Gossip)   │
    │  ┌─────────────────────────────────────────────┐  │
    │  │  RelationsEngine:                            │  │
    │  │    Bob → Alice: +10                         │  │
    │  │                                              │  │
    │  │  HierarchyEngine:                            │  │
    │  │    Alice.capital += 8 (praised someone)     │  │
    │  │    Reputation recalculated via perceptions  │  │
    │  │                                              │  │
    │  │  GossipEngine:                               │  │
    │  │    Event not dramatic enough (no rumor)     │  │
    │  │                                              │  │
    │  │  LoreEngine:                                 │  │
    │  │    Lore potential = 15 (too low, no legend) │  │
    │  └─────────────────────────────────────────────┘  │
    └───────────────────────────────────────────────────┘
```

---

## Comparison: Existing vs Alternative Roadmap

### Existing Roadmap (Creates Technical Debt)

```
Phase 1: Infrastructure ✓
    │
Phase 2: Physical World ✓
    │
Phase 3: Social Dynamics ❌ PROBLEM: No InformationEngine yet
    │
    ├─ RelationsEngine (SIMPLE VERSION - numbers only)
    ├─ HierarchyEngine (OLD VERSION - numeric relations)
    └─ GossipEngine
    │
Phase 4: Consciousness
    │
    ├─ QualiaEngine
    └─ InformationEngine ← NOW we have it, but...
    │
Phase 5: ❌ REWORK NEEDED
    │
    ├─ RelationsEngine REFACTORING (add InformationEngine integration)
    ├─ HierarchyEngine REFACTORING (migrate to perceptions)
    └─ Result: DOUBLE WORK + TECHNICAL DEBT
```

### Alternative Roadmap (Architecturally Clean)

```
Phase 1: Infrastructure ✓
    │
Phase 2: Physical World ✓
    │
Phase 3: Base Data (Evergreen, Goals, Knowledge) ✓
    │
Phase 4: Consciousness ✓ CRITICAL: Do this BEFORE social systems
    │
    ├─ QualiaEngine (FIRST)
    └─ InformationEngine (IMMEDIATELY AFTER)
    │
Phase 5: Social Dynamics ✓ NOW we can do it RIGHT
    │
    ├─ RelationsEngine (WITH InformationEngine - correct from day 1)
    ├─ MoodEngine
    └─ CrucibleEngine
    │
Phase 6: Social Hierarchy ✓
    │
    ├─ HierarchyEngine (WITH InformationEngine.perceptions - v16 innovation preserved)
    ├─ GossipEngine
    └─ SocialEngine
    │
Phase 7: Cultural Memory ✓
    │
Phase 8: Optimization (UnifiedAnalyzer) ✓
    │
Result: CLEAN ARCHITECTURE, NO TECHNICAL DEBT
```

---

## Critical Dependencies Matrix

| System | Depends On (BLOCKING) | Depends On (FUNCTIONAL) | Cannot Function Without |
|--------|----------------------|------------------------|------------------------|
| **QualiaEngine** | lcInit, L.characters | - | Nothing (fully independent) |
| **InformationEngine** | **QualiaEngine.qualia_state** | - | QualiaEngine ⚠️ |
| **RelationsEngine** | lcInit, L.relations | **InformationEngine** | Can work without InformationEngine but loses core functionality |
| **HierarchyEngine** | lcInit, L.characters | **InformationEngine.perceptions** | Can work without InformationEngine but loses v16 innovation |
| **CrucibleEngine** | lcInit, L.characters | RelationsEngine, GoalsEngine (events) | Can work independently, events come later |
| **MemoryEngine** | lcInit, L.myths | **CrucibleEngine.formative_events** | Can work with manual input, but automation requires CrucibleEngine |
| **UnifiedAnalyzer** | **ALL ENGINES** | - | All engines ⚠️ |

---

## Why the Sequence is Critical: A Timeline

### ❌ Wrong Order (Existing Roadmap)

```
Day 1-5:   Infrastructure ✓
Day 6-10:  Physical World ✓
Day 11-15: RelationsEngine (simple version)
           → Can store numbers
           → Cannot interpret context
           → Tests: "/relation set Alice Bob 50" ✓
           
Day 16-20: HierarchyEngine (old version)
           → Uses numeric relations
           → Cannot use perceptions
           → Tests: "/capital set Alice 110" ✓
           
Day 21-30: QualiaEngine + InformationEngine
           → Now we have interpretation
           → But RelationsEngine doesn't use it! ❌
           
Day 31-40: REFACTORING PHASE
           → Rewrite RelationsEngine to use InformationEngine
           → Rewrite HierarchyEngine to use perceptions
           → Rewrite all tests
           → Risk of breaking existing functionality
           → DOUBLE WORK ❌
```

### ✅ Correct Order (Alternative Roadmap)

```
Day 1-5:   Infrastructure ✓
Day 6-10:  Physical World ✓
Day 11-15: Base Data (Evergreen, Goals, Knowledge) ✓
           → Independent systems
           → No rework needed later
           
Day 16-25: QualiaEngine + InformationEngine ✓ CRITICAL PHASE
           → Build them together
           → Test interpretation variations
           → Tests: "/qualia set Alice valence 0.8"
           → Tests: "/interpret Alice praise" (different results for different valence)
           
Day 26-35: RelationsEngine (FULL VERSION from day 1)
           → WITH InformationEngine integration
           → Contextual interpretation works immediately
           → Tests: Check that same event → different relations based on qualia
           → NO REWORK NEEDED ✓
           
Day 36-45: HierarchyEngine (NEW VERSION from day 1)
           → WITH InformationEngine.perceptions
           → Reputation through subjective reality
           → v16 innovation preserved
           → NO REWORK NEEDED ✓
           
Result: CLEAN, NO TECHNICAL DEBT ✓
```

---

## The "Cannot Be Changed" Dependencies

These are the **5 absolutely immutable dependencies** where changing the order makes the system impossible to implement:

### 1. QualiaEngine BEFORE InformationEngine

```javascript
// InformationEngine.interpret() - FIRST LINE
const valence = character.qualia_state.valence;  // ← CRASH if QualiaEngine not implemented
```

**Cannot reverse this order.** Period.

---

### 2. InformationEngine BEFORE RelationsEngine (full version)

```javascript
// RelationsEngine with InformationEngine
const interpretation = InformationEngine.interpret(from, event);  // ← Needs InformationEngine
modifier *= interpretation.multiplier;
```

**Can implement simple version without, but then requires refactoring.**

---

### 3. InformationEngine BEFORE HierarchyEngine (v16 version)

```javascript
// v16 innovation: reputation through perceptions
const perception = InformationEngine.getPerception(witness, character);  // ← Needs InformationEngine
reputation += perception.respect;
```

**Can implement old version without, but loses v16 innovation.**

---

### 4. CrucibleEngine BEFORE MemoryEngine (automated version)

```javascript
// MemoryEngine.runMythologization()
const events = L.formative_events.filter(e => e.turn > 20);  // ← Needs CrucibleEngine archive
```

**Can implement manual version without, but automation requires CrucibleEngine.**

---

### 5. ALL ENGINES BEFORE UnifiedAnalyzer

```javascript
// UnifiedAnalyzer.analyze()
TimeEngine.analyze(text);      // ← Must exist
EvergreenEngine.analyze(text); // ← Must exist
GoalsEngine.analyze(text);     // ← Must exist
// ... 6 more engines
```

**Cannot implement coordinator before the systems it coordinates.**

---

## Testability: Why QualiaEngine/InformationEngine Can Be Tested Early

### Common Objection

> "QualiaEngine and InformationEngine are abstract. How can we test them without social systems?"

### Answer: Commands

```
┌────────────────────────────────────────────────────────┐
│  Test Scenario 1: QualiaEngine Isolation               │
│                                                        │
│  > /qualia set Alice valence 0.2                       │
│  ✓ Alice's qualia_state.valence set to 0.2            │
│                                                        │
│  > /qualia get Alice                                   │
│  ✓ Display: valence=0.2, tension=0.5, focus=0.7       │
│                                                        │
│  Success: QualiaEngine stores and retrieves data       │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  Test Scenario 2: InformationEngine Interpretation     │
│                                                        │
│  Setup:                                                │
│  > /qualia set Alice valence 0.9  (very pleasant)      │
│  > /interpret Alice praise                             │
│  ✓ Output: "Alice interprets praise as SINCERE"       │
│                                                        │
│  Change state:                                         │
│  > /qualia set Alice valence 0.2  (very unpleasant)    │
│  > /interpret Alice praise                             │
│  ✓ Output: "Alice interprets praise as SARCASTIC"     │
│                                                        │
│  Success: Same event, different interpretation         │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  Test Scenario 3: Resonance (Group Effects)            │
│                                                        │
│  Setup:                                                │
│  > /qualia set Alice valence 0.9                       │
│  > /qualia set Bob valence 0.2                         │
│  > /qualia set Carol valence 0.5                       │
│                                                        │
│  Trigger resonance:                                    │
│  > /qualia resonate Alice Bob Carol                    │
│                                                        │
│  Check results:                                        │
│  > /qualia get Alice                                   │
│  ✓ valence decreased slightly (pulled toward average)  │
│  > /qualia get Bob                                     │
│  ✓ valence increased slightly (pulled toward average)  │
│                                                        │
│  Success: Emotional contagion works                    │
└────────────────────────────────────────────────────────┘
```

**Conclusion: QualiaEngine and InformationEngine ARE testable in isolation through commands. No need to wait for social systems.**

---

## Final Visual Summary

```
                    PROJECT LINCOLN v17
                   OPTIMAL ROADMAP PATH

    [Infrastructure] → [Physical World] → [Base Data]
                            ↓
                    ┌───────────────┐
                    │  CRITICAL     │
                    │  DECISION     │
                    │  POINT        │
                    └───────┬───────┘
                            │
                ┌───────────┴───────────┐
                │                       │
            EXISTING                ALTERNATIVE
            ROADMAP                 ROADMAP
                │                       │
                ▼                       ▼
        ┌─────────────┐         ┌─────────────┐
        │   Social    │         │ Consciousness│
        │  Systems    │         │   Systems    │
        │   FIRST     │         │    FIRST     │
        └──────┬──────┘         └──────┬───────┘
               │                       │
               ▼                       ▼
        ┌─────────────┐         ┌─────────────┐
        │Consciousness│         │   Social    │
        │   Systems   │         │   Systems   │
        │    LATER    │         │    LATER    │
        └──────┬──────┘         └──────┬───────┘
               │                       │
               ▼                       ▼
        ┌─────────────┐         ┌─────────────┐
        │ REFACTORING │         │    CLEAN    │
        │   NEEDED    │         │ARCHITECTURE │
        │  ❌ Tech    │         │  ✅ No Tech  │
        │    Debt     │         │     Debt    │
        └─────────────┘         └─────────────┘

    RECOMMENDATION: Choose Alternative Roadmap
```

---

## Appendix: Complete 40-System Checklist

### Infrastructure Layer (8 systems) - Phase 1
- [ ] lcInit (#33)
- [ ] currentAction (#34)
- [ ] CommandsRegistry (#24)
- [ ] LC.Tools (#19)
- [ ] LC.Utils (#20)
- [ ] LC.Flags (#21)
- [ ] LC.Drafts (#22)
- [ ] LC.Turns (#23)

### Physical Layer (3 systems) - Phase 2
- [ ] TimeEngine (#7)
- [ ] EnvironmentEngine (#8)
- [ ] ChronologicalKnowledgeBase (#18)

### Data Layer (3 systems) - Phase 3
- [ ] EvergreenEngine (#1)
- [ ] GoalsEngine (#2)
- [ ] KnowledgeEngine (#6)

### ⚠️ Consciousness Layer (3 systems) - Phase 4 ⚠️
- [ ] QualiaEngine (#15) ← MUST BE FIRST
- [ ] InformationEngine (#5) ← MUST BE IMMEDIATELY AFTER
- [ ] CrucibleEngine (#16)

### Social Layer (3 systems) - Phase 5
- [ ] MoodEngine (#3)
- [ ] RelationsEngine (#4) ← WITH InformationEngine integration
- [ ] (CrucibleEngine already done in Phase 4)

### Hierarchy Layer (3 systems) - Phase 6
- [ ] HierarchyEngine (#10) ← WITH InformationEngine.perceptions
- [ ] GossipEngine (#9)
- [ ] SocialEngine (#11)

### Culture Layer (4 systems) - Phase 7
- [ ] MemoryEngine (#12)
- [ ] LoreEngine (#13)
- [ ] AcademicsEngine (#14)
- [ ] DemographicPressure (#17)

### Optimization Layer (4 systems) - Phase 8
- [ ] State Versioning (#30)
- [ ] Context Caching (#31)
- [ ] Norm Cache (#32)
- [ ] UnifiedAnalyzer (#29) ← MUST BE LAST

### Stability Mechanics (4 systems) - Embedded in all phases
- [ ] Regex Security (#25)
- [ ] Data Growth Limits (#26)
- [ ] Type Validation (#27)
- [ ] Error Handling (#28)

### State Management (3 systems) - Architectural decisions
- [ ] State Migration (#35)
- [ ] CONFIG (#39)
- [ ] Module Structure (#40)

**Total: 40 systems**

---

**End of Visualization Document**
