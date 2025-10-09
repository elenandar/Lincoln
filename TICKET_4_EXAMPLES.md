# Goal Tracking: Before and After Examples

## Example 1: Russian Goal Detection

### Input (Turn 5)
```
Максим хочет узнать правду о директоре Ковальски. Он подозревает, что директор скрывает важную информацию о прошлом школы.
```

### State After Analysis
```javascript
state.lincoln.goals = {
  "Максим_1699999999_a1b2": {
    character: "Максим",
    text: "узнать правду о директоре ковальски",
    status: "active",
    turnCreated: 5
  }
}
```

### Context Overlay (Turns 5-24)
```
⟦GUIDE⟧ Lincoln Heights school drama. Third person past tense.
⟦GUIDE⟧ 2–4 short paragraphs. Show emotions via actions and subtext.
⟦CANON⟧ Максим и Хлоя are friends. Максим: suspicious of principal.
⟦GOAL⟧ Цель Максим: узнать правду о директоре ковальски
⟦SCENE⟧ Focus on: Максим
⟦META⟧ Turn 5, 5 since recap, 5 since epoch.
```

---

## Example 2: Multiple Character Goals

### Input Sequence

**Turn 10:**
```
Хлоя мечтает стать звездой школьного театра. Она тренируется каждый день.
```

**Turn 12:**
```
Эшли планирует раскрыть тайну подвала. Она нашла старый ключ.
```

### State After Both
```javascript
state.lincoln.goals = {
  "Максим_1699999999_a1b2": {
    character: "Максим",
    text: "узнать правду о директоре ковальски",
    status: "active",
    turnCreated: 5
  },
  "Хлоя_1700000100_c3d4": {
    character: "Хлоя",
    text: "стать звездой школьного театра",
    status: "active",
    turnCreated: 10
  },
  "Эшли_1700000200_e5f6": {
    character: "Эшли",
    text: "раскрыть тайну подвала",
    status: "active",
    turnCreated: 12
  }
}
```

### Context Overlay (Turn 15)
```
⟦GUIDE⟧ Lincoln Heights school drama. Third person past tense.
⟦GUIDE⟧ 2–4 short paragraphs. Show emotions via actions and subtext.
⟦CANON⟧ Максим и Хлоя are friends. Эшли: curious investigator.
⟦GOAL⟧ Цель Максим: узнать правду о директоре ковальски
⟦GOAL⟧ Цель Хлоя: стать звездой школьного театра
⟦GOAL⟧ Цель Эшли: раскрыть тайну подвала
⟦SCENE⟧ Focus on: Максим, Хлоя, Эшли
⟦META⟧ Turn 15, 5 since recap, 15 since epoch.
```

---

## Example 3: English Goal Pattern

### Input (Turn 20)
```
Chloe wants to win the regional drama competition. She knows it could change everything for her future.
```

### State Added
```javascript
"Хлоя_1700000300_g7h8": {
  character: "Хлоя",
  text: "win the regional drama competition",
  status: "active",
  turnCreated: 20
}
```

### Context Shows (English + Russian mixed)
```
⟦GOAL⟧ Цель Хлоя: стать звездой школьного театра
⟦GOAL⟧ Цель Хлоя: win the regional drama competition
```

---

## Example 4: Goal Aging Out

### Timeline

**Turn 5:** Goal created
```
⟦GOAL⟧ Цель Максим: узнать правду о директоре
```

**Turns 6-24:** Goal appears in context (within 20-turn window)
```
⟦GOAL⟧ Цель Максим: узнать правду о директоре
```

**Turn 25:** Goal is exactly 20 turns old - **no longer shown**
```
(Goal still in state.lincoln.goals but not in context overlay)
```

**Turn 26+:** Goal remains in state with status="active"
```javascript
// Still in state, could be reactivated or completed manually
{
  character: "Максим",
  text: "узнать правду о директоре",
  status: "active",  // Could change to "completed" manually
  turnCreated: 5
}
```

---

## Example 5: Pattern Variety

### Various Russian Patterns

| Input Text | Extracted Goal |
|------------|----------------|
| "Цель Максима: найти улики" | "найти улики" |
| "Максим хочет узнать правду" | "узнать правду" |
| "Максим намерен раскрыть заговор" | "раскрыть заговор" |
| "Максим решил помочь Хлое" | "помочь хлое" |
| "Максим планирует устроить ловушку" | "устроить ловушку" |
| "Максим мечтает о справедливости" | "о справедливости" |
| "Его цель — победить директора" | "победить директора" |

### Various English Patterns

| Input Text | Extracted Goal |
|------------|----------------|
| "Maxim wants to find evidence" | "find evidence" |
| "Maxim plans to expose the conspiracy" | "expose the conspiracy" |
| "Maxim intends to help Chloe" | "help chloe" |
| "Maxim decided to set a trap" | "set a trap" |
| "Maxim's goal is to win" | "is to win" |
| "The goal of Maxim: reveal the truth" | "reveal the truth" |

---

## Example 6: Context Priority

### Full Context Overlay Example (Turn 30)

```
⟦INTENT⟧ Максим ищет улики в кабинете директора           [PRIORITY: 1000]
⟦TASK⟧ NOW WRITE A RECAP: ...                             [PRIORITY: 900]
⟦CANON⟧ Максим и Хлоя are friends. Эшли: investigator.   [PRIORITY: 800]
⟦GOAL⟧ Цель Максим: узнать правду о директоре             [PRIORITY: 750] ← NEW
⟦GOAL⟧ Цель Хлоя: стать звездой театра                    [PRIORITY: 750] ← NEW
⟦OPENING⟧ Первый урок начался с неожиданного объявления.  [PRIORITY: 700]
⟦SCENE⟧ Focus on: Максим, Хлоя                            [PRIORITY: 600]
⟦SCENE⟧ Recently active: Эшли                              [PRIORITY: 500]
⟦GUIDE⟧ Lincoln Heights school drama. Third person.       [PRIORITY: 400]
⟦GUIDE⟧ 2–4 short paragraphs. Show emotions.              [PRIORITY: 400]
⟦META⟧ Turn 30, 10 since recap, 20 since epoch.           [PRIORITY: 100]
```

**Goal entries are prioritized between CANON and OPENING**, ensuring they have high visibility to the AI while not overriding immediate player intent or tasks.

---

## Example 7: Character Normalization

### Input Variations (All create same goal)

```
"Макс хочет узнать правду"           → character: "Максим"
"Max wants to learn the truth"        → character: "Максим"
"Maxim plans to discover"             → character: "Максим"
"Бергман намерен раскрыть"           → character: "Максим"
"Bergman's goal is to reveal"         → character: "Максим"
```

All variations normalize to **"Максим"** - the canonical character name.

### Supported Characters

- **Максим** (Макс, Max, Maxim, Бергман, Bergman)
- **Хлоя** (Хлои, Chloe, Харпер, Harper)
- **Эшли** (Эш, Ash, Ashley)
- **Миссис Грейсон** (Грейсон, Grayson, Учительница, Teacher)
- **Директор Ковальски** (Ковальски, Kovalski, Директор, Principal)

---

## Example 8: Filtering and Validation

### Valid Goals (Accepted)
```
✅ "Максим хочет узнать правду о директоре"              (length: 32)
✅ "win the competition"                                  (length: 19)
✅ "найти улики против директора в его кабинете"        (length: 44)
```

### Invalid Goals (Rejected)
```
❌ "узнать"                                               (too short: < 8 chars)
❌ "очень длинный текст цели который превышает..."       (too long: > 200 chars)
❌ "Неважный Персонаж хочет что-то сделать"              (not important character)
```

---

## Example 9: AI Behavior Impact

### Without Goals
```
AI Output:
"Максим вошёл в кабинет директора. Он осмотрелся по сторонам. 
На столе лежали какие-то бумаги. Максим подумал, стоит ли ему 
их взять."
```

### With Goals (⟦GOAL⟧ Цель Максим: узнать правду о директоре)
```
AI Output:
"Максим тихо закрыл дверь кабинета за собой. Его сердце билось 
чаще — это был его шанс наконец узнать правду. На столе директора 
лежала папка с надписью 'Конфиденциально'. Максим решительно 
потянулся к ней, помня о своей цели раскрыть секреты директора."
```

**The goal in context helps the AI:**
- Maintain character motivation consistency
- Drive plot forward toward established objectives
- Create more purposeful character actions
- Reference goals naturally in narration

---

## Summary

**Goal Tracking provides:**
1. ✅ Automatic extraction from narrative text
2. ✅ Persistent storage in state
3. ✅ High-priority context injection
4. ✅ Character normalization
5. ✅ Age-based filtering (20-turn window)
6. ✅ Support for Russian and English
7. ✅ AI behavior guidance
8. ✅ Long-term narrative consistency
