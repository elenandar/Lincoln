# Lincoln v16.0.8 — Движки и Механики (V3)

> Третий проход аудита. Фокус: пробелы V1/V2, спорные движки, полные таблицы.
> Дата: 2026-04-03
> Источники: Library v16.0.8.patched.txt, Output v16.0.8.patched.txt, Input v16.0.8.patched.txt, Context v16.0.8.patched.txt

---

## Изменения относительно V2

1. **Все 13 спорных движков подтверждены** — каждый найден в коде с точной строкой определения (см. раздел 1)
2. **`LC.CrucibleEngine` НЕ НАЙДЕН** — в коде определён как `LC.Crucible`, не `LC.CrucibleEngine`
3. **`FEATURES.STRICT_CMD_BYPASS`** — добавлен в V3, отсутствовал в V2 (строка 61 Library)
4. **`OUTPUT_BUDGET_MS`** — необязательный CONFIG-параметр (дефолт 3500мс), используется только в Output.js (строка 206)
5. **`LC.ChronologicalKnowledgeBase`** — добавлен как отдельный объект (строка 5763), V2 описывал его поверхностно
6. **`LC.KnowledgeEngine`** — добавлен (строка 4784), V2 упоминал, но не указывал точную строку
7. **Метод `Observer.observe()` (не `Observer.watch()`)** — исправлена ошибка из V2 (строка 5566)
8. **Метод GossipEngine `runGarbageCollection()` (не `GossipGC.run()`)** — это метод самого GossipEngine, не отдельный объект
9. **`QualiaEngine.runGroupResonance()`** — новый метод, не упоминался в V2 (строка 7743)
10. **Теги `⟦ZEITGEIST⟧` и `⟦SCHEDULE⟧`** — не имеют числового приоритета в weight() и получают вес 0 (попадают в конец)
11. **Дополнительные LC-объекты:** `LC.Flags`, `LC.Tools`, `LC.Utils`, `LC.Drafts`, `LC.Turns` — набор фасадов, не упоминались в V2
12. **`LC._normUCached`**, **`LC.buildCtxPreview`** — утилиты, отсутствовали в V2
13. **`L.visibleNotice`** — поле state.lincoln для пуш-уведомлений, отсутствовало в V2
14. **`L._cmdSysSeq` / `L._cmdSysSeen`** — внутренние поля дедупликации SYS-сообщений, отсутствовали в V2
15. **`L.currentScene`** — поле, устанавливаемое SceneDetectionEngine (строка 6338), отсутствовало в V2
16. **`L.__currentEventInfo`** — временное поле для dramaticMultiplier, отсутствовало в V2

---

## 1. Спорные движки — вердикт по коду

Все проверки сделаны прямым поиском по `Library v16.0.8.patched.txt`.

| Движок | Статус | Строка | Фрагмент кода |
|--------|--------|--------|----------------|
| `LC.LoreEngine` | ✅ Найден | 8498 | `LoreEngine: {` |
| `LC.MemoryEngine` | ✅ Найден | 8317 | `MemoryEngine: {` |
| `LC.AcademicsEngine` | ✅ Найден | 7111 | `AcademicsEngine: {` |
| `LC.SceneDetectionEngine` | ✅ Найден | 6040 | `SceneDetectionEngine: {` |
| `LC.CharacterGC` | ✅ Найден | 5685 | `CharacterGC: {` |
| `LC.DemographicPressure` | ✅ Найден | 3480 | `DemographicPressure: {` |
| `LC.QualiaEngine` | ✅ Найден | 7657 | `QualiaEngine: {` |
| `LC.NormsEngine` | ✅ Найден | 7811 | `NormsEngine: {` |
| `LC.HierarchyEngine` | ✅ Найден | 7966 | `HierarchyEngine: {` |
| `LC.InformationEngine` | ✅ Найден | 4569 | `InformationEngine: {` |
| `LC.Crucible` | ✅ Найден | 7328 | `Crucible: {` (комментарий: «The Crucible: Character Evolution Engine», строка 7327) |
| `LC.CrucibleEngine` | ❌ **НЕ НАЙДЕН** | — | В коде определён как `LC.Crucible`, а не `LC.CrucibleEngine` |
| `LC.LivingWorld` | ✅ Найден | 6474 | `LivingWorld: {` |
| `LC.UnifiedAnalyzer` | ✅ Найден | 3149 | `UnifiedAnalyzer: {` |

**Итого:** все 13 движков подтверждены в коде v16.0.8. `CrucibleEngine` — это `Crucible` (другое имя).

---

## 2. Дополнения к движкам из V1/V2

### 2.1 LC.ChronologicalKnowledgeBase (строка 5763)

V2 упоминал, но не указывал точную строку. Это **не движок-анализатор**, а **база данных** семантических паттернов. Не имеет метода `analyze()`. Содержит только описатели паттернов (SLEEP, BREAKFAST, LUNCH, DINNER и т.д.), которые `UnifiedAnalyzer` использует для вызова `TimeEngine.processSemanticAction()`.

### 2.2 LC.KnowledgeEngine (строка 4784)

V2 описывал как встроенный внутри MoodEngine. В коде — **отдельный объект** с двумя методами:
- `extractFocusCharacters(contextText)` — парсит `⟦SCENE⟧ Focus on:` тег
- `isSecretVisible(secret, focusCharacters)` — проверяет видимость секрета

### 2.3 QualiaEngine — метод `runGroupResonance`

Не упоминался в V1/V2. Строка 7743:
```javascript
runGroupResonance(characterNames, convergenceRate = 0.1)
```
Сближает `qualia_state` персонажей в одной сцене (emotional contagion / social convergence). Параметр `convergenceRate` по умолчанию 0.1.

### 2.4 GossipEngine — уточнения

- **Observer** вызывается как `this.Observer.observe(text)` (строка 5566), **НЕ** `Observer.watch()`
- **Propagator** — подобъект: `this.Propagator.autoPropagate(char1, char2)` (строка 5582)
- **Сборка мусора** — метод `runGarbageCollection()` (строка 5595) самого GossipEngine, а не отдельный `GossipGC.run()`

### 2.5 LivingWorld — уточнения

Главный метод: `runOffScreenCycle(timeJump)` (строка 6482), **НЕ** `simulate(timeJump)`.
Дополнительные методы:
- `simulateCharacter(character)` (строка 6635)
- `generateFact(characterName, action)` (строка 6739)
- `_generateSocialCatalyst(characterName)` (строка 6547)

### 2.6 HierarchyEngine — приватные методы

Не упоминались в V1/V2:
- `_getAverageWitnessRespect(characterName, excludeTarget)` — средний respect от свидетелей
- `_getAverageWitnessTrust(characterName)` — средний trust от свидетелей

### 2.7 LC-фасады (не упоминались в V1/V2)

| Объект | Строка | Назначение |
|--------|--------|------------|
| `LC.Flags` | 118 | Управление флагами: `clearCmd()`, `setCmd()`, `queueRecap()`, `queueEpoch()` |
| `LC.Tools` | 189 | Утилиты: `safeRegexMatch(text, regex, timeout)` (строка 198) |
| `LC.Utils` | 237 | Утилиты: `getEventDramaticMultiplier(event)` (строка 249) |
| `LC.Drafts` | 337 | Черновики: `applyPending(L, source)` (строка 338) |
| `LC.Turns` | 355 | Управление ходами: `incIfNeeded()`, `set(n)`, `undo(n)` |

### 2.8 Дополнительные утилитарные функции

| Функция | Строка | Назначение |
|---------|--------|------------|
| `LC.sanitizeAliases(L)` | 69 | Очистка и дедупликация алиасов |
| `LC.pushNotice(msg)` | 105 | Добавление уведомления в очередь |
| `LC.consumeNotices()` | 110 | Извлечение и очистка уведомлений |
| `LC.sysLine(msg)` | 161 | Форматирование однострочного SYS-сообщения |
| `LC.sysBlock(lines)` | 171 | Форматирование блока SYS-сообщений |
| `LC._normUCached(s)` | 410 | Кэшированная Unicode-нормализация |
| `LC.buildCtxPreview(stateOrOpts, opts)` | 367 | Превью контекстного оверлея |
| `LC.applyRecapDraft(L)` | 308 | Применение черновика рекапа |
| `LC.applyEpochDraft(L)` | 329 | Применение черновика эпохи |
| `LC.ensureEventsCap(cap)` | 9806 | Ограничение массива событий |
| `LC.migrateState(L)` | 9818 | Миграция state при смене версии |
| `LC.selfTest()` | 9830 | Самодиагностика системы |
| `LC.migrateToVersion(L, fromV, toV)` | 10015 | Миграция между версиями |
| `LC.ctxPreview()` | 10025 | Краткий превью контекста |
| `LC.syncRecapToStoryCards(text, windowTurns)` | (Output) | Синхронизация рекапа в Story Cards |

---

## 3. Полная таблица slash-команд

### 3.1 Команды из CommandsRegistry (Library)

| Команда | Строка | Движок / Модуль | Описание | Аргументы |
|---------|--------|-----------------|----------|-----------|
| `/ui` | 435 | Инфраструктура | Вкл/выкл системные сообщения | `on\|off` |
| `/debug` | 454 | Инфраструктура | Режим отладки | `on\|off` |
| `/mode` | 473 | Инфраструктура | Уровень доступа | `director\|character` |
| `/recap` | 492 | Recap System | Запросить черновик рекапа | — |
| `/epoch` | 506 | Recap System | Запросить черновик эпохи | — |
| `/continue` | 520 | Recap System | Сохранить черновик | — |
| `/evergreen` | 535 | EvergreenEngine | Управление Evergreen | `on\|off\|clear\|summary\|set <cat>: <value>` |
| `/secret` | 569 | KnowledgeEngine | Добавить секрет | `<text> known_by: <Name1>, <Name2>` |
| `/time` | 618 | TimeEngine | Показать/установить время | — / `set day N [Name]` / `next` |
| `/weather` | 683 | EnvironmentEngine | Показать/установить погоду | — / `set <type>` |
| `/location` | 722 | EnvironmentEngine | Показать/установить локацию | — / `set <name>` |
| `/rumor` | 752 | GossipEngine | Управление слухами | — / `add <text> about <char>` / `spread <id> from <c1> to <c2>` |
| `/reputation` | 817 | GossipEngine | Показать/установить репутацию | — / `<char>` / `set <char> <value>` |
| `/event` | 878 | TimeEngine | Запланировать событие | `add "<Name>" on day N` |
| `/schedule` | 929 | TimeEngine | Показать расписание | — |
| `/antiecho` | 971 | Anti-Echo | Управление Anti-Echo | `on\|off\|sensitivity N\|mode soft\|hard\|stats\|flush` |
| `/events` | 1015 | Event Tracking | Показать последние события | `[N]` |
| `/alias` | 1032 | EvergreenEngine | Управление псевдонимами | `add <Name>=a,b,c` / `del <Name>` / `list` |
| `/evhist` | 1073 | EvergreenEngine | История Evergreen | `cap N` / `last N` / `clear` |
| `/characters` | 1104 | CharacterGC | Список активных NPC | — |
| `/opening` | 1116 | Инфраструктура | Показать opening | — |
| `/retry` | 1125 | Инфраструктура | Информация о повторах | — |
| `/cadence` | 1154 | Recap System | Установить каденцию | `N` (6–24) |
| `/story` | 1173 | Инфраструктура | Управление историей | `add <text>` / `del <id>` |
| `/cards` | 1198 | Инфраструктура | Список Story Cards | — |
| `/pin` | 1222 | Инфраструктура | Закрепить карточку | `<id>` |
| `/unpin` | 1237 | Инфраструктура | Открепить карточку | `<id>` |
| `/del` | 1253 | Инфраструктура | Удалить карточку | `<id>` |
| `/ctx` | 1270 | composeContextOverlay | Инспекция оверлея | — |
| `/selftest` | 1307 | Инфраструктура | Самодиагностика | — |

### 3.2 Команды-заглушки из LC.Commands (Library)

| Команда | Строка | Описание |
|---------|--------|----------|
| `/help` | 1358 | Заглушка (реальный handler в Input) |
| `/stats` | 1361 | Заглушка (реальный handler в Input) |

### 3.3 Команды из Input

| Команда | Строка (Input) | Описание |
|---------|----------------|----------|
| `/help` / `/h` | 232–233 | Генерация помощи из CommandsRegistry |
| `/stats` | 234 | Статистика системы |
| `/undo` | 267 | Откат хода: `/undo [N]` |
| `/turn set` | 275 | Установка хода: `/turn set N` |
| `/да` | 284 | Принять предложение рекапа |
| `/нет` | 294 | Отклонить предложение рекапа |
| `/позже` | 302 | Отложить рекап на 3 хода |

**Итого: 37 уникальных команд** (30 в CommandsRegistry + 7 в Input).

---

## 4. Полная таблица тегов оверлея

Приоритеты из функции `weight()` (строки 9743–9762 Library):

| Тег | Приоритет | Массив | Источник данных | Условие показа |
|-----|-----------|--------|-----------------|----------------|
| `⟦INTENT⟧` | 1000 | priority | `L.lastIntent` | Непустой lastIntent (>2 символов) |
| `⟦TASK⟧` | 900 | priority | `L.currentAction.task` | task === 'recap' или 'epoch' |
| `⟦CANON⟧` | 800 | priority | `EvergreenEngine.getCanon()` | Непустой canon |
| `⟦SUGGESTION⟧` | 760 | priority | `DemographicPressure.getSuggestions()` | Есть подсказки |
| `⟦GOAL⟧` | 750 | priority | `L.goals` | Активные цели (< 20 ходов) |
| `⟦SECRET⟧` | 740 | priority | `L.secrets` + `KnowledgeEngine` | Секреты, видимые HOT-персонажам |
| `⟦CONFLICT: Name⟧` | 735 | priority | `Crucible` (personality/self_concept) | Расхождение > 0.2 между personality и self_concept |
| `⟦TRAITS: Name⟧` | 730 | priority | `Crucible` (personality/self_concept) | Крайние значения trust/bravery/idealism/aggression для HOT |
| `⟦STATUS: Name⟧` | 728 | priority | `HierarchyEngine` (social.status) | status !== 'member' для HOT |
| `⟦QUALIA: Name⟧` | 727 | priority | `QualiaEngine` (qualia_state) | Крайние значения somatic/valence/focus/energy для HOT |
| `⟦PERCEPTION: Name⟧` | 726 | priority | `RelationsEngine` (perceptions) | Крайние значения affection/trust/respect/rivalry между HOT |
| `⟦MOOD⟧` | 725 | priority | `MoodEngine` (character_status) | expires > current turn |
| `⟦OPENING⟧` | 700 | normal | `L.opening` | Есть opening и TTL не истёк |
| `⟦SCENE⟧ Focus on:` | 600 | priority | `getActiveCharacters()` | Есть HOT-персонажи (lastSeen ≤ 3) |
| `⟦SCENE⟧ Recently active:` | 500 | normal | `getActiveCharacters()` | Есть ACTIVE-персонажи (lastSeen ≤ 10) |
| `⟦GUIDE⟧` | 400 | priority+normal | Константы | Всегда (4 строки) |
| `⟦WORLD⟧` | 200 | normal | `L.population` | population > 0 |
| `⟦META⟧` | 100 | normal | `L.turn`, рекап/эпоха | Всегда |
| `⟦TIME⟧` | **0** ⚠️ | priority | `L.time` | Если time инициализировано |
| `⟦SCHEDULE⟧` | **0** ⚠️ | priority | `L.time.scheduledEvents` | Есть события ≤ 7 дней |
| `⟦ZEITGEIST⟧` | **0** ⚠️ | priority | `MemoryEngine.getDominantMyth()` | Есть доминирующий миф |

> ⚠️ **Важное уточнение:** `⟦TIME⟧`, `⟦SCHEDULE⟧` и `⟦ZEITGEIST⟧` **НЕ имеют** числового приоритета в функции `weight()` — они попадают в ветку `return 0`. Однако, поскольку они добавляются в массив `priority[]`, они всё равно обрабатываются раньше элементов из `normal[]` при одинаковом весе (stable sort). V2 указывала для них приоритеты ~350/~300/~290 — это было **ошибкой**.

---

## 5. Полная структура state.lincoln

Все поля инициализируемые в `lcInit()` (строки 1441–1680 Library):

| Поле | Тип | Дефолт | Кто пишет | Кто читает |
|------|-----|--------|-----------|------------|
| `L.version` | string | `"16.0.8-compat6d"` | lcInit | все |
| `L._modsSeen` | object | `{}` | lcInit | lcInit (проверка версий) |
| `L._versionCheckDone` | bool | `false` | lcInit | lcInit |
| `L.stateVersion` | number | `0` | все движки (++) | composeContextOverlay (кэш) |
| `L.turn` | number | `0` | Output (incrementTurn) | все |
| `L.lastProcessedTurn` | number | `-1` | Output | Output |
| `L.lastActionType` | string | `""` | Input | Output, Context |
| `L.currentAction` | object | `{}` | Input, Library | Output, Context |
| `L.lastInput` | string | `""` | Input | — |
| `L.lastOutput` | string | `""` | Output | Anti-Echo |
| `L.prevOutput` | string | `""` | Output | Anti-Echo |
| `L.lastIntent` | string | `""` | Input | composeContextOverlay |
| `L.retryCount` | number | `0` | Output | Output |
| `L.consecutiveRetries` | number | `0` | Output | composeContextOverlay (META) |
| `L.continueCount` | number | `0` | Output | — |
| `L.antiEchoEnabled` | bool | `true` | /antiecho | Anti-Echo |
| `L.antiEchoSensitivity` | number | `85` | /antiecho | Anti-Echo |
| `L.antiEchoMode` | string | `"soft"` | /antiecho | Anti-Echo |
| `L.cadence` | number | `12` (DEFAULT) | /cadence | Recap System |
| `L.debugMode` | bool | `false` | /debug | lcDebug |
| `L.sysShow` | bool | `true` | /ui | Output (фильтрация SYS) |
| `L.playerInfoLevel` | string | `"character"` | /mode | Output (фильтрация director-уровня) |
| `L.opening` | string | `""` | Output (captureOpening) | composeContextOverlay |
| `L.openingCaptured` | bool | `false` | Output | Output |
| `L.openingTurn` | number | `-1` | Output | getOpeningLine (TTL) |
| `L.openingTTL` | number | `15` | lcInit | getOpeningLine |
| `L.sysMsgs` | array | `[]` | lcSys/lcWarn/lcError/lcDebug | lcConsumeMsgs, Output |
| `L.characters` | object | `{}` | updateCharacterActivity | все движки |
| `L.worldInfoIds` | string[] | `[]` | createStoryCard | /cards, /del |
| `L.pinnedWorldInfoIds` | string[] | `[]` | /pin | /unpin, composeContextOverlay |
| `L.aliases` | object | `{}` | /alias | getAliasMap, updateCharacterActivity |
| `L.lastRecapTurn` | number | `0` | Output (рекап) | Recap System |
| `L.lastEpochTurn` | number | `0` | Output (эпоха) | Recap System |
| `L.recapDraft` | object\|null | `null` | Output | /continue |
| `L.epochDraft` | object\|null | `null` | Output | /continue |
| `L.recapMuteUntil` | number | `0` | /нет, /позже | checkRecapOfferV2 |
| `L.events` | array | `[]` | analyzeTextForEvents | computeRecapScore |
| `L.tm` | object | `{}` | различные | /stats |
| `L.tm.recapTurns` | array | `[]` | Output | checkAutoEpoch |
| `L.tm.echoCacheHits` | number | `0` | Anti-Echo | /antiecho stats |
| `L.evergreen` | object | `{enabled,relations,status,obligations,facts,history,lastUpdate}` | EvergreenEngine | composeContextOverlay |
| `L.evergreen.history` | array | `[]` | EvergreenEngine | /evhist |
| `L.goals` | object | `{}` | GoalsEngine | composeContextOverlay |
| `L.character_status` | object | `{}` | MoodEngine | composeContextOverlay |
| `L.secrets` | array | `[]` | /secret | composeContextOverlay (KnowledgeEngine) |
| `L.time` | object | `{currentDay:1,dayName:'Понедельник',timeOfDay:'Утро',...}` | TimeEngine | composeContextOverlay, LivingWorld |
| `L.environment` | object | `{weather:'clear',location:'',ambiance:''}` | EnvironmentEngine | /weather, /location |
| `L.rumors` | array | `[]` | GossipEngine | /rumor, GossipGC |
| `L.population` | object | `{unnamedStudents:50,unnamedTeachers:5}` | lcInit | DemographicPressure |
| `L.society` | object | `{norms:{},myths:[]}` | NormsEngine, MemoryEngine | NormsEngine, composeContextOverlay |
| `L.society.norms` | object | `{}` | NormsEngine | NormsEngine.getNormStrength |
| `L.society.myths` | array | `[]` | MemoryEngine, Crucible | MemoryEngine, composeContextOverlay |
| `L.lore` | object | `{entries:[],archive:[],stats:{},coolDown:0}` | LoreEngine | LoreEngine, composeContextOverlay |
| `L.academics` | object | `{grades:{}}` | AcademicsEngine | GoalsEngine |
| `L.evergreenHistoryCap` | number | `400` | /evhist | capEvergreenHistory |
| `L.visibleNotice` | string | `""` | pushNotice | consumeNotices, Output |
| `L._cmdSysSeq` | number | `0` | Input (stamp) | Output (дедупликация) |
| `L._cmdSysSeen` | object | `undefined` | Output | Output |
| `L.currentScene` | string | `undefined` | SceneDetectionEngine | — |
| `L.__currentEventInfo` | object | `undefined` | UnifiedAnalyzer | LoreEngine (dramaticMultiplier) |

---

## 6. Расхождения: документация (v17.0/engines/) vs код v16.0.8

| Элемент | В документации v17.0 | В коде v16.0.8 | Примечание |
|---------|---------------------|----------------|------------|
| `LC.CrucibleEngine` | `CrucibleEngine_2.0.md` — описывает CrucibleEngine | `LC.Crucible` (строка 7328) | В коде имя `Crucible`, не `CrucibleEngine` |
| `NPC_Autonomy.md` | Описывает автономию NPC как отдельную систему | `LC.LivingWorld` (строка 6474) | В коде это `LivingWorld.runOffScreenCycle()` |
| `Social_Architecture.md` | Описывает социальную архитектуру целиком | `NormsEngine` + `HierarchyEngine` + `MemoryEngine` | В коде — 3 отдельных движка |
| `Social_Engine.md` | Описывает единый SocialEngine | Нет `LC.SocialEngine` | В коде это `NormsEngine` + `HierarchyEngine` |
| `The_Interpretation_Layer.md` | Слой интерпретации | `LC.InformationEngine` (строка 4569) | Название в документации не совпадает с кодом |
| `KnowledgeEngine.md` | Описывает полную систему знаний | `LC.KnowledgeEngine` (строка 4784) — минимальный | В v17 спецификация значительно шире |
| `Character_Evolution_Engine.md` | Эволюция персонажей | `LC.Crucible` (строка 7328) | Та же система, другое имя |
| `Qualia_Engine.md` | Описывает Qualia Engine | `LC.QualiaEngine` (строка 7657) | В коде соответствует документации |
| `Event_Detection_System` | Система обнаружения событий | `analyzeTextForEvents()` (строка ~8997 Library) | В коде — функция, не отдельный движок |
| `Information_Access_Levels.md` | Уровни доступа к информации | `L.playerInfoLevel` + Output filtering | В коде — простой фильтр 'director'/'character' |
| `Context_Caching.md` | Кэширование контекста | `LC._contextCache` + `L.stateVersion` | В коде реализовано как описано |
| `Defensive_Programming.md` | Защитное программирование | Context.js: Hardening Protocol | В коде — forced rebuild при retry/continue |
| `Future_Enhancements.md` | Будущие улучшения | — | Не реализованы в v16.0.8 |
| `Automatic_Goal_Tracking_System.md` | Система целей | `LC.GoalsEngine` (строка 3540) | Соответствует |
| `Unified_Analysis_Pipeline.md` | Конвейер анализа | `LC.UnifiedAnalyzer` (строка 3149) | Соответствует |
| `GossipEngine.md` | Система слухов | `LC.GossipEngine` (строка 5250) | Соответствует |
| `MoodEngine.md` | Настроения | `LC.MoodEngine` (строка 4825) | Соответствует |
| `EnvironmentEngine.md` | Окружение | `LC.EnvironmentEngine` (строка 5119) | Соответствует |
| `TimeEngine.md` | Время | `LC.TimeEngine` (строка 6348) + `LC.ChronologicalKnowledgeBase` (строка 5763) | Соответствует |

---

*Документ создан 2026-04-03 на основе прямого анализа исходного кода v16.0.8.*
