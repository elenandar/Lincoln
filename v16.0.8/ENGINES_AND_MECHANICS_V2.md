# Lincoln v16.0.8 — Движки и Механики (V2)

> Собрано на основе прямого анализа исходного кода v16.0.8.  
> Источники: `Library v16.0.8.patched.txt`, `Output v16.0.8.patched.txt`, `Input v16.0.8.patched.txt`, `Context v16.0.8.patched.txt`

---

## Содержание

1. [Инфраструктура](#1-инфраструктура)  
   - [LC namespace и глобальная инициализация](#lc-namespace-и-глобальная-инициализация)  
   - [lcInit()](#lcinit)  
   - [lcSys() / lcWarn() / lcError() / lcDebug()](#lcsys--lcwarn--lcerror--lcdebug)  
   - [lcConsumeMsgs()](#lcconsumemsgs)  
   - [replyStop()](#replystop)  
   - [CONFIG](#config)  
   - [composeContextOverlay()](#composecontextoverlay)  
   - [CommandsRegistry](#commandsregistry)  
   - [stateVersion + _contextCache](#stateversion--_contextcache)  
2. [Движки (Engines)](#2-движки-engines)  
   - [LC.EvergreenEngine](#lcevergreenengine)  
   - [LC.UnifiedAnalyzer](#lcunifiedanalyzer)  
   - [LC.GoalsEngine](#lcgoalsengine)  
   - [LC.RelationsEngine](#lcrelationsengine)  
   - [LC.InformationEngine](#lcinformationengine)  
   - [LC.KnowledgeEngine](#lcknowledgeengine)  
   - [LC.MoodEngine](#lcmoodengine)  
   - [LC.EnvironmentEngine](#lcenvironmentengine)  
   - [LC.GossipEngine](#lcgossipengine)  
   - [LC.CharacterGC](#lccharactergc)  
   - [LC.ChronologicalKnowledgeBase](#lcchronologicalknowledgebase)  
   - [LC.TimeEngine](#lctimeengine)  
   - [LC.LivingWorld](#lcliving-world)  
   - [LC.AcademicsEngine](#lcacademicsengine)  
   - [LC.Crucible (CrucibleEngine)](#lccrucible-crucibleengine)  
   - [LC.QualiaEngine](#lcqualiaengine)  
   - [LC.NormsEngine](#lcnormsengine)  
   - [LC.HierarchyEngine](#lchierarchyengine)  
   - [LC.MemoryEngine](#lcmemoryengine)  
   - [LC.LoreEngine](#lcloreengine)  
   - [LC.DemographicPressure](#lcdemographicpressure)  
   - [LC.SceneDetectionEngine](#lcscenedetectionengine)  
3. [Механики](#3-механики)  
   - [Anti-Echo](#anti-echo)  
   - [Recap System V2](#recap-system-v2)  
   - [Context Caching](#context-caching)  
   - [Unified Analysis Pipeline](#unified-analysis-pipeline)  
   - [Defensive Programming / Hardening Protocol](#defensive-programming--hardening-protocol)  
   - [Event Tracking & Scoring](#event-tracking--scoring)  
   - [Character Activity Tracking](#character-activity-tracking)  
4. [Полная таблица slash-команд](#4-полная-таблица-slash-команд)  
5. [Теги контекстного оверлея](#5-теги-контекстного-оверлея)  
6. [Структура state.lincoln](#6-структура-statelincoln)  
7. [Связи между движками](#7-связи-между-движками)  

---

## 1. Инфраструктура

### LC namespace и глобальная инициализация

`LC` — глобальный объект-пространство имён. Создаётся через `globalThis.LC ||= {}` при первой загрузке Library. Все движки и утилиты регистрируются на этом объекте через `Object.assign(LC, { ... })`. Версия данных: `"16.0.8-compat6d"`.

Инициализация идемпотентна: повторная загрузка Library не перезаписывает уже установленные движки. Конфиг из `state.lincoln_config` рекурсивно мержится в `LC.CONFIG` при каждом вызове `lcInit()`.

---

### lcInit()

**Сигнатура:** `LC.lcInit(slot?: string): object`

Главная точка входа для получения и инициализации объекта состояния Lincoln. Возвращает `state.lincoln` (создаёт если отсутствует).

**Что делает:**
1. Создаёт/возвращает `state.lincoln` (`L`).
2. Записывает `L._modsSeen[slot] = DATA_VERSION` и проверяет совпадение версий между слотами.
3. Инициализирует `LC._contextCache` если отсутствует.
4. Устанавливает все дефолтные значения для всех полей `L` (turn, characters, goals, time, rumors, lore, academics, society, evergreen и т.д.).
5. Мержит `state.lincoln_config` в `LC.CONFIG`.
6. Запускает `MemoryEngine.runMythologization()` каждые 100 ходов.

**Вызывается:** всеми движками в начале каждого метода; Input.js и Output.js при старте.

---

### lcSys() / lcWarn() / lcError() / lcDebug()

Системные методы для добавления сообщений в очередь `L.sysMsgs`.

| Метод | Описание |
|-------|----------|
| `lcSys(msg, options?)` | Добавляет `⟦SYS⟧ <msg>` с уровнем `'character'` или `'director'` |
| `lcWarn(m)` | Добавляет `⟦SYS⟧ ⚠️ <m>` |
| `lcError(m)` | Добавляет `⟦SYS⟧ ❌ <m>` + инкрементирует `L.tm.errors` |
| `lcDebug(m)` | Добавляет `⟦SYS⟧ 🔍 <m>` (только если `L.debugMode === true`) |

Лимит очереди: `CONFIG.LIMITS.SYS_MSGS_MAX` (15). При переполнении — обрезание до 50%.

---

### lcConsumeMsgs()

**Сигнатура:** `LC.lcConsumeMsgs(): Array<{text: string, level: string}>`

Извлекает и очищает очередь `L.sysMsgs`. Нормализует все сообщения к объектному формату `{text, level}`. Вызывается Output.js для рендеринга системных сообщений.

---

### replyStop()

**Сигнатура:** `replyStop(msg: string): { text: string, stop: true }`

Определена в `Input v16.0.8.patched.txt`. Возвращает объект с остановкой обработки. Регистрируется как `LC.replyStop`. Также существует `replyStopSilent()` — без сообщения.

---

### CONFIG

Статический объект конфигурации, задаётся в Library и мержится с пользовательским `state.lincoln_config`.

**Ключевые поля:**
```
CONFIG.VERSION                    = "16.0.8-compat6d"
CONFIG.DATA_VERSION               = "16.0.8-compat6d"
CONFIG.CHAR_WINDOW_HOT            = 3      // "горячее" окно (ходы)
CONFIG.CHAR_WINDOW_ACTIVE         = 10     // "активное" окно (ходы)
CONFIG.LIMITS.CONTEXT_LENGTH      = 800    // символов для оверлея
CONFIG.LIMITS.SYS_MSGS_MAX        = 15     // макс. сообщений в очереди
CONFIG.LIMITS.CARDS_MAX           = 50
CONFIG.LIMITS.CADENCE.MIN         = 6
CONFIG.LIMITS.CADENCE.MAX         = 24
CONFIG.LIMITS.CADENCE.DEFAULT     = 12
CONFIG.LIMITS.EVERGREEN_MAX_PER_CATEGORY = 5
CONFIG.LIMITS.EVERGREEN_HISTORY_CAP      = 400
CONFIG.LIMITS.RUMOR_HARD_CAP      = 150
CONFIG.LIMITS.EXTENDED_STORE_CAP  = 120
CONFIG.LIMITS.EVENTS_WINDOW_TURNS = 50
CONFIG.LIMITS.LORE_ACTIVE_CAP     = 5
CONFIG.LIMITS.ANTI_ECHO.MIN_LENGTH               = 200
CONFIG.LIMITS.ANTI_ECHO.SIMILARITY_THRESHOLD_DEFAULT = 0.85
CONFIG.LIMITS.ANTI_ECHO.TRIM_PERCENTAGE          = 0.75
CONFIG.LIMITS.ANTI_ECHO.CONTINUE_TRIM            = 0.60
CONFIG.LIMITS.ANTI_ECHO.CHECK_TAIL_LENGTH        = 300
CONFIG.LIMITS.ANTI_ECHO.CACHE_MAX                = 1024
CONFIG.FEATURES.USE_NORM_CACHE    = false
CONFIG.FEATURES.ANALYZE_RELATIONS = true
CONFIG.ACADEMIC_SUBJECTS          = ['Математика','Литература','История','Химия']
CONFIG.GRADES_HISTORY_LIMIT       = 10
CONFIG.RECAP_V2.SCORE_THRESHOLD   = 1.0
CONFIG.RECAP_V2.COOLDOWN_TURNS    = 3
CONFIG.RECAP_V2.DECAY_HALF_LIFE   = 12
CONFIG.RECAP_V2.AUTO_EPOCH_SCORE  = 1.5
CONFIG.RECAP_V2.AUTO_EPOCH_WINDOW = 8
CONFIG.RECAP_V2.AUTO_EPOCH_MIN_RECAPS = 2
```

---

### composeContextOverlay()

**Сигнатура:** `LC.composeContextOverlay(options?: { limit?: number, allowPartial?: boolean }): { text: string, parts: object, max: number }`

Определена в Library (~строки 9305–9800). Собирает текстовый оверлей для AI-контекста. Использует кэш `LC._contextCache` (инвалидируется по `L.stateVersion`).

**Порядок приоритетов тегов (убывание):**
1. `⟦INTENT⟧` (1000)
2. `⟦TASK⟧` (900)
3. `⟦CANON⟧` (800)
4. `⟦SUGGESTION⟧` (760)
5. `⟦GOAL⟧` (750)
6. `⟦SECRET⟧` (740)
7. `⟦CONFLICT: Name⟧` (735)
8. `⟦TRAITS: Name⟧` (730)
9. `⟦STATUS: Name⟧` (728)
10. `⟦QUALIA: Name⟧` (727)
11. `⟦PERCEPTION: Name⟧` (726)
12. `⟦MOOD⟧` (725)
13. `⟦OPENING⟧` (700)
14. `⟦SCENE⟧ Focus on:` (600)
15. `⟦SCENE⟧ Recently active:` (500)
16. `⟦GUIDE⟧` (400)
17. `⟦ZEITGEIST⟧` (включается через MemoryEngine)
18. `⟦SCHEDULE⟧`
19. `⟦TIME⟧`
20. `⟦WORLD⟧` (200)
21. `⟦META⟧` (100)

---

### CommandsRegistry

`LC.CommandsRegistry` — объект `Map` (не `LC.Commands` — это псевдоним). Все slash-команды регистрируются через `LC.CommandsRegistry.set(name, { handler, description, bypass? })`.

---

### stateVersion + _contextCache

`L.stateVersion` — счётчик, инкрементируется при каждом изменении состояния движками. Используется как ключ инвалидации кэша контекста.

`LC._contextCache` — объект-кэш на уровне LC (не state). Ключ — `JSON.stringify(options)`, значение — `{ stateVersion, result }`. Очищается при `L.turn <= 0` (новая сессия).

---

## 2. Движки (Engines)

### LC.EvergreenEngine

**Расположение:** Library, строки ~2302–3143

**Назначение:** Долговременная память о фактах, статусах, отношениях и обязательствах персонажей.

**Ключевые методы:**

| Метод | Описание |
|-------|----------|
| `analyze(text, actionType)` | Парсит текст регулярками, извлекает отношения/статусы/обязательства/факты, инкрементирует `stateVersion` |
| `getCanon()` | Возвращает строку с key-фактами для `⟦CANON⟧` |
| `getSummary()` | Возвращает текстовый отчёт о состоянии (количество отношений, статусов, фактов) |
| `toggle(on)` | Включает/выключает движок (`L.evergreen.enabled`) |
| `clear()` | Полностью очищает `L.evergreen` |
| `limitCategories(L)` | Обрезает каждую категорию до `CONFIG.LIMITS.EVERGREEN_MAX_PER_CATEGORY` (5) |
| `_buildPatterns()` | Компилирует Unicode-aware regexp-паттерны для всех категорий |
| `normalizeCharName(name)` | Нормализует имена персонажей с учётом псевдонимов и склонений |
| `isImportantCharacter(name)` | Проверяет, является ли персонаж ключевым |
| `evergreenManualSet(L, cat, key, val)` | Ручная установка значения через `/evergreen set` |

**State:** `L.evergreen` — `{ enabled, relations, status, obligations, facts, history[], lastUpdate }`

**Slash-команды:** `/evergreen on|off|clear|summary|set <cat>: <value>`

**Связи:** Вызывается `UnifiedAnalyzer`. Паттерны переиспользует `UnifiedAnalyzer._buildUnifiedPatterns()`. `GoalsEngine` зависит от `EvergreenEngine.patterns`.

---

### LC.UnifiedAnalyzer

**Расположение:** Library, строки ~3145–3477

**Назначение:** Единый конвейер анализа текста — последовательно вызывает все аналитические движки.

**Ключевые методы:**

| Метод | Описание |
|-------|----------|
| `analyze(text, actionType)` | Главный метод. Вызывает TimeEngine, EvergreenEngine, GoalsEngine, MoodEngine, EnvironmentEngine, GossipEngine, RelationsEngine, HierarchyEngine, LoreEngine, SceneDetectionEngine |

**Порядок вызовов в `analyze()`:**
1. `TimeEngine.processSemanticAction()` (из ChronologicalKnowledgeBase)
2. `EvergreenEngine.analyze()`
3. `GoalsEngine.analyze()`
4. `MoodEngine.analyze()`
5. `EnvironmentEngine.analyze()`
6. `GossipEngine.analyze()`
7. `RelationsEngine.analyze()` (если `FEATURES.ANALYZE_RELATIONS`)
8. `HierarchyEngine.recalculateStatus()` / `HierarchyEngine.applyReputationShock()`
9. `LoreEngine.observe()`
10. `SceneDetectionEngine.analyze()`

Каждый вызов обёрнут в try/catch с `lcWarn`.

---

### LC.GoalsEngine

**Расположение:** Library, строки ~3538–4028

**Назначение:** Отслеживание целей персонажей, извлечённых из текста.

**Ключевые методы:**

| Метод | Описание |
|-------|----------|
| `analyze(text, actionType)` | Парсит текст, извлекает цели важных персонажей, сохраняет в `L.goals` |
| `generateAcademicGoal(L)` | Генерирует академическую цель на основе GPA персонажа |

**State:** `L.goals` — объект `{ [goalKey]: { character, text, status, turnCreated, plan[], planProgress, academicGoal?, currentGPA? } }`

**Связи:** Вызывается `UnifiedAnalyzer`. Использует паттерны из `EvergreenEngine`. Интегрируется с `AcademicsEngine` (академические цели).

---

### LC.RelationsEngine

**Расположение:** Library, строки ~4033–4563

**Назначение:** Управление отношениями между персонажами. Поддерживает как старую симметричную систему (`evergreen.relations`), так и новую асимметричную (через `character.perceptions`).

**Ключевые методы:**

| Метод | Описание |
|-------|----------|
| `getRelation(char1, char2)` | Возвращает значение отношения (число или объект) |
| `getVector(char1, char2, vector)` | Возвращает конкретный вектор (affection/trust/respect/rivalry, 0–100) |
| `updateRelation(char1, char2, change, options)` | Обновляет отношения; при наличии `interpretedEvent` использует `InformationEngine` |
| `analyze(text)` | Парсит текст на события отношений |

**Векторы (для новой системы):** `affection`, `trust`, `respect`, `rivalry` (0–100, нейтраль = 50)

**Модификаторы:** romance +15, conflict −10, betrayal −25, loyalty +10, public_accusation −15, public_humiliation −20, loyalty_rescue +12

**State:** `L.evergreen.relations` (legacy) + `L.characters[name].perceptions` (новая)

**Связи:** Вызывается `UnifiedAnalyzer`. Использует `InformationEngine.interpret()` для асимметричных восприятий. Изменения фиксирует `Crucible.analyzeEvent()`.

---

### LC.InformationEngine

**Расположение:** Library, строки ~4568–4780

**Назначение:** Субъективная интерпретация событий через призму состояния персонажа (`qualia_state`).

**Ключевые методы:**

| Метод | Описание |
|-------|----------|
| `interpret(character, event)` | Интерпретирует событие через `qualia_state` персонажа; возвращает `subjectiveModifier` |
| `updatePerception(perceiver, perceived, interpretation)` | Обновляет `character.perceptions[other]` на основе интерпретации |
| `_findRelevantLegend(event)` | Ищет релевантную легенду из `L.lore.entries` для усиления реакции (Genesis Phase 2) |

**Логика:** Один и тот же комплимент при `somatic_tension > 0.8` интерпретируется как сарказм; при `valence > 0.7` — как искренность.

**State:** `L.characters[name].perceptions`, `L.characters[name].qualia_state`

**Связи:** Вызывается `RelationsEngine.updateRelation()`. Использует `LoreEngine` данные (lore entries). Влияет на `QualiaEngine`.

---

### LC.KnowledgeEngine

**Расположение:** Library, строки ~4783–4822 (встроен внутри MoodEngine блока)

**Назначение:** Система секретов — фильтрация секретов по текущим персонажам сцены.

**Ключевые методы:**

| Метод | Описание |
|-------|----------|
| `extractFocusCharacters(contextText)` | Парсит `⟦SCENE⟧ Focus on:` и возвращает список персонажей |
| `isSecretVisible(secret, focusCharacters)` | Проверяет, знает ли кто-то из фокус-персонажей данный секрет |

**State:** `L.secrets[]` — массив `{ text, known_by[] }`

**Связи:** Вызывается `composeContextOverlay()` для фильтрации `⟦SECRET⟧` тегов.

---

### LC.MoodEngine

**Расположение:** Library, строки ~4824–5113

**Назначение:** Отслеживание настроений персонажей с временным ограничением (TTL).

**Ключевые методы:**

| Метод | Описание |
|-------|----------|
| `analyze(text)` | Детектирует изменения настроения (angry, happy, scared, tired, wounded, offended, embarrassed); записывает в `L.character_status` с `expires` |

**Поддерживаемые состояния:** angry, happy, scared, tired, wounded, offended, embarrassed, melancholic, anxious, cheerful, excited

**State:** `L.character_status` — `{ [charName]: { mood, reason, expires } }`

**Связи:** Вызывается `UnifiedAnalyzer`, `EnvironmentEngine.applyWeatherMoodEffects()`, `AcademicsEngine.recordGrade()`. Данные используются `composeContextOverlay()` для `⟦MOOD⟧`.

---

### LC.EnvironmentEngine

**Расположение:** Library, строки ~5118–5244

**Назначение:** Отслеживание и симуляция окружающей среды (локация, погода, атмосфера).

**Ключевые методы:**

| Метод | Описание |
|-------|----------|
| `detectLocation(text)` | Определяет локацию по русскоязычным паттернам |
| `changeWeather(newWeather, silent?)` | Изменяет погоду, инкрементирует `stateVersion`, с вероятностью 20% влияет на настроения |
| `applyWeatherMoodEffects(weather)` | Применяет эффекты погоды к случайному активному персонажу |
| `analyze(text)` | Детектирует смену локации и обновляет `L.environment.location` |

**Типы погоды:** clear, rain, snow, storm, fog, cloudy

**Локации:** classroom, cafeteria, gym, library, hallway, schoolyard, park, home, street

**State:** `L.environment` — `{ weather, location, ambiance }`

**Slash-команды:** `/weather`, `/weather set <type>`, `/location`, `/location set <name>`

**Связи:** Вызывается `UnifiedAnalyzer`. Вызывает `MoodEngine` при смене погоды.

---

### LC.GossipEngine

**Расположение:** Library, строки ~5249–5682

**Назначение:** Симуляция системы слухов и репутации персонажей.

**Ключевые методы:**

| Метод | Описание |
|-------|----------|
| `generateRumorId()` | Генерирует уникальный ID слуха |
| `Observer.watch(text)` | Отслеживает события и генерирует слухи |
| `Propagator.spreadRumor(rumorId, from, to)` | Распространяет слух от персонажа к персонажу |
| `analyze(text)` | Запускает Observer и Propagator |
| `GossipGC.run()` | Сборщик мусора: удаляет устаревшие слухи (лимит `RUMOR_HARD_CAP = 150`) |

**State:** `L.rumors[]` — массив слухов; `L.characters[name].reputation` (0–100, нейтраль = 50)

**Slash-команды:** `/rumor`, `/rumor add <text> about <char>`, `/rumor spread <id> from <char1> to <char2>`, `/reputation`, `/reputation set <char> <value>`

**Связи:** Вызывается `UnifiedAnalyzer`. `GossipGC.run()` вызывается из Output.js каждый ход.

---

### LC.CharacterGC

**Расположение:** Library, строки ~5688–5770

**Назначение:** Управление жизненным циклом персонажей (продвижение, заморозка, удаление).

**Ключевые методы:**

| Метод | Описание |
|-------|----------|
| `run()` | Запускает цикл GC: EXTRA→SECONDARY (>5 упоминаний за 50 ходов), SECONDARY→FROZEN (не виден >100 ходов), удаление EXTRA (не виден >200 ходов, ≤2 упоминания) |

**State:** `L.characters[name].type` (MAIN/SECONDARY/EXTRA), `L.characters[name].status` (ACTIVE/FROZEN), `L.characters[name].mentions`, `L.characters[name].lastSeen`

**Связи:** Вызывается из Output.js каждый ход.

---

### LC.ChronologicalKnowledgeBase

**Расположение:** Library, строки ~5775–6347

**Назначение:** База семантических паттернов для определения временны́х событий по тексту.

**Паттерны:** SLEEP (→ следующее утро), END_OF_SCHOOL_DAY (→ День), BREAKFAST (→ Утро), LUNCH (→ День), DINNER (→ Вечер), SHORT_TIME_JUMP (~1–2 часа), LONG_TIME_JUMP (1–2 дня).

**Использование:** Вызывается `UnifiedAnalyzer` для передачи семантических действий в `TimeEngine.processSemanticAction()`.

---

### LC.TimeEngine

**Расположение:** Library, строки ~6347–6468

**Назначение:** Управление игровым временем и календарём. Время теперь течёт семантически (через ChronologicalKnowledgeBase), не по счётчику ходов.

**Ключевые методы:**

| Метод | Описание |
|-------|----------|
| `advance()` | Читает и очищает `L.time.lastTimeJump`; возвращает информацию о прыжке для LivingWorld |
| `processSemanticAction(action)` | Обрабатывает действие: ADVANCE_TO_NEXT_MORNING, SET_TIME_OF_DAY, ADVANCE_TIME_OF_DAY, ADVANCE_DAY |

**State:** `L.time` — `{ currentDay, dayName, timeOfDay, turnsPerToD, turnsInCurrentToD, scheduledEvents[], lastTimeJump? }`

**Последовательность дней:** Понедельник–Воскресенье (циклически). Времена суток: Утро → День → Вечер → Ночь.

**Slash-команды:** `/time`, `/time set day N [Name]`, `/time next`

**Связи:** Вызывается `UnifiedAnalyzer`. При прыжке времени результат передаётся `LivingWorld` из Output.js.

---

### LC.LivingWorld

**Расположение:** Library, строки ~6473–7105

**Назначение:** Симуляция автономных действий NPC "за кадром" во время прыжков времени.

**Ключевые методы:**

| Метод | Описание |
|-------|----------|
| `simulate(timeJump)` | Главная точка входа. При прыжке ночи/дня генерирует NPC-активность |

**State:** Обновляет `L.characters`, `L.evergreen.relations`, `L.goals`

**Связи:** Вызывается из Output.js после `TimeEngine.advance()`. Взаимодействует с несколькими движками для генерации правдоподобных действий NPC.

---

### LC.AcademicsEngine

**Расположение:** Library, строки ~7110–7322

**Назначение:** Симуляция академической успеваемости (Bell Curve Protocol, Phase 1).

**Ключевые методы:**

| Метод | Описание |
|-------|----------|
| `calculateGrade(character, subject)` | Вычисляет оценку 1–5 на основе aptitude (50%), effort (30%), valence-настроения (20%) + случайность ±0.15 |
| `recordGrade(charName, subject, grade)` | Записывает оценку в `L.academics.grades[char][subject][]`; при высоких/низких оценках вызывает `MoodEngine.analyze()` |
| `getGPA(charName)` | Вычисляет средний балл персонажа |

**Предметы:** Математика, Литература, История, Химия (из `CONFIG.ACADEMIC_SUBJECTS`)

**State:** `L.academics` — `{ grades: { [charName]: { [subject]: [{grade, turn}] } } }`  
**Лимит истории:** `CONFIG.GRADES_HISTORY_LIMIT = 10` оценок на предмет (скользящее окно).

**Связи:** Вызывает `MoodEngine`. Данные GPA влияют на `GoalsEngine.generateAcademicGoal()`. Интеграция с `LoreEngine` для ACADEMIC_TRIUMPH/ACADEMIC_DISGRACE.

---

### LC.Crucible (CrucibleEngine)

**Расположение:** Library, строки ~7327–7646

**Назначение:** Эволюция личности и "Я-концепции" персонажей под воздействием ключевых событий.

**Ключевые методы:**

| Метод | Описание |
|-------|----------|
| `analyzeEvent(eventData)` | Анализирует событие; вызывает обработчики по типу; архивирует формирующие события |
| `_handleRelationChange(char, data, isImportant)` | Изменяет `self_concept` при значительных изменениях отношений (magnitude ≥ 30) |
| `_handleGoalComplete(char, data, isImportant)` | Изменяет `personality` и `self_concept` при достижении цели |
| `_handleRumorSpread(char, data, isImportant)` | Изменяет восприятие при распространении слухов |
| `_archiveFormativeEvent(eventData, char)` | Архивирует событие в `L.society.myths` для мифологизации |

**Персонажи:** Эволюция только для MAIN и SECONDARY типов.

**State:** `L.characters[name].personality` — `{ trust, bravery, idealism, aggression }` (0–1)  
`L.characters[name].self_concept` — `{ perceived_trust, perceived_bravery, perceived_idealism, perceived_aggression }` (0–1)

**Связи:** Интегрирован с `RelationsEngine`, `GoalsEngine`, `GossipEngine`. Архивированные события попадают в `MemoryEngine`.

---

### LC.QualiaEngine

**Расположение:** Library, строки ~7651–7800

**Назначение:** Симуляция первичных телесных ощущений персонажей (до когнитивной обработки).

**Ключевые методы:**

| Метод | Описание |
|-------|----------|
| `resonate(character, event)` | Напрямую изменяет `qualia_state` персонажа в ответ на событие |

**Типы событий:** social (compliment/insult/threat), environmental (loud_noise/calm), physical (pain/rest), achievement (success/failure)

**State:** `L.characters[name].qualia_state` — `{ somatic_tension [0–1], valence [0–1], focus_aperture [0–1], energy_level [0–1] }`

**Связи:** Вызывается `MoodEngine` (при public_accusation/humiliation). Данные используются `InformationEngine.interpret()` и `AcademicsEngine.calculateGrade()`. Крайние значения попадают в `⟦QUALIA: Name⟧` в оверлее.

---

### LC.NormsEngine

**Расположение:** Library, строки ~7805–7956

**Назначение:** Динамическое отслеживание неписаных социальных норм группы.

**Ключевые методы:**

| Метод | Описание |
|-------|----------|
| `processEvent(eventData)` | Анализирует реакции свидетелей; усиливает норму при >70% негативных реакций |
| `getNormStrength(normType)` | Возвращает силу нормы [0–1] с бонусами от `MemoryEngine` мифов и `LoreEngine` легенд |
| `_isCounterNorm(legendType, normType)` | Определяет, противоречит ли легенда норме |

**State:** `L.society.norms` — `{ [normType]: { strength, lastUpdate, violations, reinforcements } }`

**Связи:** Вызывает `HierarchyEngine.updateCapital()`. Использует данные `MemoryEngine.getMythStrengthForTheme()` и `LoreEngine` (Genesis Phase 2).

---

### LC.HierarchyEngine

**Расположение:** Library, строки ~7956–8310

**Назначение:** Расчёт социального статуса NPC (лидер/обычный/изгой) на основе социального капитала.

**Ключевые методы:**

| Метод | Описание |
|-------|----------|
| `updateCapital(charName, event)` | Обновляет `social.capital` персонажа; учитывает субъективные восприятия свидетелей |
| `recalculateStatus()` | Пересчитывает статусы всех персонажей по капиталу |
| `applyReputationShock(participants, type, multiplier)` | Применяет "шок репутации" при драматических событиях |

**Статусы:** leader (капитал > порога), member (нейтральный), outcast (капитал < порога)

**State:** `L.characters[name].social` — `{ capital, status }`

**Связи:** Вызывается `UnifiedAnalyzer` и `NormsEngine`. Статусы отображаются в `⟦STATUS: Name⟧` оверлея.

---

### LC.MemoryEngine

**Расположение:** Library, строки ~8312–8485

**Назначение:** Трансформация формирующих событий в абстрактные мифы коллективной памяти.

**Ключевые методы:**

| Метод | Описание |
|-------|----------|
| `runMythologization()` | Запускается каждые 100 ходов (`lcInit`). Конвертирует event_record-ы старше 50 ходов в мифы |
| `getDominantMyth()` | Возвращает самый сильный миф |
| `getMythStrengthForTheme(theme)` | Возвращает среднюю силу мифов данной темы |
| `_createMythFromEvent(record)` | Генерирует объект мифа с moral, hero, strength |
| `_pruneMythsIfNeeded()` | Оставляет до 20 самых сильных мифов |

**Темы мифов:** loyalty_rescue, betrayal, achievement, leadership

**State:** `L.society.myths[]` — массив `{ type: 'myth'|'event_record', theme, hero, moral, strength, createdTurn, originalTurn }`

**Связи:** Вызывается каждые 100 ходов из `lcInit.incrementTurn()`. Данные используются `NormsEngine.getNormStrength()` и `composeContextOverlay()` (`⟦ZEITGEIST⟧`).

---

### LC.LoreEngine

**Расположение:** Library, строки ~8485–8909

**Назначение:** Автоматическая кристаллизация самых значимых событий в "школьные легенды" — немедленные культурные артефакты (в отличие от мифов MemoryEngine).

**Ключевые методы:**

| Метод | Описание |
|-------|----------|
| `observe(text)` | Главная точка входа (из UnifiedAnalyzer). Прогоняет событие через 4 фильтра |
| `calculateLorePotential(event)` | Filter 1: оценивает потенциал события (0–100+): новизна (+50), импакт (+30), нарушение норм (+25), свидетели (+15), статус участников (+15) |
| `getCurrentThreshold()` | Filter 3: динамический порог = BASE_THRESHOLD(75) + 5 × количество легенд |
| `_isDuplicate(event)` | Filter 4: проверка дубликатов по типу + участникам (>50% совпадений) |
| `_crystallize(event)` | Создаёт `lore_entry` и добавляет в `L.lore.entries`; при превышении `LORE_ACTIVE_CAP=5` — архивирует старые |
| `_extractEventFromState(text)` | Определяет тип события из текста (betrayal/humiliation/romance/conflict и др.) |
| `_generateLoreText(event)` | Генерирует текстовое описание легенды |

**Filter 2 (Cooldown):** `COOL_DOWN_PERIOD = 200` ходов после создания легенды.

**Типы событий:** betrayal, public_humiliation, loyalty_rescue, romance, conflict, achievement, secret_reveal, ACADEMIC_TRIUMPH, ACADEMIC_DISGRACE

**State:** `L.lore` — `{ entries[], archive[], stats{}, coolDown }`  
Лимит активных легенд: `CONFIG.LIMITS.LORE_ACTIVE_CAP = 5`

**Связи:** Вызывается `UnifiedAnalyzer`. Данные используются `InformationEngine._findRelevantLegend()` (Genesis Phase 2) и `NormsEngine.getNormStrength()`.

---

### LC.DemographicPressure

**Расположение:** Library, строки ~3485–3538

**Назначение:** Система подсказок для создания новых персонажей при необходимости.

**Ключевые методы:**

| Метод | Описание |
|-------|----------|
| `analyze(text)` | Детектирует паттерны одиночества и потребности в экспертах; добавляет `⟦SUGGESTION⟧` |
| `getSuggestions()` | Возвращает текущие подсказки для оверлея |

**Детектируемые паттерны:** одиночество (один персонаж активен), нужен эксперт (взлом, расследование, медицина, ремонт, защита)

**State:** `L.population` — `{ unnamedStudents, unnamedTeachers }`; внутренний массив `suggestions[]`

**Связи:** Вызывается `composeContextOverlay()` для `⟦SUGGESTION⟧` тегов и `⟦WORLD⟧`.

---

### LC.SceneDetectionEngine

**Расположение:** Library, строки ~6040–6347 (внутри блока TimeEngine/ChronologicalKnowledgeBase)

**Назначение:** Определение типа сцены по ключевым словам на русском и английском языках.

**Ключевые методы:**

| Метод | Описание |
|-------|----------|
| `analyze(text)` | Определяет тип сцены из `sceneKeywords` |

**Типы сцен:** combat, romance, conflict, investigation, academic, social

**Словари:** Unicode-aware regexp паттерны на RU + EN для каждого типа сцены.

**State:** обновляет `L.currentAction` и внутренние флаги сцены

**Связи:** Вызывается `UnifiedAnalyzer` последним в конвейере.

---

## 3. Механики

### Anti-Echo

**Расположение:** Library, ~строки 2160–2300

**Назначение:** Предотвращение повторения AI одного и того же текста.

**Алгоритм:** Jaccard similarity между нормализованными "хвостами" (последние 300 символов) текущего и предыдущего вывода.

**Методы:**
- `antiEchoCheck(current, previous, actionType)` — вычисляет схожесть, кэширует результат (FNV-1a ключ)
- `applyAntiEcho(currentOutput, previousOutput, actionType)` — при обнаружении эха обрезает текст (75% при story, 60% при continue)
- `antiEchoStats()` — статистика (enabled, sensitivity, mode, cache size)
- `antiEchoFlush()` — очистка кэша

**Конфигурация:**
- `L.antiEchoEnabled` (bool, дефолт: true)
- `L.antiEchoSensitivity` (0–100, дефолт: 85%)
- `L.antiEchoMode` ("soft"/"hard")
- Soft mode: порог снижается на multiply при `continue`
- Hard mode: более строгий порог для `continue`

**Кэш:** `LC._echoCache` — FNV-1a → `{ isEcho, sim }`. Лимит CACHE_MAX=1024, soft prune 80% при достижении.

**Slash-команды:** `/antiecho on|off|sensitivity N|mode soft|hard|stats|flush`

---

### Recap System V2

**Расположение:** Library, ~строки 9022–9150

**Назначение:** Автоматическое предложение краткого изложения при достаточном накоплении событий.

**Компоненты:**
- `computeRecapScore()` — вычисляет score = (turns_since_recap / cadence) + взвешенные события с decay
- `checkRecapOfferV2()` — предлагает recap при score ≥ 1.0 и достаточном cooldown
- `checkAutoEpoch()` — автоматически планирует epoch при ≥2 рекапах за последние 8 ходов или score ≥ 1.5
- `syncRecapToStoryCards(text, window)` — сохраняет пункты рекапа как Story Cards

**Веса событий:** conflict 1.0, romance 1.2, authority 0.8, achievement 0.9, reveal 1.1, betrayal 1.3, loyalty 0.9, social_upheaval 1.4, secret_reveal 1.5, goal_outcome 1.2, dramatic 1.6

**Decay:** экспоненциальный с half-life = 12 ходов

**State:** `L.cadence`, `L.lastRecapTurn`, `L.lastEpochTurn`, `L.recapDraft`, `L.epochDraft`, `L.recapMuteUntil`, `L.tm.recapTurns[]`

**Slash-команды:** `/recap`, `/epoch`, `/continue`, `/cadence N`

---

### Context Caching

**Расположение:** Library (в `composeContextOverlay()` и `lcInit()`)

**Назначение:** Кэширование результата сборки контекстного оверлея для повышения производительности.

**Алгоритм:**
1. Ключ = `JSON.stringify(options)`
2. Кэш = `LC._contextCache[key]` — хранит `{ stateVersion, result }`
3. При совпадении `stateVersion` — возвращает кэш без пересборки
4. Инвалидируется любым изменением состояния (все движки вызывают `L.stateVersion++`)
5. Сбрасывается при `L.turn <= 0` (новая сессия)

---

### Unified Analysis Pipeline

**Расположение:** `LC.UnifiedAnalyzer.analyze()`

**Назначение:** Единая точка входа для анализа каждого хода. Вызывается из Output.js после каждого нового хода.

**Поток данных:**
```
Output.js → UnifiedAnalyzer.analyze(text, actionType)
  ├── ChronologicalKnowledgeBase → TimeEngine.processSemanticAction()
  ├── EvergreenEngine.analyze()
  ├── GoalsEngine.analyze()
  ├── MoodEngine.analyze()
  ├── EnvironmentEngine.analyze()
  ├── GossipEngine.analyze()
  ├── RelationsEngine.analyze() [если FEATURES.ANALYZE_RELATIONS]
  ├── HierarchyEngine.recalculateStatus()
  ├── LoreEngine.observe()
  └── SceneDetectionEngine.analyze()
```

Каждый шаг обёрнут в try/catch с `lcWarn`.

---

### Defensive Programming / Hardening Protocol

**Расположение:** `Context v16.0.8.patched.txt`

**Назначение:** При Retry или Continue контекст принудительно пересобирается с нуля для предотвращения "грязных" данных.

**Логика:**
```
if (isRetry || isContinue) && turn > 0:
  → composeContextOverlay({ allowPartial: false })
  → при пустом результате: return { text: "" }  // blanking вместо утечки
```

При успехе — возвращает полный пересобранный оверлей. При ошибке — `text: ""`.

Также: все движки используют опциональный chaining (`?.`) и try/catch для защиты от отсутствия зависимостей.

---

### Event Tracking & Scoring

**Расположение:** Library, методы `analyzeTextForEvents()`, `computeRecapScore()`

**Назначение:** Ведение лога значимых событий для системы рекапов.

**Паттерны событий (детектируются в тексте):** conflict, romance, authority, achievement, reveal, location, timeskip, betrayal, loyalty, social_upheaval, secret_reveal, goal_outcome, dramatic

**State:** `L.events[]` — `{ type, turn, weight, src }`. Лимит: 300 событий (скользящее окно `EVENTS_WINDOW_TURNS=50`).

---

### Character Activity Tracking

**Расположение:** Library, метод `updateCharacterActivity(text, isRetry)`

**Назначение:** Обновление счётчиков активности персонажей (`lastSeen`, `mentions`) при их упоминании в тексте.

**Автоматическое размораживание:** FROZEN → ACTIVE при следующем упоминании персонажа.

**State:** `L.characters[name].lastSeen`, `L.characters[name].mentions`, `L.characters[name].firstSeen`

---

## 4. Полная таблица slash-команд

| Команда | Движок / Система | Описание |
|---------|-----------------|----------|
| `/ui on\|off` | Инфраструктура | Включить/выключить системные сообщения |
| `/debug on\|off` | Инфраструктура | Включить/выключить режим отладки |
| `/mode director\|character` | Инфраструктура | Уровень доступа к информации |
| `/recap` | Recap System | Создать черновик рекапа |
| `/epoch` | Recap System | Создать черновик эпохи |
| `/continue` | Recap System | Сохранить черновик рекапа/эпохи |
| `/cadence N` | Recap System | Установить каденцию рекапа (6–24) |
| `/да` | Recap System | Подтвердить предложение рекапа |
| `/нет` | Recap System | Отклонить предложение рекапа |
| `/позже` | Recap System | Отложить рекап на 5 ходов |
| `/evergreen on\|off` | EvergreenEngine | Включить/выключить Evergreen |
| `/evergreen clear` | EvergreenEngine | Очистить Evergreen-хранилище |
| `/evergreen summary` | EvergreenEngine | Показать сводку Evergreen |
| `/evergreen set <cat>: <value>` | EvergreenEngine | Вручную установить значение |
| `/evhist cap N` | EvergreenEngine | Установить лимит истории |
| `/evhist last N` | EvergreenEngine | Показать последние N записей |
| `/evhist clear` | EvergreenEngine | Очистить историю |
| `/secret <text> known_by: <Name>` | KnowledgeEngine | Добавить секрет |
| `/time` | TimeEngine | Показать текущее время |
| `/time set day N [Name]` | TimeEngine | Установить день/название |
| `/time next` | TimeEngine | Перейти к следующему времени суток |
| `/weather` | EnvironmentEngine | Показать погоду |
| `/weather set <type>` | EnvironmentEngine | Изменить погоду |
| `/location` | EnvironmentEngine | Показать локацию |
| `/location set <name>` | EnvironmentEngine | Установить локацию |
| `/rumor` | GossipEngine | Список слухов |
| `/rumor add <text> about <char>` | GossipEngine | Добавить слух |
| `/rumor spread <id> from <c1> to <c2>` | GossipEngine | Распространить слух |
| `/reputation` | GossipEngine | Показать все репутации |
| `/reputation <char>` | GossipEngine | Репутация персонажа |
| `/reputation set <char> <value>` | GossipEngine | Установить репутацию |
| `/event add "<Name>" on day N` | TimeEngine | Запланировать событие |
| `/schedule` | TimeEngine | Показать расписание |
| `/antiecho on\|off` | Anti-Echo | Включить/выключить |
| `/antiecho sensitivity N` | Anti-Echo | Установить чувствительность (1–100) |
| `/antiecho mode soft\|hard` | Anti-Echo | Выбрать режим |
| `/antiecho stats` | Anti-Echo | Статистика |
| `/antiecho flush` | Anti-Echo | Сбросить кэш |
| `/events [N]` | Event Tracking | Показать последние события с весами |
| `/alias add <Name>=a,b,c` | EvergreenEngine | Добавить псевдонимы |
| `/alias del <Name>` | EvergreenEngine | Удалить псевдонимы |
| `/alias list` | EvergreenEngine | Список псевдонимов |
| `/characters` | CharacterGC | Список активных NPC |
| `/opening` | Инфраструктура | Показать захваченный opening |
| `/retry` | Инфраструктура | Информация о повторах |
| `/story add <text>` | Инфраструктура | Добавить запись в историю |
| `/story del <id>` | Инфраструктура | Удалить запись |
| `/cards` | Инфраструктура | Список Story Cards |
| `/pin <id>` | Инфраструктура | Псевдо-закрепить карточку |
| `/unpin <id>` | Инфраструктура | Открепить карточку |
| `/del <id>` | Инфраструктура | Удалить карточку по id |
| `/ctx` | composeContextOverlay | Инспекция состава оверлея |
| `/selftest` | Инфраструктура | Запустить системные тесты |
| `/help` | Инфраструктура | Показать помощь |
| `/stats` | Инфраструктура | Статистика системы |

---

## 5. Теги контекстного оверлея

| Тег | Приоритет | Источник | Условие показа |
|-----|-----------|---------|----------------|
| `⟦INTENT⟧` | 1000 | Инфраструктура | Если `L.lastIntent` не пустой |
| `⟦TASK⟧` | 900 | Инфраструктура | При задаче recap или epoch |
| `⟦CANON⟧` | 800 | EvergreenEngine | Если есть данные canon |
| `⟦SUGGESTION⟧` | 760 | DemographicPressure | При обнаружении нужды в персонаже |
| `⟦GOAL⟧` | 750 | GoalsEngine | Активные цели (созданы < 20 ходов назад) |
| `⟦SECRET⟧` | 740 | KnowledgeEngine | Секреты, известные HOT-персонажам |
| `⟦CONFLICT: Name⟧` | 735 | CrucibleEngine / RelationsEngine | Внутренний конфликт self_concept vs personality |
| `⟦TRAITS: Name⟧` | 730 | Crucible / RelationsEngine | Черты личности HOT-персонажей |
| `⟦STATUS: Name⟧` | 728 | HierarchyEngine | Статус leader/outcast для HOT-персонажей |
| `⟦QUALIA: Name⟧` | 727 | QualiaEngine | Крайние состояния somatic_tension/valence/focus/energy |
| `⟦PERCEPTION: Name⟧` | 726 | RelationsEngine / InformationEngine | Значимые асимметричные восприятия между HOT-персонажами |
| `⟦MOOD⟧` | 725 | MoodEngine | Активные настроения (expires > turn) |
| `⟦OPENING⟧` | 700 | Инфраструктура | Захваченный opening (если есть) |
| `⟦SCENE⟧ Focus on:` | 600 | Инфраструктура | HOT-персонажи (lastSeen ≤ CHAR_WINDOW_HOT=3) |
| `⟦SCENE⟧ Recently active:` | 500 | Инфраструктура | ACTIVE-персонажи (lastSeen ≤ CHAR_WINDOW_ACTIVE=10) |
| `⟦GUIDE⟧` | 400 | Инфраструктура | Постоянные стилевые инструкции (всегда) |
| `⟦ZEITGEIST⟧` | ~350 | MemoryEngine | При наличии доминирующего мифа |
| `⟦TIME⟧` | ~300 | TimeEngine | Если `L.time` инициализировано |
| `⟦SCHEDULE⟧` | ~290 | TimeEngine | Запланированные события на ближайшие 7 дней |
| `⟦WORLD⟧` | 200 | DemographicPressure | Данные о населении школы |
| `⟦META⟧` | 100 | Инфраструктура | Номер хода, время с рекапа/эпохи |

---

## 6. Структура state.lincoln

Все поля объекта `L = state.lincoln`:

```javascript
// === БАЗОВОЕ ===
L.version               // string: "16.0.8-compat6d"
L._modsSeen             // { Library: "16.0.8-compat6d", Input: ..., Output: ..., Context: ... }
L._versionCheckDone     // bool: флаг проверки версий
L.stateVersion          // number: счётчик инвалидации кэша
L.turn                  // number: номер текущего хода
L.lastProcessedTurn     // number
L.lastActionType        // string: "new"|"continue"|"retry"
L.currentAction         // { type, task?, wantRecap?, ... }

// === ВВОД/ВЫВОД ===
L.lastInput             // string: последний ввод
L.lastOutput            // string: последний вывод
L.prevOutput            // string: предпредыдущий вывод
L.lastIntent            // string: последнее намерение

// === СЧЁТЧИКИ ===
L.retryCount            // number
L.consecutiveRetries    // number
L.continueCount         // number

// === НАСТРОЙКИ ===
L.antiEchoEnabled       // bool (дефолт: true)
L.antiEchoSensitivity   // number 0–100 (дефолт: 85)
L.antiEchoMode          // "soft"|"hard"
L.cadence               // number 6–24 (дефолт: 12)
L.debugMode             // bool
L.sysShow               // bool (дефолт: true)
L.playerInfoLevel       // "director"|"character"
L.evergreenHistoryCap   // number (дефолт: 400)

// === OPENING ===
L.opening               // string
L.openingCaptured       // bool
L.openingTurn           // number
L.openingTTL            // number (дефолт: 15)

// === СИСТЕМНЫЕ СООБЩЕНИЯ ===
L.sysMsgs               // Array<{text, level}>

// === ПЕРСОНАЖИ И КАРТОЧКИ ===
L.characters            // { [name]: { type, status, mentions, lastSeen, firstSeen,
                        //   reputation, personality?, self_concept?, qualia_state?,
                        //   perceptions?, social?, aptitude?, effort?, gpa? } }
L.worldInfoIds          // string[]
L.pinnedWorldInfoIds    // string[]
L.aliases               // { [canonName]: string[] }

// === RECAP / EPOCH ===
L.lastRecapTurn         // number
L.lastEpochTurn         // number
L.recapDraft            // null | { text, turn, window }
L.epochDraft            // null | { text, turn }
L.recapMuteUntil        // number: ход до которого recap заглушён

// === СОБЫТИЯ И ТЕЛЕМЕТРИЯ ===
L.events                // Array<{ type, turn, weight, src }> (лимит: 300)
L.tm                    // { recapTurns[], echoCacheHits, errors, retries, wantRecapTurn, lastRecapScore }

// === EVERGREEN ===
L.evergreen             // { enabled, relations{}, status{}, obligations{}, facts{}, history[], lastUpdate }

// === ЦЕЛИ ===
L.goals                 // { [goalKey]: { character, text, status, turnCreated, plan[], planProgress, academicGoal?, currentGPA? } }

// === НАСТРОЕНИЯ ПЕРСОНАЖЕЙ ===
L.character_status      // { [charName]: { mood, reason, expires } }

// === СЕКРЕТЫ ===
L.secrets               // Array<{ text, known_by[] }>

// === ВРЕМЯ ===
L.time                  // { currentDay, dayName, timeOfDay, turnsPerToD, turnsInCurrentToD,
                        //   scheduledEvents[], lastTimeJump? }

// === ОКРУЖЕНИЕ ===
L.environment           // { weather, location, ambiance }

// === СЛУХИ ===
L.rumors                // Array<{ id, text, about, from, turn, ... }>

// === ПОПУЛЯЦИЯ ===
L.population            // { unnamedStudents, unnamedTeachers }

// === ОБЩЕСТВО (NormsEngine + MemoryEngine) ===
L.society               // { norms: { [type]: { strength, lastUpdate, violations, reinforcements } },
                        //   myths: Array<{ type, theme, hero, moral, strength, createdTurn }> }

// === ЛОР (LoreEngine) ===
L.lore                  // { entries[], archive[], stats{}, coolDown }

// === АКАДЕМИЧЕСКАЯ СИСТЕМА ===
L.academics             // { grades: { [charName]: { [subject]: [{grade, turn}] } } }
```

---

## 7. Связи между движками

### Таблица зависимостей

| Движок | Вызывает | Вызывается из |
|--------|----------|---------------|
| **UnifiedAnalyzer** | TimeEngine, EvergreenEngine, GoalsEngine, MoodEngine, EnvironmentEngine, GossipEngine, RelationsEngine, HierarchyEngine, LoreEngine, SceneDetectionEngine | Output.js |
| **EvergreenEngine** | lcInit, lcWarn | UnifiedAnalyzer, `/evergreen` команды, composeContextOverlay |
| **GoalsEngine** | EvergreenEngine (patterns), lcInit | UnifiedAnalyzer, AcademicsEngine |
| **RelationsEngine** | InformationEngine, Crucible | UnifiedAnalyzer, `/reputation` команды |
| **InformationEngine** | LoreEngine, QualiaEngine | RelationsEngine.updateRelation() |
| **KnowledgeEngine** | lcInit | composeContextOverlay |
| **MoodEngine** | QualiaEngine (читает qualia_state), lcInit | UnifiedAnalyzer, EnvironmentEngine, AcademicsEngine |
| **EnvironmentEngine** | MoodEngine, lcInit | UnifiedAnalyzer, `/weather`/`/location` команды |
| **GossipEngine** | lcInit | UnifiedAnalyzer; GossipGC вызывается Output.js |
| **CharacterGC** | lcInit | Output.js (каждый ход) |
| **ChronologicalKnowledgeBase** | — | UnifiedAnalyzer (паттерны для TimeEngine) |
| **TimeEngine** | lcInit, ChronologicalKnowledgeBase | UnifiedAnalyzer; advance() вызывается Output.js |
| **LivingWorld** | TimeEngine, EvergreenEngine, RelationsEngine | Output.js (после TimeEngine.advance()) |
| **AcademicsEngine** | MoodEngine, GoalsEngine, LoreEngine | Прямые вызовы или события |
| **Crucible** | — (архивирует в society.myths) | RelationsEngine, GoalsEngine, GossipEngine |
| **QualiaEngine** | lcInit | MoodEngine, InformationEngine, AcademicsEngine |
| **NormsEngine** | HierarchyEngine, MemoryEngine, LoreEngine | Crucible.processEvent(), UnifiedAnalyzer |
| **HierarchyEngine** | lcInit | NormsEngine, UnifiedAnalyzer |
| **MemoryEngine** | lcInit | lcInit (каждые 100 ходов), composeContextOverlay |
| **LoreEngine** | NormsEngine, lcInit | UnifiedAnalyzer (последним) |
| **DemographicPressure** | lcInit | composeContextOverlay |
| **SceneDetectionEngine** | lcInit | UnifiedAnalyzer (последним) |

### Граф главных зависимостей

```
Output.js
  ├── UnifiedAnalyzer.analyze()
  │     ├── TimeEngine ← ChronologicalKnowledgeBase
  │     ├── EvergreenEngine
  │     ├── GoalsEngine ← EvergreenEngine.patterns
  │     ├── MoodEngine ← QualiaEngine
  │     ├── EnvironmentEngine → MoodEngine
  │     ├── GossipEngine
  │     ├── RelationsEngine → InformationEngine → LoreEngine
  │     │                   → QualiaEngine
  │     ├── HierarchyEngine ← NormsEngine ← MemoryEngine, LoreEngine
  │     ├── LoreEngine
  │     └── SceneDetectionEngine
  ├── TimeEngine.advance() → LivingWorld.simulate()
  ├── GossipGC.run()
  ├── CharacterGC.run()
  ├── checkRecapOfferV2()
  └── checkAutoEpoch()

Context.js
  └── composeContextOverlay()
        ├── EvergreenEngine.getCanon()
        ├── TimeEngine (L.time)
        ├── DemographicPressure.getSuggestions()
        ├── MemoryEngine.getDominantMyth() → ⟦ZEITGEIST⟧
        ├── GoalsEngine (L.goals) → ⟦GOAL⟧
        ├── MoodEngine (L.character_status) → ⟦MOOD⟧
        ├── KnowledgeEngine.isSecretVisible() → ⟦SECRET⟧
        ├── HierarchyEngine (social.status) → ⟦STATUS⟧
        ├── QualiaEngine (qualia_state) → ⟦QUALIA⟧
        ├── RelationsEngine (perceptions) → ⟦PERCEPTION⟧
        └── Crucible (personality/self_concept) → ⟦TRAITS⟧, ⟦CONFLICT⟧
```

---

*Документ создан на основе прямого анализа исходного кода. Все движки подтверждены в `Library v16.0.8.patched.txt`. Версия кода: `16.0.8-compat6d`.*
