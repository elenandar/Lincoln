### 4.1 Automatic Goal Tracking System

The Lincoln system automatically detects and tracks character goals from narrative text, helping the AI maintain long-term character motivation consistency.

#### Overview

**Key Capabilities:**
1. **Automatic Detection** - Goals are extracted from Russian text using regex patterns
2. **Persistent Storage** - Goals stored in `state.lincoln.goals`
3. **Context Integration** - Active goals appear in AI context with high priority
4. **Age Management** - Goals older than 20 turns are filtered from context
5. **Deep Goal Understanding** - Recognizes social, academic, and investigation goals

#### State Structure

Goals are stored in the following format:

```javascript
state.lincoln.goals = {
  "goalKey": {
    character: "Максим",
    text: "узнать правду о директоре",
    status: "active",
    turnCreated: 5
  }
}
```

#### Pattern Recognition

**11 Russian-only regex patterns** detect goal-setting phrases:

**Basic Goals:**
- `Цель Максима: узнать правду` - Explicit goal statements
- `Максим хочет узнать правду` - Want/desire expressions
- `Максим решил отомстить` - Decision/intent expressions
- `Максим планирует раскрыть` - Planning expressions
- `Его цель — узнать правду` - Possessive goal constructions

**Social Goals:**
- `Максим хотел подружиться с Хлоей` - Making friends
- `Хлоя решила наладить отношения` - Repairing relationships
- `Максим хотел произвести на нее впечатление` - Impressing someone
- `Эшли решила отомстить` - Revenge goals

**Academic/Career Goals:**
- `Максим решил исправить оценки` - Improving grades
- `Хлоя хотела получить отлично` - Academic achievement
- `Его целью была победа в конкурсе` - Competition victory
- `Хлоя хотела выиграть соревнование` - Winning competitions

**Investigation Goals:**
- `Максим должен выяснить, что случилось` - Discovering truth
- `Хлоя хотела докопаться до истины` - Getting to the truth
- `Максим решил разузнать побольше о директоре` - Investigation

#### Context Integration

Goals appear in context overlay as `⟦GOAL⟧` entries with **priority weight 750** (between CANON at 800 and OPENING at 700):

```
⟦CANON⟧ Максим и Хлоя are friends. Максим: suspicious of principal.
⟦GOAL⟧ Цель Максим: узнать правду о директоре
⟦OPENING⟧ Первый урок начался с неожиданного объявления.
```

**Filtering Rules:**
- Only `status: "active"` goals are shown
- Goals must be created within last 20 turns
- Character must be important (core cast member)
- Goal text length: 8-200 characters

#### Practical Examples

**Example 1: Basic Goal Detection**

Input: `"Максим хочет узнать правду о директоре."`

Result:
```javascript
L.goals["Максим_123_abc"] = {
  character: "Максим",
  text: "узнать правду о директоре",
  status: "active",
  turnCreated: 5
}
```

Context: `⟦GOAL⟧ Цель Максим: узнать правду о директоре`

**Example 2: Social Goal Detection**

Input: `"Хлоя решила наладить отношения с Максимом."`

Result:
```javascript
L.goals["Хлоя_456_xyz"] = {
  character: "Хлоя",
  text: "наладить отношения с Максимом",
  status: "active",
  turnCreated: 10
}
```

Context: `⟦GOAL⟧ Цель Хлоя: win the competition`

**Example 3: Multiple Goals**

All active goals (<20 turns old) appear in context together:

```
⟦CANON⟧ [character relationships]
⟦GOAL⟧ Цель Максим: узнать правду о директоре
⟦GOAL⟧ Цель Хлоя: стать звездой театра
⟦GOAL⟧ Цель Эшли: раскрыть тайну подвала
⟦SCENE⟧ Focus on: Максим, Хлоя
```

#### Goal Lifecycle

```
Turn 5:  Goal created from text
Turn 6-24: Goal appears in context (active, < 20 turns)
Turn 25+: Goal filtered from context (still in state)
```

#### Configuration

Adjustable parameters:

| Parameter | Current Value | Location | Description |
|-----------|---------------|----------|-------------|
| Age threshold | 20 turns | `composeContextOverlay()` | How long goals stay active |
| Min goal length | 8 characters | `analyzeForGoals()` | Minimum goal text length |
| Max goal length | 200 characters | `analyzeForGoals()` | Maximum goal text length |
| Priority weight | 750 | `composeContextOverlay()` | Context priority level |

#### Architecture

The goal tracking system integrates across multiple modules:

```
Output v16.0.8.patched.txt
    ↓ Calls: autoEvergreen.analyzeForGoals(text)
Library v16.0.8.patched.txt
    ↓ Extract character + goal from text
    ↓ Validate and store
state.lincoln.goals
    ↓ Read by composeContextOverlay()
Library v16.0.8.patched.txt
    ↓ Filter: status="active", age<20 turns
    ↓ Format: "⟦GOAL⟧ Цель {char}: {text}"
Context v16.0.8.patched.txt
    → AI sees goals in context
```

#### Impact on AI Behavior

Goals in context help the AI:
- Maintain character motivation consistency
- Drive plot forward toward established objectives
- Create more purposeful character actions
- Reference goals naturally in narration

**Without Goals:**
```
"Максим вошёл в кабинет директора. Он осмотрелся по сторонам."
```

**With Goals (⟦GOAL⟧ Цель Максим: узнать правду о директоре):**
```
"Максим тихо закрыл дверь кабинета за собой. Его сердце билось 
чаще — это был его шанс наконец узнать правду. На столе директора 
лежала папка с надписью 'Конфиденциально'. Максим решительно 
потянулся к ней, помня о своей цели раскрыть секреты директора."
```

---
