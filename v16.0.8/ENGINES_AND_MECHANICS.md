# Lincoln v16.0.8 — Движки и Механики

> Отчёт создан на основе анализа исходного кода скриптов.
> Источники: Library v16.0.8.patched.txt, Input v16.0.8.patched.txt,
>             Context v16.0.8.patched.txt, Output v16.0.8.patched.txt

---

## Содержание

- [1. Инфраструктура и утилиты](#1-инфраструктура-и-утилиты)
  - [1.1 Пространство имён LC и глобальная инициализация](#11-пространство-имён-lc-и-глобальная-инициализация)
  - [1.2 lcInit() — инициализация state.lincoln](#12-lcinit--инициализация-statelincoln)
  - [1.3 lcSys() — системные сообщения](#13-lcsys--системные-сообщения)
  - [1.4 replyStop() — остановка цикла с сообщением](#14-replystop--остановка-цикла-с-сообщением)
  - [1.5 CONFIG — таблица всех конфигурационных параметров](#15-config--таблица-всех-конфигурационных-параметров)
  - [1.6 currentAction — система флагов текущего действия](#16-currentaction--система-флагов-текущего-действия)
  - [1.7 stateVersion + _contextCache — кэширование контекста](#17-stateversion--_contextcache--кэширование-контекста)
  - [1.8 composeContextOverlay() — сборка контекстного оверлея](#18-composecontextoverlay--сборка-контекстного-оверлея)
  - [1.9 CommandsRegistry — реестр slash-команд](#19-commandsregistry--реестр-slash-команд)
- [2. Движки](#2-движки)
  - [2.1 EvergreenEngine](#21-evergreenengine)
  - [2.2 GoalsEngine](#22-goalsengine)
  - [2.3 MoodEngine](#23-moodengine)
  - [2.4 KnowledgeEngine (SecretsEngine)](#24-knowledgeengine-secretsengine)
  - [2.5 RelationsEngine](#25-relationsengine)
  - [2.6 TimeEngine](#26-timeengine)
  - [2.7 EnvironmentEngine](#27-environmentengine)
  - [2.8 GossipEngine](#28-gossipengine)
  - [2.9 HierarchyEngine](#29-hierarchyengine)
  - [2.10 NormsEngine](#210-normsengine)
  - [2.11 CrucibleEngine](#211-crucibleengine)
  - [2.12 QualiaEngine](#212-qualiaengine)
  - [2.13 InformationEngine](#213-informationengine)
  - [2.14 LivingWorld](#214-livingworld)
  - [2.15 UnifiedAnalyzer](#215-unifiedanalyzer)
  - [2.16 DemographicPressure](#216-demographicpressure)
  - [2.17 CharacterGC](#217-charactergc)
  - [2.18 LoreEngine](#218-loreengine)
  - [2.19 MemoryEngine](#219-memoryengine)
  - [2.20 AcademicsEngine](#220-academicsengine)
  - [2.21 SceneDetectionEngine](#221-scenedetectionengine)
- [3. Механики](#3-механики)
  - [3.1 Anti-Echo](#31-anti-echo)
  - [3.2 Recap System](#32-recap-system)
  - [3.3 Unified Analysis Pipeline](#33-unified-analysis-pipeline)
  - [3.4 Character Lifecycle](#34-character-lifecycle)
  - [3.5 Demographic Pressure](#35-demographic-pressure)
  - [3.6 Gossip Garbage Collection](#36-gossip-garbage-collection)
  - [3.7 Context Caching (stateVersion)](#37-context-caching-stateversion)
  - [3.8 Player Info Levels](#38-player-info-levels)
- [4. Полная таблица slash-команд](#4-полная-таблица-slash-команд)
- [5. Теги контекстного оверлея](#5-теги-контекстного-оверлея)
- [6. Структура state.lincoln (полная)](#6-структура-statelincoln-полная)
- [7. Тестовые файлы](#7-тестовые-файлы)

---

## 1. Инфраструктура и утилиты

### 1.1 Пространство имён LC и глобальная инициализация

**Объект:** `LC` (глобальный)
**Реализован в:** Library (строки 1–200)
**Назначение:** Корневое пространство имён для всех движков, утилит и констант Lincoln.

LC создаётся через IIFE (Immediately Invoked Function Expression) и регистрируется в глобальной области (`globalThis.LC`, `window.LC`). Все подсистемы Lincoln доступны через этот объект.

**Ключевые свойства:**
- `LC.DATA_VERSION` — версия данных (16.0.8-compat6d)
- `LC.CONFIG` — конфигурационные параметры
- `LC._contextCache` — кэш контекстных оверлеев
- `LC._echoCache`, `LC._echoOrder` — кэш для Anti-Echo механики

### 1.2 lcInit() — инициализация state.lincoln

**Объект:** `LC.lcInit`
**Реализован в:** Library (строки 650–850)
**Назначение:** Инициализирует и возвращает объект `state.lincoln` со всеми необходимыми полями.

**Публичные функции:**
| Функция | Параметры | Что делает |
|---------|-----------|------------|
| `lcInit(slot)` | `slot: string` — идентификатор скрипта (Input/Context/Output) | Создаёт или возвращает `state.lincoln` с дефолтными значениями |

**Структура состояния:**
```javascript
state.lincoln = {
  turn: 0,                    // number — текущий ход
  stateVersion: 0,            // number — версия состояния для инвалидации кэша
  lastProcessedTurn: -1,      // number — последний обработанный ход
  cadence: CONFIG.LIMITS.CADENCE.DEFAULT,  // number — каденция рекапов
  characters: {},             // object — база персонажей
  goals: {},                  // object — активные цели персонажей
  rumors: [],                 // array — активные слухи
  secrets: [],                // array — секреты
  events: [],                 // array — события для рекапа
  time: {},                   // object — игровое время
  environment: {},            // object — окружение
  evergreen: {},              // object — долгосрочная память
  academics: {},              // object — академические данные
  society: {},                // object — социальная структура
  lore: {},                   // object — легенды
  character_status: {},       // object — текущие настроения персонажей
  population: {},             // object — популяция мира
  currentAction: {},          // object — текущее действие
  tm: {},                     // object — телеметрия
  sysMsgs: [],                // array — очередь системных сообщений
  sysShow: false,             // boolean — показывать ли системные сообщения
  playerInfoLevel: 'character' // string — уровень информации игрока
}
```

### 1.3 lcSys() — системные сообщения

**Объект:** `LC.lcSys`
**Реализован в:** Library (строки 900–950)
**Назначение:** Добавляет системное сообщение в очередь для последующего отображения.

**Публичные функции:**
| Функция | Параметры | Что делает |
|---------|-----------|------------|
| `lcSys(msg)` | `msg: string \| {text, level}` — сообщение или объект с уровнем | Добавляет сообщение в `L.sysMsgs` |
| `lcConsumeMsgs()` | нет | Возвращает и очищает очередь сообщений |
| `lcWarn(msg)` | `msg: string` — текст предупреждения | Добавляет предупреждение с префиксом ⚠️ |
| `lcDebug(msg)` | `msg: string` — отладочное сообщение | Добавляет отладочное сообщение (если включено) |

**Уровни сообщений:**
- `character` — для игрока в режиме персонажа
- `director` — только для режима директора

### 1.4 replyStop() — остановка цикла с сообщением

**Объект:** `LC.replyStop`
**Реализован в:** Input (строки 100–115)
**Назначение:** Формирует ответ с системным сообщением и флагом остановки.

**Публичные функции:**
| Функция | Параметры | Что делает |
|---------|-----------|------------|
| `replyStop(msg)` | `msg: string` — сообщение | Возвращает `{text: "⟦SYS⟧ msg", stop: true}` |
| `replyStopSilent()` | нет | Возвращает `{text: "", stop: true}` |

### 1.5 CONFIG — таблица всех конфигурационных параметров

**Объект:** `LC.CONFIG`
**Реализован в:** Library (строки 100–400)
**Назначение:** Централизованная конфигурация всех параметров системы.

| Параметр | Значение | Описание |
|----------|----------|----------|
| `VERSION` | `"16.0.8-compat6d"` | Версия системы |
| `LIMITS.CONTEXT_LENGTH` | `800` | Максимальная длина контекстного оверлея |
| `LIMITS.EVERGREEN_MAX_PER_CATEGORY` | `15` | Макс. элементов в категории Evergreen |
| `LIMITS.EVERGREEN_HISTORY_CAP` | `100` | Макс. записей в истории Evergreen |
| `LIMITS.CADENCE.DEFAULT` | `15` | Каденция рекапов по умолчанию |
| `LIMITS.CADENCE.MIN` | `8` | Минимальная каденция |
| `LIMITS.CADENCE.MAX` | `30` | Максимальная каденция |
| `LIMITS.EVENTS_WINDOW_TURNS` | `50` | Окно событий в ходах |
| `LIMITS.RUMOR_HARD_CAP` | `150` | Жёсткий лимит слухов |
| `LIMITS.LORE_ACTIVE_CAP` | `5` | Активных легенд |
| `LIMITS.ANTI_ECHO.*` | разные | Параметры Anti-Echo |
| `CHAR_WINDOW_HOT` | `3` | Окно "горячих" персонажей |
| `CHAR_WINDOW_ACTIVE` | `10` | Окно активных персонажей |
| `FEATURES.STRICT_CMD_BYPASS` | `true` | Строгий байпас для команд |
| `RECAP_V2.*` | разные | Параметры системы рекапов |
| `RELATIONSHIP_MODIFIERS.*` | разные | Модификаторы отношений |
| `GRADES_HISTORY_LIMIT` | `10` | Лимит истории оценок |
| `ACADEMIC_SUBJECTS` | массив | Список учебных предметов |

### 1.6 currentAction — система флагов текущего действия

**Объект:** `state.lincoln.currentAction`
**Реализован в:** Library/Input/Output
**Назначение:** Отслеживает тип текущего действия пользователя для корректной обработки.

**Структура:**
```javascript
currentAction = {
  type: 'story' | 'command' | 'retry' | 'continue',  // Тип действия
  name: '/help',              // Имя команды (если type === 'command')
  task: 'recap' | 'epoch',    // Задача (если активна)
  wantRecap: true,            // Флаг предложения рекапа
  __cmdCyclePending: true     // Внутренний флаг командного цикла
}
```

**Правила инкремента хода:**
- `story` — ход +1
- `continue` (UI кнопка) — ход +1
- `command` — ход +0
- `retry` — ход +0

### 1.7 stateVersion + _contextCache — кэширование контекста

**Объекты:** `L.stateVersion`, `LC._contextCache`
**Реализован в:** Library (строки 9300–9800)
**Назначение:** Оптимизация пересборки контекстного оверлея через версионирование состояния.

**Механика:**
1. `L.stateVersion` инкрементируется при любом изменении состояния
2. `composeContextOverlay()` проверяет кэш по `stateVersion`
3. Если версия совпадает — возвращается кэшированный результат
4. Если нет — выполняется полная пересборка

**Структура кэша:**
```javascript
LC._contextCache = {
  [cacheKey]: {
    stateVersion: number,
    result: { text: string, parts: object, max: number }
  }
}
```

### 1.8 composeContextOverlay() — сборка контекстного оверлея

**Объект:** `LC.composeContextOverlay`
**Реализован в:** Library (строки 9305–9804)
**Назначение:** Собирает полный контекстный оверлей для AI из всех источников данных.

**Публичные функции:**
| Функция | Параметры | Что делает |
|---------|-----------|------------|
| `composeContextOverlay(options)` | `{limit?: number, allowPartial?: boolean}` | Возвращает `{text, parts, max, error?}` |

**Порядок сборки (по приоритету):**
1. INTENT — намерение игрока
2. TASK — задача (recap/epoch)
3. CANON — канонические факты из Evergreen
4. SUGGESTION — подсказки от DemographicPressure
5. GOAL — активные цели персонажей
6. SECRET — секреты (фильтруются по видимости)
7. CONFLICT — внутренние конфликты персонажей
8. TRAITS — черты характера HOT персонажей
9. STATUS — социальный статус
10. QUALIA — квалиа-состояние
11. PERCEPTION — восприятие других персонажей
12. MOOD — настроение
13. OPENING — вступительная строка
14. SCENE — фокус сцены
15. GUIDE — стилистические указания
16. WORLD — информация о мире
17. META — метаинформация

### 1.9 CommandsRegistry — реестр slash-команд

**Объект:** `LC.CommandsRegistry` (Map)
**Реализован в:** Library (строки 1200–1400)
**Назначение:** Централизованный реестр slash-команд с обработчиками и описаниями.

**Публичные функции:**
| Функция | Параметры | Что делает |
|---------|-----------|------------|
| `CommandsRegistry.get(cmd)` | `cmd: string` — имя команды | Возвращает определение команды |
| `CommandsRegistry.set(cmd, def)` | `cmd, {handler, description, bypass}` | Регистрирует команду |
| `CommandsRegistry.entries()` | нет | Возвращает итератор записей |

**Структура определения команды:**
```javascript
{
  handler: function(args, raw) { /* ... */ },
  description: "/команда [аргументы] — описание",
  bypass: true  // Команда не требует инкремента хода
}
```

---

## 2. Движки

### 2.1 EvergreenEngine

**Объект:** `LC.EvergreenEngine`
**Реализован в:** Library (строки 2100–3140)
**Назначение:** Автоматическое отслеживание и сохранение долгосрочных фактов из нарратива.

**Публичные функции:**
| Функция | Параметры | Что делает |
|---------|-----------|------------|
| `analyze(text, actionType)` | `text: string, actionType: string` | Анализирует текст и извлекает факты |
| `getCanon()` | нет | Возвращает строку канонических фактов для оверлея |
| `getSummary()` | нет | Возвращает сводку по категориям |
| `toggle(on)` | `on: boolean` | Включает/выключает Evergreen |
| `clear()` | нет | Очищает всё хранилище |
| `normalizeCharName(name)` | `name: string` | Нормализует имя персонажа (падежи, формы) |
| `isImportantCharacter(name)` | `name: string` | Проверяет, важен ли персонаж |
| `_buildPatterns()` | нет | Строит регулярные выражения для анализа |
| `limitCategories(L)` | `L: object` | Ограничивает размер категорий |

**Структура состояния:**
```javascript
state.lincoln.evergreen = {
  enabled: true,              // boolean — включён ли движок
  relations: {                // object — отношения между персонажами
    "Максим": {
      "Хлоя": 25              // number или {affection, trust, respect, rivalry}
    }
  },
  status: {                   // object — статусы персонажей
    "Максим": "капитан команды"
  },
  obligations: {              // object — обязательства
    "Максим": "Максим owes Хлоя: помощь с домашкой"
  },
  facts: {                    // object — факты
    "f_123_abc": "Важно: директор уехал"
  },
  history: [],                // array — история изменений
  lastUpdate: 0               // number — последний ход обновления
}
```

**Паттерны анализа:**
- Отношения: "X и Y — друзья/враги/пара"
- Статусы: "X теперь Y"
- Обязательства: "X должен Y / X обещает Y"
- Факты: "Важно: ...", "Факт: ..."

### 2.2 GoalsEngine

**Объект:** `LC.GoalsEngine`
**Реализован в:** Library (строки 3537–4026)
**Назначение:** Отслеживание целей персонажей с иерархическими планами и прогрессом.

**Публичные функции:**
| Функция | Параметры | Что делает |
|---------|-----------|------------|
| `analyze(text, actionType)` | `text: string, actionType: string` | Извлекает цели из текста |
| `generateBasicPlan(goalText)` | `goalText: string` | Генерирует план подзадач для цели |
| `updatePlanProgress(goalKey, status)` | `goalKey: string, status: 'in-progress'\|'complete'` | Обновляет прогресс плана |
| `generateAcademicGoals()` | нет | Генерирует академические цели по GPA |
| `_tryGenerateLoreInspiredGoals()` | нет | Генерирует цели, вдохновлённые легендами |
| `_tryGenerateReactiveGoals()` | нет | Генерирует реактивные цели на драматические события |

**Структура состояния:**
```javascript
state.lincoln.goals = {
  "Максим_123_abc": {
    character: "Максим",       // string — имя персонажа
    text: "победить на турнире", // string — текст цели
    status: "active",          // string — active/completed
    turnCreated: 15,           // number — ход создания
    plan: [                    // array — план действий
      { text: "Подготовиться", status: "complete" },
      { text: "Выступить", status: "in-progress" },
      { text: "Победить", status: "pending" }
    ],
    planProgress: 1,           // number — индекс текущего шага
    inspiredByLore: "achievement",  // string? — тег вдохновения
    reactiveToEvent: "public_accusation", // string? — реактивная цель
    academicGoal: true         // boolean? — академическая цель
  }
}
```

### 2.3 MoodEngine

**Объект:** `LC.MoodEngine`
**Реализован в:** Library (строки 4823–5111)
**Назначение:** Отслеживание настроений персонажей с временем истечения.

**Публичные функции:**
| Функция | Параметры | Что делает |
|---------|-----------|------------|
| `analyze(text)` | `text: string` | Детектирует настроения из текста |

**Структура состояния:**
```javascript
state.lincoln.character_status = {
  "Максим": {
    mood: "angry",             // string — тип настроения
    reason: "ссора",           // string — причина
    expires: 25                // number — ход истечения
  }
}
```

**Типы настроений:**
- `angry` — злость (ссора, конфликт, ярость)
- `happy` — радость (хорошие новости, успех)
- `scared` — страх (угроза, опасность)
- `tired` — усталость (истощение, перенапряжение)
- `wounded` — ранение (травма, повреждение)
- `embarrassed` — смущение (неловкость, дискомфорт)
- `jealous` — ревность
- `offended` — обида
- `guilty` — вина (сожаление)
- `disappointed` — разочарование

### 2.4 KnowledgeEngine (SecretsEngine)

**Объект:** `LC.KnowledgeEngine`
**Реализован в:** Library (строки 4784–4819)
**Назначение:** Управление секретами и фильтрация по видимости для персонажей.

**Публичные функции:**
| Функция | Параметры | Что делает |
|---------|-----------|------------|
| `extractFocusCharacters(contextText)` | `contextText: string` | Извлекает персонажей из фокуса сцены |
| `isSecretVisible(secret, focusCharacters)` | `secret: object, focusCharacters: array` | Проверяет видимость секрета |

**Структура секрета:**
```javascript
{
  text: "Максим на самом деле богат",
  known_by: ["Хлоя", "Эшли"]  // Кто знает секрет
}
```

### 2.5 RelationsEngine

**Объект:** `LC.RelationsEngine`
**Реализован в:** Library (строки 4031–4562)
**Назначение:** Управление отношениями между персонажами с многовекторной моделью.

**Публичные функции:**
| Функция | Параметры | Что делает |
|---------|-----------|------------|
| `getRelation(char1, char2)` | `char1, char2: string` | Возвращает значение отношения |
| `getVector(char1, char2, vector)` | `vector: 'affection'\|'trust'\|'respect'\|'rivalry'` | Возвращает конкретный вектор |
| `updateRelation(char1, char2, change, options)` | `change: number\|object, options?: object` | Обновляет отношения |
| `analyze(text)` | `text: string` | Анализирует текст на события отношений |
| `_applyDivisionEffect(char1, char2, type, eventInfo)` | внутренний | Применяет "эффект раскола" |

**Модификаторы (MODIFIERS):**
| Событие | Модификатор |
|---------|-------------|
| romance | +15 |
| conflict | -10 |
| betrayal | -25 |
| loyalty | +10 |
| public_accusation | -15 |
| public_humiliation | -20 |
| loyalty_rescue | +12 |

**Многовекторная модель:**
```javascript
{
  affection: 65,   // 0-100, симпатия
  trust: 80,       // 0-100, доверие
  respect: 70,     // 0-100, уважение
  rivalry: 30      // 0-100, соперничество
}
```

### 2.6 TimeEngine

**Объект:** `LC.TimeEngine`
**Реализован в:** Library (строки 6346–6467)
**Назначение:** Управление игровым временем на основе семантических действий.

**Публичные функции:**
| Функция | Параметры | Что делает |
|---------|-----------|------------|
| `advance()` | нет | Проверяет и возвращает информацию о скачке времени |
| `processSemanticAction(action)` | `action: {type, value?, steps?, days?}` | Обрабатывает семантическое действие времени |

**Структура состояния:**
```javascript
state.lincoln.time = {
  currentDay: 1,              // number — текущий день
  dayName: "Понедельник",     // string — название дня
  timeOfDay: "Утро",          // string — время суток
  turnsPerToD: 5,             // number — ходов на время суток
  turnsInCurrentToD: 0,       // number — ходов в текущем периоде
  scheduledEvents: [],        // array — запланированные события
  lastTimeJump: null          // object? — последний скачок времени
}
```

**Времена суток:** `['Утро', 'День', 'Вечер', 'Ночь']`

**Типы действий:**
- `ADVANCE_TO_NEXT_MORNING` — переход к следующему утру
- `SET_TIME_OF_DAY` — установка конкретного времени
- `ADVANCE_TIME_OF_DAY` — продвижение на N периодов
- `ADVANCE_DAY` — продвижение на N дней

### 2.7 EnvironmentEngine

**Объект:** `LC.EnvironmentEngine`
**Реализован в:** Library (строки 5115–5243)
**Назначение:** Отслеживание окружения (локация, погода) и их влияния на персонажей.

**Публичные функции:**
| Функция | Параметры | Что делает |
|---------|-----------|------------|
| `detectLocation(text)` | `text: string` | Определяет локацию из текста |
| `analyze(text)` | `text: string` | Анализирует и обновляет окружение |
| `applyWeatherMood(weather)` | `weather: string` | Применяет влияние погоды на настроение |

**Локации:**
- `classroom` — класс, аудитория
- `cafeteria` — столовая
- `gym` — спортзал
- `library` — библиотека
- `hallway` — коридор
- `schoolyard` — школьный двор
- `park` — парк
- `home` — дом
- `street` — улица

### 2.8 GossipEngine

**Объект:** `LC.GossipEngine`
**Реализован в:** Library (строки 5246–5680)
**Назначение:** Симуляция слухов с наблюдением, распространением и искажением.

**Публичные функции:**
| Функция | Параметры | Что делает |
|---------|-----------|------------|
| `generateRumorId()` | нет | Генерирует уникальный ID слуха |
| `analyze(text)` | `text: string` | Анализирует текст и распространяет слухи |
| `runGarbageCollection()` | нет | Управляет жизненным циклом слухов |

**Субмодули:**
- `Observer` — наблюдение за событиями
- `Propagator` — распространение слухов

**Структура слуха:**
```javascript
{
  id: "rumor_123_abc",        // string — уникальный ID
  text: "Максим поцеловал Хлою", // string — текст события
  type: "romance",            // string — тип события
  subject: "Максим",          // string — главный персонаж
  target: "Хлоя",             // string? — второй персонаж
  spin: "positive",           // string — окраска (positive/negative/neutral)
  turn: 15,                   // number — ход создания
  knownBy: ["Эшли"],          // array — кто знает
  distortion: 0.5,            // number — степень искажения
  verified: false,            // boolean — подтверждён ли
  status: "ACTIVE"            // string — ACTIVE/FADED/ARCHIVED
}
```

**Жизненный цикл:**
1. `ACTIVE` — активный слух
2. `FADED` — знают 75%+ персонажей
3. `ARCHIVED` — через 50 ходов после FADED → удаление

### 2.9 HierarchyEngine

**Объект:** `LC.HierarchyEngine`
**Реализован в:** Library (строки 7956–8308)
**Назначение:** Расчёт социального статуса на основе социального капитала.

**Публичные функции:**
| Функция | Параметры | Что делает |
|---------|-----------|------------|
| `updateCapital(characterName, eventData)` | `eventData: {type, normStrength?, witnessCount?}` | Обновляет социальный капитал |
| `recalculateStatus()` | нет | Пересчитывает статусы всех персонажей |
| `getStatus(characterName)` | `characterName: string` | Возвращает статус персонажа |
| `applyReputationShock(participants, eventType, dramaticMultiplier)` | массив, строка, число | Мгновенное изменение репутации |

**Пороги статуса:**
- `leader` — capital ≥ 140 (и первый в рейтинге)
- `member` — 40 ≤ capital < 140
- `outcast` — capital < 40

**Типы событий для капитала:**
- `NORM_VIOLATION` — нарушение нормы (−capital)
- `NORM_CONFORMITY` — соблюдение нормы (+capital)
- `POSITIVE_ACTION` — позитивное действие (+8)
- `NEGATIVE_ACTION` — негативное действие (−5)

### 2.10 NormsEngine

**Объект:** `LC.NormsEngine`
**Реализован в:** Library (строки 7806–7954)
**Назначение:** Динамическое отслеживание социальных норм группы.

**Публичные функции:**
| Функция | Параметры | Что делает |
|---------|-----------|------------|
| `processEvent(eventData)` | `{type, actor, target, witnesses, relationChange}` | Обновляет нормы по реакции свидетелей |
| `getNormStrength(normType)` | `normType: string` | Возвращает силу нормы (0–1) |

**Структура состояния:**
```javascript
state.lincoln.society.norms = {
  "betrayal": {
    strength: 0.9,             // number — сила нормы (0-1)
    lastUpdate: 100,           // number — последнее обновление
    violations: 2,             // number — количество нарушений
    reinforcements: 5          // number — количество подкреплений
  }
}
```

### 2.11 CrucibleEngine

**Объект:** `LC.Crucible`
**Реализован в:** Library (строки 7324–7644)
**Назначение:** Эволюция личности персонажей и "Я-концепции" на основе событий.

**Публичные функции:**
| Функция | Параметры | Что делает |
|---------|-----------|------------|
| `analyzeEvent(eventData)` | `{type, character, otherCharacter?, change?, finalValue?}` | Анализирует событие на потенциал эволюции |

**Типы событий:**
- `RELATION_CHANGE` — изменение отношений
- `GOAL_COMPLETE` — завершение цели
- `RUMOR_SPREAD` — распространение слуха
- `STATUS_CHANGE` — изменение статуса

**Структура личности:**
```javascript
character.personality = {
  trust: 0.5,        // 0-1, доверчивость
  bravery: 0.5,      // 0-1, храбрость
  idealism: 0.5,     // 0-1, идеализм
  aggression: 0.3    // 0-1, агрессивность
}

character.self_concept = {
  perceived_trust: 0.4,    // Как персонаж ВИДИТ себя
  perceived_bravery: 0.6,
  perceived_idealism: 0.5,
  perceived_aggression: 0.2
}
```

### 2.12 QualiaEngine

**Объект:** `LC.QualiaEngine`
**Реализован в:** Library (строки 7648–7798)
**Назначение:** Симуляция "сырых" ощущений персонажей (феноменальный слой).

**Публичные функции:**
| Функция | Параметры | Что делает |
|---------|-----------|------------|
| `resonate(character, event)` | `event: {type, actor, action, target, intensity}` | Транслирует событие в изменения квалиа |
| `runGroupResonance(characterNames, convergenceRate)` | `convergenceRate: number` | Синхронизирует квалиа группы (эмоциональное заражение) |

**Структура квалиа-состояния:**
```javascript
character.qualia_state = {
  somatic_tension: 0.3,    // 0-1, телесное напряжение
  valence: 0.5,            // 0-1, валентность (приятно/неприятно)
  focus_aperture: 0.7,     // 0-1, широта внимания
  energy_level: 0.8        // 0-1, уровень энергии
}
```

**Типы событий:**
- `social` — комплименты, оскорбления, угрозы
- `environmental` — громкие звуки, спокойствие
- `physical` — боль, отдых
- `achievement` — успех, неудача

### 2.13 InformationEngine

**Объект:** `LC.InformationEngine`
**Реализован в:** Library (строки 4565–4778)
**Назначение:** Субъективная интерпретация событий через призму персонажа.

**Публичные функции:**
| Функция | Параметры | Что делает |
|---------|-----------|------------|
| `interpret(character, event)` | `event: {type, action, actor, target, intensity, rawModifier}` | Возвращает субъективную интерпретацию |
| `updatePerception(perceiver, perceived, interpretation)` | `interpretation: object` | Обновляет восприятие персонажем другого |

**Примеры интерпретаций:**
- Комплимент при высоком valence → "sincere" (×1.3)
- Комплимент при высоком tension → "sarcasm" (×0.3, −trust)
- Оскорбление при высоком tension → "threatening" (×1.5)
- Оскорбление при высоком valence → "banter" (×0.4)

### 2.14 LivingWorld

**Объект:** `LC.LivingWorld`
**Реализован в:** Library (строки 6470–7103)
**Назначение:** Автономные действия NPC во время скачков времени.

**Публичные функции:**
| Функция | Параметры | Что делает |
|---------|-----------|------------|
| `runOffScreenCycle(timeJump)` | `timeJump: {type, duration}` | Запускает симуляцию "за кадром" |
| `simulateCharacter(character)` | `{name, data}` | Симулирует действия одного персонажа |
| `generateFact(characterName, action)` | `action: object` | Генерирует изменения состояния |

**Пирамида мотивации:**
1. Активные цели (высший приоритет)
2. Сильные отношения
3. Предстоящие события календаря

**Типы действий:**
- `PURSUE_GOAL` — работа над целью
- `SOCIAL_POSITIVE` — позитивное взаимодействие
- `SOCIAL_NEGATIVE` — негативное взаимодействие
- `GOSSIP` — распространение слухов
- `PREPARE_EVENT` — подготовка к событию
- `PUBLIC_SUPPORT` — публичная поддержка (социальный катализатор)
- `PUBLIC_CONDEMNATION` — публичное осуждение (социальный катализатор)
- `COALITION_CREATION` — создание коалиции (социальный катализатор)

### 2.15 UnifiedAnalyzer

**Объект:** `LC.UnifiedAnalyzer`
**Реализован в:** Library (строки 3146–3475)
**Назначение:** Единый конвейер анализа текста, координирующий все движки.

**Публичные функции:**
| Функция | Параметры | Что делает |
|---------|-----------|------------|
| `analyze(text, actionType)` | `text: string, actionType: string` | Запускает все движки анализа |
| `_detectDramaticEvent(text)` | `text: string` | Определяет драматическое событие |
| `_buildUnifiedPatterns()` | нет | Строит объединённые паттерны |

**Порядок обработки:**
1. TimeEngine (хронологические паттерны)
2. EvergreenEngine (долгосрочная память)
3. GoalsEngine (цели)
4. MoodEngine (настроения)
5. EnvironmentEngine (окружение)
6. GossipEngine (слухи)
7. RelationsEngine (отношения)
8. DemographicPressure (демографическое давление)
9. HierarchyEngine (периодический пересчёт, каждые 20 ходов)
10. LoreEngine (наблюдение легенд)
11. SceneDetectionEngine (тип сцены)

### 2.16 DemographicPressure

**Объект:** `LC.DemographicPressure`
**Реализован в:** Library (строки 3479–3534)
**Назначение:** Обнаружение ситуаций, требующих появления новых персонажей.

**Публичные функции:**
| Функция | Параметры | Что делает |
|---------|-----------|------------|
| `analyze(text)` | `text: string` | Анализирует текст на паттерны одиночества/потребности |
| `getSuggestions()` | нет | Возвращает массив подсказок |

**Паттерны:**
- **Одиночество** — один персонаж в фокусе
- **Потребность в эксперте:**
  - Компьютеры/взлом
  - Поиск информации
  - Медицина
  - Ремонт
  - Защита

### 2.17 CharacterGC

**Объект:** `LC.CharacterGC`
**Реализован в:** Library (строки 5684–5760)
**Назначение:** Управление жизненным циклом персонажей (продвижение, заморозка, удаление).

**Публичные функции:**
| Функция | Параметры | Что делает |
|---------|-----------|------------|
| `run()` | нет | Запускает цикл сборки мусора |

**Правила:**
- `EXTRA → SECONDARY` — если >5 упоминаний за 50 ходов
- `SECONDARY → FROZEN` — если не видели >100 ходов
- `FROZEN → ACTIVE` — автоматически при упоминании
- `EXTRA → DELETE` — если не видели >200 ходов и ≤2 упоминаний

### 2.18 LoreEngine

**Объект:** `LC.LoreEngine`
**Реализован в:** Library (строки 8487–8907)
**Назначение:** Кристаллизация значимых событий в "школьные легенды".

**Публичные функции:**
| Функция | Параметры | Что делает |
|---------|-----------|------------|
| `calculateLorePotential(event)` | `event: object` | Рассчитывает потенциал события (0–100+) |
| `getCurrentThreshold()` | нет | Возвращает текущий порог для создания легенды |
| `observe(text)` | `text: string` | Анализирует текст через 4-ступенчатый фильтр |

**4 фильтра:**
1. **Потенциал** — расчёт по новизне, импакту, нарушению норм, публичности, статусу участников
2. **Кулдаун** — 200 ходов после создания легенды
3. **Порог** — базовый 75 + 5 за каждую существующую легенду
4. **Дедупликация** — проверка на похожие легенды

**Структура легенды:**
```javascript
{
  type: "betrayal",           // string — тип события
  participants: ["Максим", "Хлоя"], // array — участники
  witnesses: 10,              // number — количество свидетелей
  impact: 45,                 // number — сила воздействия
  description: "...",         // string — описание
  Text: "Максим предал Хлою...", // string — сгенерированный текст
  turn: 150,                  // number — ход создания
  potential: 85               // number — потенциал
}
```

### 2.19 MemoryEngine

**Объект:** `LC.MemoryEngine`
**Реализован в:** Library (строки 8312–8483)
**Назначение:** Мифологизация событий — превращение старых записей в абстрактные мифы.

**Публичные функции:**
| Функция | Параметры | Что делает |
|---------|-----------|------------|
| `runMythologization()` | нет | Превращает старые события в мифы |
| `getDominantMyth()` | нет | Возвращает самый сильный миф |
| `getMythStrengthForTheme(theme)` | `theme: string` | Возвращает силу мифов по теме |

**Структура мифа:**
```javascript
{
  type: "myth",
  theme: "betrayal",
  hero: "Максим",
  moral: "предательство недопустимо",
  strength: 0.9,
  createdTurn: 200,
  originalTurn: 100
}
```

### 2.20 AcademicsEngine

**Объект:** `LC.AcademicsEngine`
**Реализован в:** Library (строки 7107–7320)
**Назначение:** Симуляция академической успеваемости (Bell Curve).

**Публичные функции:**
| Функция | Параметры | Что делает |
|---------|-----------|------------|
| `calculateGrade(character, subject)` | `character: object, subject: string` | Рассчитывает оценку по предмету |
| `recordGrade(characterName, subject, grade)` | все строки/число | Записывает оценку |
| `getGPA(character)` | `character: string\|object` | Возвращает средний балл |

**Формула оценки:**
- 50% — способности (aptitude)
- 30% — усилия (effort)
- 20% — настроение (valence)
- ±15% — случайность

**Шкала:** 1–5 баллов (с десятичными)

### 2.21 SceneDetectionEngine

**Объект:** `LC.SceneDetectionEngine`
**Реализован в:** Library (строки 6038–6342)
**Назначение:** Определение типа сцены по ключевым словам.

**Публичные функции:**
| Функция | Параметры | Что делает |
|---------|-----------|------------|
| `detectSceneType(text)` | `text: string` | Возвращает тип сцены |
| `analyze(text)` | `text: string` | Обновляет `L.currentScene` |

**Типы сцен:**
- `combat` — бой, драка
- `dialogue` — разговор
- `travel` — перемещение
- `training` — тренировка
- `exploration` — исследование
- `rest` — отдых
- `general` — общее

---

## 3. Механики

### 3.1 Anti-Echo

**Реализована в:** Library (строки 1500–1800)
**Описание:** Предотвращает повторение последних предложений в выводе AI.

**Как работает:**
1. `LC.applyAntiEcho(text, baseline, actionType)` сравнивает новый текст с baseline
2. Использует кэш предложений (`LC._echoCache`) с LRU-вытеснением
3. Если совпадение превышает порог — удаляет повторяющееся предложение
4. Пороги адаптируются к типу действия (continue имеет более низкий порог)

**Связанные параметры:**
- `CONFIG.LIMITS.ANTI_ECHO.SENTENCE_OVERLAP_THRESHOLD` — порог совпадения
- `CONFIG.LIMITS.ANTI_ECHO.CACHE_MAX_SENTENCES` — размер кэша
- `CONFIG.LIMITS.ANTI_ECHO.CONTINUE_THRESHOLD_MULT` — множитель для continue

### 3.2 Recap System

**Реализована в:** Library (строки 8956–9122)
**Описание:** Автоматическое предложение и генерация рекапов (кратких пересказов).

**Как работает:**
1. `checkRecapOfferV2()` вычисляет "recap score" на основе:
   - Количества ходов с последнего рекапа
   - Веса событий с экспоненциальным затуханием
   - Наличия "горячих" NPC
2. При превышении порога предлагается рекап
3. Игрок отвечает `/да`, `/нет`, `/позже`
4. Черновик сохраняется в `L.recapDraft`, применяется через `/continue`

**Связанные параметры:**
- `CONFIG.RECAP_V2.SCORE_THRESHOLD` — порог предложения
- `CONFIG.RECAP_V2.COOLDOWN_TURNS` — минимум ходов между предложениями
- `CONFIG.RECAP_V2.DECAY_HALF_LIFE` — период полураспада веса событий

### 3.3 Unified Analysis Pipeline

**Реализована в:** Library (UnifiedAnalyzer), Output
**Описание:** Единый конвейер анализа текста, координирующий все движки.

**Как работает:**
1. Output.js вызывает `LC.UnifiedAnalyzer.analyze(text, actionType)`
2. UnifiedAnalyzer детектирует драматические события
3. Последовательно вызывает все движки анализа
4. Применяет репутационный шок для высокодраматичных событий
5. Периодически запускает пересчёт статусов

**Связанные движки:**
- TimeEngine, EvergreenEngine, GoalsEngine, MoodEngine
- EnvironmentEngine, GossipEngine, RelationsEngine
- DemographicPressure, HierarchyEngine, LoreEngine, SceneDetectionEngine

### 3.4 Character Lifecycle

**Реализована в:** Library (CharacterGC, updateCharacterActivity)
**Описание:** Управление жизненным циклом персонажей.

**Состояния:**
- `EXTRA` — эпизодический персонаж
- `SECONDARY` — второстепенный (продвинутый из EXTRA)
- `MAIN` — главный персонаж
- `ACTIVE` — активный
- `FROZEN` — заморожен (давно не появлялся)

**Переходы:**
- Упоминание → `lastSeen = turn`, `mentions++`
- 5+ упоминаний за 50 ходов → EXTRA → SECONDARY
- 100+ ходов без появления → SECONDARY → FROZEN
- 200+ ходов + ≤2 упоминания → EXTRA → удаление

### 3.5 Demographic Pressure

**Реализована в:** Library (DemographicPressure)
**Описание:** Обнаружение "вакуумов" в нарративе, требующих новых персонажей.

**Паттерны:**
- Один персонаж в фокусе долгое время
- Нужен эксперт (хакер, медик, механик)
- Нужен защитник

**Результат:** Тег `⟦SUGGESTION⟧` в контекстном оверлее

### 3.6 Gossip Garbage Collection

**Реализована в:** Library (GossipEngine.runGarbageCollection)
**Описание:** Управление жизненным циклом слухов.

**Жизненный цикл:**
1. `ACTIVE` — новый слух, распространяется
2. `FADED` — 75% персонажей знают
3. `ARCHIVED` — 50 ходов после FADED → удаление

**LRF Protocol:** При превышении `RUMOR_HARD_CAP` (150) — принудительная архивация наименее релевантных слухов.

### 3.7 Context Caching (stateVersion)

**Реализована в:** Library (composeContextOverlay)
**Описание:** Оптимизация пересборки контекста через версионирование.

**Как работает:**
1. Каждое изменение состояния инкрементирует `L.stateVersion`
2. `composeContextOverlay()` кэширует результат с `stateVersion`
3. При совпадении версии — возврат из кэша
4. При несовпадении — полная пересборка

**Связанные движки:** Все движки, изменяющие состояние, вызывают `L.stateVersion++`

### 3.8 Player Info Levels

**Реализована в:** Library/Output (playerInfoLevel)
**Описание:** Фильтрация системных сообщений по уровню игрока.

**Уровни:**
- `character` — игрок видит только то, что видит персонаж
- `director` — игрок видит всю информацию (метаданные, статистика)

**Как работает:**
- Сообщения помечаются `level: 'character'` или `level: 'director'`
- Output.js фильтрует по `L.playerInfoLevel`
- Теги `⟦DIRECTOR⟧` скрываются в режиме `character`

---

## 4. Полная таблица slash-команд

| Команда | Синтаксис | Описание | Движок/Модуль |
|---------|-----------|----------|---------------|
| `/help`, `/h` | `/help` | Показать список команд | Input (buildHelpMessage) |
| `/stats` | `/stats` | Показать статистику | Input (buildStatsMessage) |
| `/да` | `/да` | Принять предложение рекапа | Input |
| `/нет` | `/нет` | Отклонить предложение рекапа | Input |
| `/позже` | `/позже` | Отложить рекап на 3 хода | Input |
| `/undo` | `/undo [N]` | Откатить N ходов | Input → LC.turnUndo |
| `/turn` | `/turn set N` | Установить номер хода | Input → LC.turnSet |
| `/continue` | `/continue` | Применить черновик рекапа/эпохи | LC.Drafts |
| `/recap` | `/recap` | Запросить рекап вручную | не обнаружено в коде |
| `/epoch` | `/epoch` | Запросить эпоху вручную | не обнаружено в коде |
| `/evergreen` | `/evergreen on\|off\|clear\|show` | Управление Evergreen | LC.CommandsRegistry |
| `/cadence` | `/cadence N` | Установить каденцию рекапов | не обнаружено в коде |
| `/sys` | `/sys on\|off` | Вкл/выкл системные сообщения | не обнаружено в коде |
| `/debug` | `/debug` | Показать отладочную информацию | не обнаружено в коде |
| `/selftest` | `/selftest` | Запустить самотестирование | LC.selfTest |

---

## 5. Теги контекстного оверлея

| Тег | Приоритет/Вес | Движок | Условие показа |
|-----|--------------|--------|----------------|
| `⟦INTENT⟧` | 1000 | Input | Есть lastIntent |
| `⟦TASK⟧` | 900 | composeContextOverlay | task = recap/epoch |
| `⟦CANON⟧` | 800 | EvergreenEngine | getCanon() не пустой |
| `⟦SUGGESTION⟧` | 760 | DemographicPressure | Есть подсказки |
| `⟦GOAL⟧` | 750 | GoalsEngine | Активные цели за последние 20 ходов |
| `⟦SECRET⟧` | 740 | KnowledgeEngine | Секрет видим фокусным персонажам |
| `⟦CONFLICT:имя⟧` | 735 | CrucibleEngine | Расхождение personality/self_concept |
| `⟦TRAITS:имя⟧` | 730 | composeContextOverlay | HOT персонаж с выраженными чертами |
| `⟦STATUS:имя⟧` | 728 | HierarchyEngine | HOT персонаж — leader/outcast |
| `⟦QUALIA:имя⟧` | 727 | QualiaEngine | Экстремальное квалиа-состояние |
| `⟦PERCEPTION:имя⟧` | 726 | InformationEngine | Сильные восприятия между HOT персонажами |
| `⟦MOOD⟧` | 725 | MoodEngine | Активный статус настроения |
| `⟦TIME⟧` | 720 | TimeEngine | Всегда (день, время суток) |
| `⟦SCHEDULE⟧` | 715 | TimeEngine | Есть предстоящие события |
| `⟦ZEITGEIST⟧` | 710 | MemoryEngine | Есть доминантный миф |
| `⟦OPENING⟧` | 700 | composeContextOverlay | Есть вступительная строка |
| `⟦SCENE⟧ Focus` | 600 | composeContextOverlay | HOT персонажи (turnsAgo ≤ 3) |
| `⟦SCENE⟧ Recently` | 500 | composeContextOverlay | ACTIVE персонажи (turnsAgo ≤ 10) |
| `⟦GUIDE⟧` | 400 | composeContextOverlay | Всегда |
| `⟦WORLD⟧` | 200 | composeContextOverlay | Есть population данные |
| `⟦META⟧` | 100 | composeContextOverlay | turn > 0 |

---

## 6. Структура state.lincoln (полная)

```javascript
state.lincoln = {
  // === ОСНОВНЫЕ СЧЁТЧИКИ ===
  turn: 0,                        // number — текущий ход игры
  stateVersion: 0,                // number — версия состояния для инвалидации кэша
  lastProcessedTurn: -1,          // number — последний обработанный ход
  cadence: 15,                    // number — каденция предложения рекапов
  consecutiveRetries: 0,          // number — подряд идущие retry

  // === ТЕКУЩЕЕ ДЕЙСТВИЕ ===
  currentAction: {
    type: 'story',                // 'story' | 'command' | 'retry' | 'continue'
    name: null,                   // string? — имя команды
    task: null,                   // 'recap' | 'epoch' | null
    wantRecap: false,             // boolean — активно предложение рекапа
    __cmdCyclePending: false      // boolean — внутренний флаг
  },
  lastActionType: 'story',        // string — тип последнего действия
  lastIntent: '',                 // string — последнее намерение игрока

  // === ПЕРСОНАЖИ ===
  characters: {
    "Максим Бергман": {
      name: "Максим Бергман",     // string — полное имя
      type: 'SECONDARY',          // 'MAIN' | 'SECONDARY' | 'EXTRA'
      status: 'ACTIVE',           // 'ACTIVE' | 'FROZEN'
      firstSeen: 0,               // number — первое появление
      lastSeen: 15,               // number — последнее появление
      mentions: 12,               // number — количество упоминаний
      reputation: 75,             // number — репутация (0-100)
      
      personality: {              // Объективные черты
        trust: 0.6,               // 0-1
        bravery: 0.7,             // 0-1
        idealism: 0.5,            // 0-1
        aggression: 0.3           // 0-1
      },
      
      self_concept: {             // Самовосприятие
        perceived_trust: 0.5,
        perceived_bravery: 0.8,
        perceived_idealism: 0.5,
        perceived_aggression: 0.2
      },
      
      qualia_state: {             // Феноменальное состояние
        somatic_tension: 0.3,     // 0-1
        valence: 0.6,             // 0-1
        focus_aperture: 0.7,      // 0-1
        energy_level: 0.8         // 0-1
      },
      
      perceptions: {              // Восприятие других персонажей
        "Хлоя": {
          affection: 75,          // 0-100
          trust: 80,              // 0-100
          respect: 70,            // 0-100
          rivalry: 20             // 0-100
        }
      },
      
      social: {                   // Социальный статус
        status: 'member',         // 'leader' | 'member' | 'outcast'
        capital: 120,             // number — социальный капитал
        conformity: 0.6           // 0-1 — степень конформности
      },
      
      aptitude: {                 // Способности по предметам
        "Математика": 0.7,
        "Физика": 0.5
      },
      
      effort: {                   // Усилия по предметам
        "Математика": 0.6,
        "Физика": 0.8
      },
      
      tags: ["Отличник"],         // array — теги персонажа
      flags: {}                   // object — произвольные флаги
    }
  },

  // === ЦЕЛИ ===
  goals: {
    "Максим_123_abc": {
      character: "Максим",
      text: "победить на турнире",
      status: "active",           // 'active' | 'completed'
      turnCreated: 15,
      plan: [
        { text: "Подготовиться", status: "complete" },
        { text: "Выступить", status: "in-progress" },
        { text: "Победить", status: "pending" }
      ],
      planProgress: 1,
      inspiredByLore: null,       // string? — тег вдохновения легендой
      reactiveToEvent: null,      // string? — реактивная цель
      academicGoal: false,        // boolean
      currentGPA: null            // number?
    }
  },

  // === СЛУХИ ===
  rumors: [
    {
      id: "rumor_123_abc",
      text: "Максим поцеловал Хлою",
      type: "romance",
      subject: "Максим",
      target: "Хлоя",
      spin: "positive",           // 'positive' | 'negative' | 'neutral'
      turn: 15,
      knownBy: ["Эшли"],
      distortion: 0.5,
      verified: false,
      status: "ACTIVE",           // 'ACTIVE' | 'FADED' | 'ARCHIVED'
      fadedAtTurn: null           // number?
    }
  ],

  // === СЕКРЕТЫ ===
  secrets: [
    {
      text: "Максим на самом деле богат",
      known_by: ["Хлоя", "Эшли"]
    }
  ],

  // === СОБЫТИЯ (для рекапа) ===
  events: [
    {
      type: "conflict",
      turn: 15,
      weight: 0.8,
      src: "output"
    }
  ],

  // === ВРЕМЯ ===
  time: {
    currentDay: 1,
    dayName: "Понедельник",
    timeOfDay: "Утро",
    turnsPerToD: 5,
    turnsInCurrentToD: 0,
    scheduledEvents: [
      {
        id: "party_1",
        name: "Вечеринка",
        day: 5
      }
    ],
    lastTimeJump: null
  },

  // === ОКРУЖЕНИЕ ===
  environment: {
    location: "classroom",
    weather: null
  },

  // === АКАДЕМИКА ===
  academics: {
    grades: {
      "Максим": {
        "Математика": [
          { grade: 4.5, turn: 10 },
          { grade: 5.0, turn: 20 }
        ]
      }
    }
  },

  // === EVERGREEN (долгосрочная память) ===
  evergreen: {
    enabled: true,
    relations: {
      "Максим": {
        "Хлоя": 25                // number или {affection, trust, respect, rivalry}
      }
    },
    status: {
      "Максим": "капитан команды"
    },
    obligations: {
      "Максим_1": "Максим owes Хлоя: помощь с домашкой"
    },
    facts: {
      "f_123_abc": "Важно: директор уехал"
    },
    history: [
      {
        turn: 15,
        category: "relations",
        key: "Максим→Хлоя",
        old: 20,
        new: 25
      }
    ],
    lastUpdate: 15
  },

  // === СОЦИАЛЬНАЯ СТРУКТУРА ===
  society: {
    norms: {
      "betrayal": {
        strength: 0.9,
        lastUpdate: 100,
        violations: 2,
        reinforcements: 5
      }
    },
    myths: [
      {
        type: "myth",
        theme: "loyalty_rescue",
        hero: "Максим",
        moral: "защищать друзей — правильно",
        strength: 0.85,
        createdTurn: 200,
        originalTurn: 100
      }
    ]
  },

  // === ЛЕГЕНДЫ ===
  lore: {
    entries: [
      {
        type: "betrayal",
        participants: ["Максим", "Хлоя"],
        witnesses: 10,
        impact: 45,
        description: "...",
        Text: "Максим предал Хлою...",
        turn: 150,
        potential: 85
      }
    ],
    archive: [],
    stats: {
      type_betrayal: 1
    },
    coolDown: 350
  },

  // === ПОПУЛЯЦИЯ МИРА ===
  population: {
    unnamedStudents: 100,
    unnamedTeachers: 15
  },

  // === НАСТРОЕНИЯ ПЕРСОНАЖЕЙ ===
  character_status: {
    "Максим": {
      mood: "angry",
      reason: "ссора",
      expires: 25
    }
  },

  // === ТЕКУЩАЯ СЦЕНА ===
  currentScene: "dialogue",

  // === РЕКАПЫ И ЭПОХИ ===
  lastRecapTurn: 0,
  lastEpochTurn: 0,
  recapDraft: null,               // object? — черновик рекапа
  epochDraft: null,               // object? — черновик эпохи
  recapMuteUntil: 0,              // number — мьют предложений до хода

  // === ВЫВОД ===
  lastOutput: "",
  prevOutput: "",
  lastInput: "",
  openingCaptured: false,
  opening: "",

  // === СИСТЕМНЫЕ СООБЩЕНИЯ ===
  sysMsgs: [],
  sysShow: false,

  // === УРОВЕНЬ ИНФОРМАЦИИ ИГРОКА ===
  playerInfoLevel: 'character',   // 'character' | 'director'

  // === ТЕЛЕМЕТРИЯ ===
  tm: {
    recaps: 0,
    epochs: 0,
    recapTurns: [],
    wantRecapTurn: 0,
    lastRecapScore: 0,
    echoHits: 0,
    retries: 0,
    errors: 0
  },

  // === ВНУТРЕННИЕ КЭШИ ===
  evergreenHistoryCap: 100,
  _cmdSysSeen: null,
  _cmdSysSeq: 0
}
```

---

## 7. Тестовые файлы

| Файл | Что покрывает |
|------|---------------|
| `comprehensive_audit.js` | Комплексный аудит всей системы |
| `dynamic_stress_test.js` | Стресс-тестирование под нагрузкой |
| `enhanced_audit.js` | Расширенный аудит |
| `omega_protocol_test.js` | Тестирование Omega Protocol |
| `test_academics_engine.js` | AcademicsEngine — расчёт оценок, GPA |
| `test_academics_phase2.js` | AcademicsEngine Phase 2 — интеграция с настроением |
| `test_access_levels.js` | Уровни доступа playerInfoLevel |
| `test_character_lifecycle.js` | Жизненный цикл персонажей (CharacterGC) |
| `test_chronological_kb.js` | ChronologicalKnowledgeBase — временные паттерны |
| `test_context_overlay_new_tags.js` | Новые теги контекстного оверлея |
| `test_crucible.js` | CrucibleEngine — эволюция личности |
| `test_current_action.js` | Система currentAction |
| `test_engines.js` | Базовое тестирование движков |
| `test_environment.js` | EnvironmentEngine — локации, погода |
| `test_epic4_integration.js` | Интеграция Epic 4 |
| `test_forced_archiving.js` | Принудительная архивация слухов |
| `test_goals.js` | GoalsEngine — цели персонажей |
| `test_goals_2.0.js` | GoalsEngine 2.0 — планы и прогресс |
| `test_gossip.js` | GossipEngine — слухи |
| `test_gossip_gc.js` | GossipGC — сборка мусора слухов |
| `test_grades_sliding_window.js` | Скользящее окно оценок |
| `test_hardening_integration.js` | Интеграция Hardening Protocol |
| `test_hardening_protocol.js` | Hardening Protocol |
| `test_integration_subjective_livingworld.js` | Интеграция субъективности и LivingWorld |
| `test_living_world.js` | LivingWorld — автономия NPC |
| `test_lore_archiving.js` | Архивация легенд |
| `test_lore_engine.js` | LoreEngine — создание легенд |
| `test_lore_integration.js` | Интеграция LoreEngine |
| `test_lore_phase2_stress.js` | LoreEngine Phase 2 стресс-тест |
| `test_lore_stress.js` | LoreEngine стресс-тест |
| `test_lore_text_generation.js` | Генерация текста легенд |
| `test_lore_text_regression.js` | Регрессия текста легенд |
| `test_lrf_protocol.js` | LRF Protocol — принудительная архивация |
| `test_memory_engine.js` | MemoryEngine — мифологизация |
| `test_memory_leak_fix.js` | Исправление утечек памяти |
| `test_memory_leak_stress.js` | Стресс-тест утечек памяти |
| `test_mood.js` | MoodEngine — настроения |
| `test_multilingual_support.js` | Мультиязычная поддержка |
| `test_performance.js` | Тестирование производительности |
| `test_qualia_engine.js` | QualiaEngine — феноменальные состояния |
| `test_qualia_integration_fix.js` | Интеграция QualiaEngine |
| `test_rebirth_protocol.js` | Rebirth Protocol |
| `test_relations_2.0.js` | RelationsEngine 2.0 — многовекторные отношения |
| `test_russian_enhancements.js` | Русскоязычные улучшения |
| `test_russian_time_anchors_and_scenes.js` | Русские временные якоря и сцены |
| `test_secrets.js` | KnowledgeEngine — секреты |
| `test_self_concept.js` | CrucibleEngine — самовосприятие |
| `test_social_catalysts.js` | Социальные катализаторы (LivingWorld) |
| `test_social_engine.js` | HierarchyEngine + NormsEngine |
| `test_subjective_reality.js` | InformationEngine — субъективная реальность |
| `test_time.js` | TimeEngine — управление временем |
| `validate_implementation.js` | Валидация реализации |
| `validate_living_world.js` | Валидация LivingWorld |
| `validate_social_architecture.js` | Валидация социальной архитектуры |
| `demo_*.js` | Демонстрационные скрипты для различных движков |

---

> **Примечание:** Данный отчёт сгенерирован на основе полного анализа исходного кода Lincoln v16.0.8.
> Все описания написаны на русском языке согласно требованиям.
