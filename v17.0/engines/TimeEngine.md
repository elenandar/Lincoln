
### 4.4 In-Game Time and Calendar System (TimeEngine)

The Lincoln system tracks in-game time progression through **semantic understanding** of narrative events, enabling natural time-aware storytelling with meaningful temporal progression based on what happens in the story.

#### Overview

**Key Capabilities:**
1. **Semantic Time Control** - Time flows based on narrative meaning, not mechanical turn counting
2. **Chronological Knowledge Base** - Comprehensive bilingual dictionary of temporal markers
3. **Time of Day Tracking** - Progression through Утро → День → Вечер → Ночь based on story events
4. **Day Counter** - Sequential day numbering with automatic week cycling
5. **Event Scheduling** - Track upcoming events with countdown display
6. **Context Integration** - Time and schedule information in AI context
7. **Manual Control** - Commands to view, set, and advance time

#### Chronological Knowledge Base (CKB)

The TimeEngine now uses a **Chronological Knowledge Base** that maps narrative events to temporal changes. Instead of counting turns, time advances when the story contains semantic markers like "лег спать" or "после уроков".

**Core Concept:** 
Time in the game world now reflects what's happening in the narrative. When a character goes to sleep, it becomes morning. When school ends, it becomes afternoon. This creates a natural flow where time progression emerges from the story itself.

**Supported Event Categories (Russian-only):**

1. **Sleep/Night** → Advances to next morning
   - Russian: "лег спать", "заснул", "отправился в кровать", "до глубокой ночи", "всю ночь"
   - Action: ADVANCE_TO_NEXT_MORNING (increment currentDay, set time to Утро)

2. **End of School Day** → Sets time to afternoon
   - Russian: "после уроков", "после школы", "занятия закончились", "уроки закончились"
   - Action: SET_TIME_OF_DAY (set to День)

3. **Lunch** → Sets time to afternoon
   - Russian: "пообедал", "во время ланча", "за обедом", "обеденный перерыв"
   - Action: SET_TIME_OF_DAY (set to День)

4. **Dinner** → Sets time to evening
   - Russian: "поужинал", "за ужином", "во время ужина", "вечерний прием пищи"
   - Action: SET_TIME_OF_DAY (set to Вечер)

5. **Short Time Jumps** → Advances time by 1-2 periods
   - Russian: "час спустя", "через несколько часов", "к вечеру", "через некоторое время"
   - Action: ADVANCE_TIME_OF_DAY (advance 1 step)

6. **Next Day** → Advances to next day
   - Russian: "на следующий день", "следующим утром", "назавтра", "на другой день"
   - Action: ADVANCE_DAY (increment day, set to Утро)

7. **Week Jumps** → Advances by 7 days
   - Russian: "прошла неделя", "через неделю", "спустя неделю", "прошло несколько дней"
   - Action: ADVANCE_DAY (increment by 7 days)

8. **Party/Social Events** → Sets time to evening or night
   - Russian: "вечеринка", "тусовка", "сбор у друзей", "пошли в клуб"
   - Action: SET_TIME_OF_DAY (set to Вечер)

9. **Training/Practice** → Sets time to day or evening
   - Russian: "тренировка", "репетиция", "дополнительные занятия", "секция"
   - Action: SET_TIME_OF_DAY (set to День)

10. **Date/Романтическое свидание** → Sets time to evening
    - Russian: "свидание", "пошел на свидание", "у них было свидание"
    - Action: SET_TIME_OF_DAY (set to Вечер)

11. **Midnight** → Sets time to night
    - Russian: "к полуночи", "в полночь", "далеко за полночь"
    - Action: SET_TIME_OF_DAY (set to Ночь)

12. **Dawn** → Sets time to morning
    - Russian: "до рассвета", "на рассвете", "проснулся с первыми лучами солнца"
    - Action: SET_TIME_OF_DAY (set to Утро)

13. **Few Days Later** → Advances by 2-3 days
    - Russian: "через пару дней", "несколько дней спустя", "прошло два дня"
    - Action: ADVANCE_DAY (increment by 2 days)

14. **Explicit Time References** → Sets specific time of day
    - Morning: "утром", "ранним утром", "на рассвете"
    - Evening: "вечером", "поздним вечером", "в сумерках"
    - Night: "ночью", "глубокой ночью", "полночь"

#### State Structure

Time state is stored in `state.lincoln.time`:

```javascript
state.lincoln.time = {
  currentDay: 1,              // Current day number
  dayName: 'Понедельник',     // Day name (cycles through week)
  timeOfDay: 'Утро',          // Current time period
  turnsPerToD: 5,             // Legacy field (preserved for compatibility)
  turnsInCurrentToD: 0,       // Legacy field (not used for time advancement)
  scheduledEvents: []         // Array of scheduled events
}
```

**Scheduled Event Structure:**

```javascript
{
  id: "event_1234_abc",       // Unique event ID
  name: "Школьная вечеринка", // Event name
  day: 7                      // Day when event occurs
}
```

#### Time Progression

**Semantic Advancement:**
- `LC.UnifiedAnalyzer.analyze()` is called after each story turn
- Text is scanned for temporal markers from ChronologicalKnowledgeBase
- When a marker is found, `LC.TimeEngine.processSemanticAction()` is invoked
- Time changes based on the semantic meaning of the action

**Old Turn-Based System:**
- The old mechanical turn counter (`turnsInCurrentToD`) is **disabled**
- Time no longer advances automatically after N turns
- All time progression is now driven by narrative content

**Time Cycle:**
```
Утро (Morning) → День (Afternoon) → Вечер (Evening) → Ночь (Night) → Утро [Next Day]
```

**Day Naming:**
Days cycle through the week: Понедельник → Вторник → Среда → Четверг → Пятница → Суббота → Воскресенье → Понедельник

#### Context Integration

Time information appears in context overlay with high priority:

**⟦TIME⟧ Tag (Priority: 750)**
```
⟦TIME⟧ Сейчас Среда, вечер.
```

**⟦SCHEDULE⟧ Tag (Priority: 750)**
```
⟦SCHEDULE⟧ До Вечеринка осталось 2 дня
⟦SCHEDULE⟧ Экзамен по математике происходит сегодня
```

**Filtering Rules:**
- TIME tag always shows current day and time of day
- SCHEDULE tag shows events on current day or within next 7 days
- Past events (day < currentDay) are excluded from display
- Events shown with countdown: "сегодня", "остался 1 день", "осталось N дня"

#### Commands

**`/time` - Show Current Time**
```
⏰ ТЕКУЩЕЕ ВРЕМЯ
День: 5 (Пятница)
Время суток: Вечер
Ходов в текущем времени: 3/5
```

**`/time set day N [Name]` - Set Day**
```
/time set day 10
→ 📅 День установлен: 10 (Среда)

/time set day 15 Особый День
→ 📅 День установлен: 15 (Особый День)
```

**`/time next` - Advance Time**
```
/time next
→ ⏰ Время изменилось: Пятница, Вечер
```

**`/event add "<Name>" on day N` - Schedule Event**
```
/event add "Школьная вечеринка" on day 7
→ 📌 Событие "Школьная вечеринка" запланировано на день 7 (через 2 дней)
```

**`/schedule` - Show All Events**
```
📅 РАСПИСАНИЕ СОБЫТИЙ
День 5: Тест по математике (сегодня!)
День 7: Школьная вечеринка (через 2 дней)
День 10: Встреча с директором (через 5 дней)
```

#### Architecture

The time system integrates across multiple modules:

```
Output v16.0.8.patched.txt
    ↓ After each turn: LC.UnifiedAnalyzer.analyze(text)
Library v16.0.8.patched.txt - UnifiedAnalyzer
    ↓ Scans for ChronologicalKnowledgeBase patterns
    ↓ Calls LC.TimeEngine.processSemanticAction(action)
Library v16.0.8.patched.txt - TimeEngine
    ↓ Update timeOfDay, currentDay based on semantic action
state.lincoln.time
    ↓ Read by composeContextOverlay()
Library v16.0.8.patched.txt
    ↓ Generate ⟦TIME⟧ and ⟦SCHEDULE⟧ tags
Context v16.0.8.patched.txt
    → AI sees temporal context and deadlines
```

#### Practical Examples

**Example 1: Semantic Time Flow**

Story text: "Максим лег спать после долгого дня."
```
⟦TIME⟧ Сейчас Вторник, утро.  ← Advanced to next morning
```

Story text: "После уроков она пошла в библиотеку."
```
⟦TIME⟧ Сейчас Вторник, день.  ← Set to afternoon
```

Story text: "За ужином они обсуждали планы."
```
⟦TIME⟧ Сейчас Вторник, вечер.  ← Set to evening
```

**Example 2: Time Jumps**

Story text: "Прошла неделя. Максим снова встретился с Хлоей."
```
⟦TIME⟧ Сейчас Вторник, утро.  ← Jumped 7 days forward
```

Story text: "Час спустя они добрались до школы."
```
⟦TIME⟧ Сейчас Вторник, день.  ← Advanced one time period
```

**Example 3: Event Scheduling with Semantic Time**

Day 1, story text: "Максим лег спать, думая о завтрашней вечеринке."
```
⟦TIME⟧ Сейчас Вторник, утро.  ← Now day 2
⟦SCHEDULE⟧ День рождения Хлои происходит сегодня
```

**Example 4: Bilingual Support**

English: "After school, Max went to sleep."
```
⟦TIME⟧ Сейчас Среда, утро.  ← "after school" → День, then "went to sleep" → next day, Утро
```

Russian: "После уроков Макс лег спать."
```
⟦TIME⟧ Сейчас Среда, утро.  ← Same result with Russian patterns
```

#### Integration with Other Systems

**With GoalsEngine:**
- Character goals can reference scheduled events
- "Максим хочет подготовиться к экзамену" + SCHEDULE creates urgency

**With MoodEngine:**
- Events can trigger mood changes when they occur
- Anticipation of events affects character status

**With KnowledgeEngine:**
- Secrets about events ("Максим знает о сюрпризе на вечеринке")
- Event-related knowledge filtering

**With UnifiedAnalyzer:**
- CKB patterns integrated into unified pipeline
- Time analysis happens alongside goals, relations, and mood detection

#### Technical Notes

**Semantic Processing:**
- ChronologicalKnowledgeBase patterns checked on every turn
- First matching pattern triggers the action
- Text matching is case-insensitive
- Both Russian and English patterns supported

**State Management:**
- Time changes increment stateVersion to invalidate context cache
- Ensures TIME tags reflect current state immediately

**Performance:**
- Pattern matching integrated into existing UnifiedAnalyzer pipeline
- Minimal overhead (~1-2ms per turn)
- No additional regex compilation cost (patterns built once)

**State Persistence:**
- Time state persists across sessions
- Manual time control via `/time set` for testing/debugging
- Events persist until manually cleared (future enhancement)

**Backward Compatibility:**
- Old turn-based fields preserved in state structure
- Legacy code continues to work but doesn't affect time progression
- Migration path: existing games continue with current time state

**Future Enhancements (Out of Scope):**
- `/event delete <id>` - Remove scheduled events
- Time-based triggers (auto-execute on specific days)
- Custom time period lengths per scene
- Historical event log
- Multiple timeline support
- Season/weather integration with time

---
