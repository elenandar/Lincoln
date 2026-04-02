### 4.2 Character Mood and Status System (MoodEngine)

#### Overview

The **MoodEngine** automatically detects and tracks the emotional state of characters in the narrative. It analyzes output text for emotional markers and creates temporary mood statuses that influence future AI responses.

**Key capabilities:**
1. **Automatic Detection** - Recognizes emotional markers in Russian text
2. **Temporal Tracking** - Moods expire after 5 turns
3. **Context Integration** - Active moods appear in AI context via `⟦MOOD⟧` tags
4. **Character-Specific** - Tracks individual mood states per character
5. **Extended Emotion Set** - Includes complex social emotions like embarrassment, jealousy, guilt

#### State Structure

Moods are stored in the following format:

```javascript
state.lincoln.character_status = {
  "Максим": {
    mood: "angry",
    reason: "ссора с Хлоей",
    expires: 15  // Turn number when mood expires
  },
  "Хлоя": {
    mood: "embarrassed",
    reason: "неловкость",
    expires: 18
  }
}
```

#### Pattern Recognition

The system recognizes **10 mood types** with multiple Russian markers for each:

**Angry (злость):**
- Russian: `разозлился`, `был зол`, `в ярости`, `рассердился`

**Happy (радость):**
- Russian: `был счастлив`, `обрадовался`, `в восторге`

**Scared (страх):**
- Russian: `испугался`, `был напуган`, `в страхе`, `в панике`

**Tired (усталость):**
- Russian: `устал`, `изнемог`, `измучен`, `без сил`

**Wounded (ранен):**
- Russian: `ранен`, `травмирован`, `получил рану`

**Embarrassed (смущение):**
- Russian: `смутился`, `покраснела`, `стало неловко`, `не в своей тарелке`

**Jealous (ревность):**
- Russian: `приревновала`, `укол ревности`, `заревновал`, `съедала ревность`

**Offended (обида):**
- Russian: `обиделся`, `задели слова`, `надулась`, `обиженно ответила`

**Guilty (вина):**
- Russian: `почувствовал себя виноватым`, `мучила совесть`, `сожалела о содеянном`

**Disappointed (разочарование):**
- Russian: `разочаровался в нем`, `полное разочарование`, `испытала разочарование`

#### Context Integration

Active moods appear in context overlay as `⟦MOOD⟧` entries with **priority weight 725** (between GOAL at 750 and OPENING at 700):

```
⟦CANON⟧ Максим и Хлоя are friends. Максим: suspicious of principal.
⟦GOAL⟧ Цель Максим: узнать правду о директоре
⟦MOOD⟧ Максим зол из-за недавней ссоры с Хлоей
⟦OPENING⟧ Первый урок начался с неожиданного объявления.
```

**Filtering Rules:**
- Only active moods (current turn < expires) are shown
- Each character can have one active mood at a time
- New moods overwrite previous ones for the same character
- Moods automatically expire after 5 turns

#### Practical Examples

**Example 1: Basic Mood Detection**

Input: `"Максим разозлился после ссоры с Хлоей."`

Result:
```javascript
L.character_status["Максим"] = {
  mood: "angry",
  reason: "ссора",
  expires: 15  // current turn + 5
}
```

Context: `⟦MOOD⟧ Максим зол из-за ссора`

**Example 2: Social Emotion Detection**

Input: `"Хлоя покраснела и почувствовала себя не в своей тарелке."`

Result:
```javascript
L.character_status["Хлоя"] = {
  mood: "embarrassed",
  reason: "неловкость",
  expires: 18
}
```

Context: `⟦MOOD⟧ Хлоя: scared (threat)`

**Example 3: Multiple Character Moods**

All active moods appear in context together:

```
⟦CANON⟧ [character relationships]
⟦GOAL⟧ Цель Максим: узнать правду о директоре
⟦MOOD⟧ Максим зол из-за ссора
⟦MOOD⟧ Хлоя напугана из-за угроза
⟦MOOD⟧ Эшли ранена (ранение)
⟦SCENE⟧ Focus on: Максим, Хлоя
```

#### Mood Lifecycle

```
Turn 10: Mood detected from text
Turn 10-14: Mood appears in context (active)
Turn 15: Mood expires, removed from context
```

#### Configuration

| Parameter | Current Value | Location | Description |
|-----------|---------------|----------|-------------|
| Mood duration | 5 turns | `MoodEngine.analyze()` | How long moods stay active |
| Priority weight | 725 | `composeContextOverlay()` | Context priority level |
| Pattern count | ~30 patterns | `MoodEngine.analyze()` | Total mood detection patterns |

#### Architecture

The mood tracking system integrates across multiple modules:

```
Output v16.0.8.patched.txt
    ↓ Calls: LC.MoodEngine.analyze(text)
Library v16.0.8.patched.txt
    ↓ Extract character + mood markers from text
    ↓ Validate and store
state.lincoln.character_status
    ↓ Read by composeContextOverlay()
Library v16.0.8.patched.txt
    ↓ Filter: turn < expires
    ↓ Format: "⟦MOOD⟧ {char} {mood description}"
Context v16.0.8.patched.txt
    → AI sees moods in context
```

#### Impact on AI Behavior

Moods in context help the AI:
- Generate emotionally consistent character actions
- Maintain emotional continuity across turns
- Create realistic character interactions based on current state
- Reference emotional states naturally in narration

**Without Moods:**
```
"Максим встретил Хлою в коридоре. Они поздоровались и разошлись."
```

**With Moods (⟦MOOD⟧ Максим зол из-за недавней ссоры с Хлоей):**
```
"Максим увидел Хлою в конце коридора. Воспоминания о вчерашней 
ссоре всё ещё жгли его изнутри. Он сжал челюсти и отвернулся, 
не желая с ней разговаривать. Хлоя заметила его холодный взгляд 
и опустила глаза, проходя мимо."
```

---
