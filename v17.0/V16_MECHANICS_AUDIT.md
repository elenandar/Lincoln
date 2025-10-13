# V16_MECHANICS_AUDIT.md

**Версия системы:** v16.0.8-compat6d  
**Дата анализа:** 13 октября 2025  
**Цель:** Полное документирование всех систем, движков и механик v16.0.8 для фундамента разработки v17

---

## Содержание

1. [Основные движки (Macro-Systems)](#основные-движки-macro-systems)
2. [Системы симуляции мира (World Simulation)](#системы-симуляции-мира-world-simulation)
3. [Социальные механики (Social Mechanics)](#социальные-механики-social-mechanics)
4. [Системы сознания (Consciousness Systems)](#системы-сознания-consciousness-systems)
5. [Вспомогательные утилиты (Auxiliary Utilities)](#вспомогательные-утилиты-auxiliary-utilities)
6. [Механики стабильности и безопасности (Stability & Security)](#механики-стабильности-и-безопасности-stability--security)
7. [Оптимизация и производительность (Performance)](#оптимизация-и-производительность-performance)
8. [Управление состоянием (State Management)](#управление-состоянием-state-management)
9. [Архитектура и интеграция (Architecture)](#архитектура-и-интеграция-architecture)

---

## Основные движки (Macro-Systems)

### 1. EvergreenEngine — Долговременная память

**Назначение:** Извлечение и сохранение фактов, статусов, отношений и обязательств из повествования.

**Ключевые функции:**
- `EvergreenEngine._buildPatterns()` — построение regex-паттернов для извлечения данных (факты, отношения, статусы, обязательства, цели)
- `EvergreenEngine.analyze(text, source)` — анализ текста и сохранение извлеченных данных
- `EvergreenEngine.normalizeCharName(name)` — нормализация имен персонажей через aliases
- `EvergreenEngine.isImportantCharacter(name)` — проверка важности персонажа
- `EvergreenEngine.toggle(enabled)` — включение/отключение системы
- `EvergreenEngine.clear()` — очистка хранилища
- `EvergreenEngine.limitCategories(L)` — ограничение размера категорий (защита от переполнения)

**Категории данных:**
- **Relations** — отношения между персонажами (паттерны: "X и Y теперь вместе", "X любит Y")
- **Status** — изменения статуса ("X теперь Y", "X стал Y")
- **Obligations** — обязательства ("X должен Y", "X обещал Y")
- **Facts** — явные факты ("важно:", "запомни:", "факт:")
- **Goals** — цели персонажей (обрабатывается GoalsEngine)

**Интеграция:** 
- Вызывается из `UnifiedAnalyzer`
- Данные используются в `composeContextOverlay` для построения контекста
- Поддерживает как Unicode (\p{L}), так и fallback ASCII паттерны

---

### 2. GoalsEngine — Отслеживание целей персонажей

**Назначение:** Автоматическое обнаружение и трекинг целей персонажей с планами достижения.

**Ключевые функции:**
- `GoalsEngine.analyze(text, actionType)` — извлечение целей из текста
- `GoalsEngine.generateBasicPlan(goalText)` — генерация базового плана из 3 шагов
- `GoalsEngine.updateGoalStatus(character, goalText, newStatus)` — обновление статуса цели
- `GoalsEngine.getActiveGoals(character)` — получение активных целей персонажа

**Паттерны обнаружения:**
- Явные цели: "цель X:", "X хочет...", "X решил..."
- Социальные цели: "подружиться с", "произвести впечатление", "отомстить"
- Академические: "исправить оценки", "победа в...", "получить отлично"
- Расследования: "выяснить", "докопаться до истины", "разузнать"

**Структура цели:**
```javascript
{
  character: "Максим",
  text: "выяснить правду о директоре",
  status: "active|completed|failed",
  turnCreated: 42,
  plan: ["шаг 1", "шаг 2", "шаг 3"],
  planProgress: 0
}
```

**Особенности:**
- Автоматическая генерация плана из 3 шагов
- Инкремент `L.stateVersion` при изменениях
- Фильтрация по важным персонажам

---

### 3. MoodEngine — Система настроений персонажей

**Назначение:** Обнаружение и трекинг эмоциональных состояний персонажей с экспирацией.

**Ключевые функции:**
- `MoodEngine.analyze(text)` — детекция настроений из текста
- Обработка специальных событий (public_accusation, public_humiliation)
- Интеграция с `QualiaEngine` для прямых изменений феноменального состояния

**Обнаруживаемые настроения:**
- angry (злой/разозлился)
- happy (счастливый/обрадовался)
- scared (испуганный/боится)
- tired (уставший/устал)
- sad (грустный/грустит)
- wounded (раненый/ранен)
- embarrassed (смущенный)
- offended (обиженный)

**Структура:**
```javascript
L.character_status[name] = {
  mood: "angry",
  reason: "был_оскорблен",
  expires: turn + 5
}
```

**Особенности:**
- Автоматическая экспирация через N ходов
- Интеграция с QualiaEngine для жертв публичных обвинений
- Применяет прямые изменения qualia_state при сильных событиях

---

### 4. RelationsEngine — Управление отношениями

**Назначение:** Трекинг и обновление отношений между персонажами с субъективной интерпретацией.

**Ключевые функции:**
- `RelationsEngine.updateRelation(from, to, modifier, options)` — обновление отношения
- `RelationsEngine.getRelation(from, to)` — получение значения отношения
- `RelationsEngine.analyze(text)` — автоматический анализ событий
- `RelationsEngine.ensureSymmetry()` — обеспечение двусторонности отношений

**Ключевые паттерны:**
- Обнаружение социальных действий (поцелуй, удар, предательство, защита)
- Использование InformationEngine для субъективной интерпретации
- Уведомление CrucibleEngine об изменениях отношений
- Интеграция с QualiaEngine для телесных ощущений

**Шкала отношений:** -100 (ненависть) до +100 (любовь)

**Модификаторы:**
```javascript
RELATIONSHIP_MODIFIERS = {
  support: 8,
  help: 10,
  praise: 5,
  insult: -12,
  betray: -40,
  defend: 15
}
```

---

### 5. InformationEngine — Субъективная реальность

**Назначение:** Интерпретация событий через призму феноменального состояния персонажа (qualia_state).

**Ключевые функции:**
- `InformationEngine.interpret(character, event)` — субъективная интерпретация события
- `InformationEngine.updatePerception(observer, subject, interpretation)` — обновление восприятия
- `InformationEngine._findRelevantLegend(event)` — поиск релевантной легенды для усиления эмоций

**Механика:**
- Одно событие → разные интерпретации в зависимости от qualia_state
- Высокая valence (приятно) → интерпретация комплиментов как искренних
- Низкая valence (неприятно) → интерпретация как саркастичных
- Легенды усиливают эмоциональные реакции на похожие события (до +30%)

**Структура восприятия:**
```javascript
character.perceptions[otherName] = {
  trust: 50,      // 0-100
  respect: 50,    // 0-100
  competence: 50  // 0-100
}
```

**Интеграция:** Genesis Phase 2 — легенды влияют на интерпретацию событий.

---

### 6. KnowledgeEngine — Система секретов

**Назначение:** Управление секретами и фокусировкой сцены для дозированного раскрытия информации.

**Ключевые функции:**
- `KnowledgeEngine.addSecret(secretText, knownBy, importance)` — добавление секрета
- `KnowledgeEngine.setSceneFocus(characters)` — установка фокуса сцены
- `KnowledgeEngine.getVisibleSecrets()` — получение видимых секретов
- `KnowledgeEngine.revealSecret(secretId, character)` — раскрытие секрета персонажу

**Команда:** `/secret <важность> <кто знает> :: <текст секрета>`

**Структура:**
```javascript
{
  id: "secret_123",
  text: "Директор подделал документы",
  knownBy: ["Максим"],
  importance: "high",
  revealed: false,
  turnCreated: 15
}
```

**Уровни важности:** low, medium, high, critical

---

### 7. TimeEngine — Система внутриигрового времени

**Назначение:** Отслеживание календарного времени и обработка временных скачков.

**Ключевые функции:**
- `TimeEngine.advance(steps, unit)` — продвижение времени (hours, days, weeks)
- `TimeEngine.getTimeString()` — форматированная строка времени
- `TimeEngine.processSemanticAction(action)` — обработка семантических действий
- Интеграция с `ChronologicalKnowledgeBase` (CKB)

**Паттерны обнаружения:**
- BREAKFAST, LUNCH, DINNER — привязка к времени суток
- SHORT_TIME_JUMP — "час спустя", "через несколько часов"
- NEXT_DAY — "на следующий день"
- WEEK_JUMP — "прошла неделя"
- MORNING, EVENING, NIGHT — время суток
- PARTY, TRAINING, DATE — контекстуальные события

**Структура:**
```javascript
L.time = {
  day: 1,
  timeOfDay: "Утро|День|Вечер|Ночь",
  monthDay: 15,
  monthName: "Сентябрь"
}
```

---

### 8. EnvironmentEngine — Симуляция окружения

**Назначение:** Отслеживание локаций и погоды с влиянием на настроения.

**Ключевые функции:**
- `EnvironmentEngine.detectLocation(text)` — обнаружение смены локации
- `EnvironmentEngine.changeWeather(newWeather, silent)` — изменение погоды
- `EnvironmentEngine.applyWeatherMoodEffects(weather)` — применение эффектов погоды
- `EnvironmentEngine.analyze(text)` — автоматический анализ

**Локации:** classroom, cafeteria, gym, library, hallway, schoolyard, park, home, street

**Погода:** clear, rain, snow, storm, fog, cloudy

**Механика:**
- 20% шанс влияния погоды на настроения
- Дождь → melancholic, Гроза → anxious, Ясно → cheerful

---

### 9. GossipEngine — Система слухов

**Назначение:** Автоматическое создание, распространение и искажение слухов.

**Ключевые функции:**
- `GossipEngine.analyze(text)` — обнаружение событий достойных слухов
- `GossipEngine.createRumor(event, witnesses)` — создание слуха
- `GossipEngine.Propagator.spreadRumor(rumorId, from, to)` — распространение
- `GossipEngine.addDistortion(rumor, witness)` — добавление искажений
- `GossipEngine.runGarbageCollection()` — очистка старых слухов

**Типы событий:**
- betrayal, fight, romance, scandal, achievement
- academic_failure, teacher_meeting, truancy

**Структура слуха:**
```javascript
{
  id: "rumor_123",
  subject: "Максим",
  text: "предал друзей",
  type: "betrayal",
  spin: "negative|neutral|positive",
  distortion: 0.0,
  knownBy: ["Хлоя", "Софи"],
  status: "FORMING|ACTIVE|FADING",
  lifespan: 10,
  turnCreated: 42
}
```

**Механика искажений:**
- Зависит от отношений свидетеля к субъекту
- Leaders распространяют слухи эффективнее (credibilityMultiplier = 1.5)
- Outcasts менее достоверны (credibilityMultiplier = 0.2)
- Каждое распространение может добавить искажение

---

## Системы симуляции мира (World Simulation)

### 10. HierarchyEngine — Социальная иерархия

**Назначение:** Динамическая социальная структура на основе капитала и репутации.

**Ключевые функции:**
- `HierarchyEngine.recalculateStatus()` — пересчет социальных статусов
- `HierarchyEngine.updateCapital(character, eventData)` — обновление капитала
- `HierarchyEngine.applyReputationShock(participants, eventType, multiplier)` — мгновенный эффект драмы
- `HierarchyEngine._getAverageWitnessRespect(character)` — расчет репутации через восприятия

**Социальные статусы:**
- **leader** — капитал > 100
- **respected** — капитал 50-100
- **neutral** — капитал 10-50
- **outcast** — капитал < 10

**Модификаторы капитала:**
- NORM_VIOLATION: -10 до -30 (зависит от силы нормы)
- NORM_CONFORMITY: +5 * normStrength
- POSITIVE_ACTION: +8 (модифицируется репутацией)
- NEGATIVE_ACTION: -5 (модифицируется доверием)
- Репутационный шок: ±20 при драматических событиях (multiplier > 10)

**Новация v16:** Использование InformationEngine для расчета капитала через субъективные восприятия.

---

### 11. SocialEngine — Нормы и конформизм

**Назначение:** Эволюция социальных норм и отслеживание конформизма.

**Ключевые функции:**
- `SocialEngine.detectNormViolation(text)` — обнаружение нарушений норм
- `SocialEngine.strengthenNorm(normType, amount)` — усиление нормы
- `SocialEngine.getNormStrength(normType)` — получение силы нормы
- Интеграция с MemoryEngine для усиления норм через мифы

**Типы норм:**
- respect, honesty, loyalty, academic_integrity, punctuality

**Механика:**
- Начальная сила: 0.5
- Нарушение → усиление нормы (+0.1)
- Мифы усиливают нормы (getMythStrengthForTheme)
- Влияет на расчет социального капитала

---

### 12. MemoryEngine — Мифологизация памяти

**Назначение:** Превращение архивных событий в коллективные мифы.

**Ключевые функции:**
- `MemoryEngine.runMythologization()` — создание мифов из событий
- `MemoryEngine.archiveFormativeEvent(eventData, character)` — архивация важных событий
- `MemoryEngine.getDominantMyth()` — получение доминирующего мифа
- `MemoryEngine.getMythStrengthForTheme(theme)` — сила мифов по теме

**Критерии формирования мифов:**
- Событие старше 20 ходов
- Экстремальные изменения отношений (>80 points)
- Завершение значимых целей
- Первый лидер в обществе

**Структура мифа:**
```javascript
{
  type: "myth",
  theme: "betrayal|loyalty|rise_to_power",
  hero: "Максим",
  moral: "Never trust appearances",
  strength: 0.8,
  createdTurn: 100,
  originalTurn: 80
}
```

**Эффекты:**
- Усиливают социальные нормы
- Калибруют новых персонажей
- Доминирующий миф → "zeitgeist" общества

---

### 13. LoreEngine — Школьные легенды

**Назначение:** Автоматическая кристаллизация значимых событий в культурные артефакты.

**Ключевые функции:**
- `LoreEngine.observe(text)` — наблюдение за событиями
- `LoreEngine.calculateLorePotential(event)` — расчет потенциала легенды (4 фильтра)
- `LoreEngine.crystallize(event)` — создание легенды
- `LoreEngine.getRecentLegends(count)` — получение недавних легенд

**4-этапная фильтрация:**
1. **Base Potential** — драматичность события (dramaticMultiplier)
2. **Witness Amplification** — количество свидетелей
3. **Archetype Resonance** — соответствие архетипу (betrayal, sacrifice, triumph)
4. **Social Context** — социальный статус участников

**Порог легенды:** BASE_THRESHOLD = 75

**Типы легенд:**
- public_humiliation, betrayal, loyalty_rescue, academic_triumph
- first_romance, epic_conflict

**Cooldown:** 200 ходов между легендами (предотвращает спам)

---

### 14. AcademicsEngine — Академические усилия

**Назначение:** Отслеживание академической активности персонажей.

**Ключевые функции:**
- `AcademicsEngine.trackEffort(character, subject, effort)` — трекинг усилий
- `AcademicsEngine.getEffort(character, subject)` — получение уровня усилий
- `AcademicsEngine.analyze(text)` — автоматический анализ

**Предметы:** chemistry, math, literature, history, physics

**Структура:**
```javascript
L.academics[character][subject] = {
  effort: 0.7,      // 0.0-1.0
  lastUpdate: turn
}
```

**Интеграция:**
- Используется GoalsEngine для академических целей
- Влияет на создание легенд (academic_triumph)

---

## Системы сознания (Consciousness Systems)

### 15. QualiaEngine — Феноменальное ядро (Уровень 1)

**Назначение:** Симуляция сырых телесных ощущений — базовый слой сознания.

**Ключевые функции:**
- `QualiaEngine.resonate(character, event)` — трансляция событий в ощущения
- `QualiaEngine.runGroupResonance(characterNames, convergenceRate)` — эмоциональная контагиозность

**Квалиа-состояние:**
```javascript
character.qualia_state = {
  somatic_tension: 0.3,    // Телесное напряжение (0-1)
  valence: 0.5,            // Приятно/неприятно (0-1)
  focus_aperture: 0.7,     // Фокус внимания (0-1)
  energy_level: 0.8        // Уровень энергии (0-1)
}
```

**Механика:**
- Комплименты → valence↑, tension↓
- Оскорбления → valence↓, tension↑
- Угрозы → valence↓, tension↑, focus↓
- Успех → valence↑, energy↑

**Групповой резонанс:**
- Персонажи в одной локации синхронизируют состояния
- Создает "атмосферу" в помещении
- convergenceRate = 0.1 (по умолчанию)

**Философия:** Qualia → базовый слой, который окрашивает все последующие процессы.

---

### 16. CrucibleEngine — Формирование личности (Уровень 3)

**Назначение:** Эволюция характера через опыт и создание self-concept (Я-концепции).

**Ключевые функции:**
- `CrucibleEngine.analyzeEvent(eventData)` — анализ события для эволюции
- `CrucibleEngine._handleRelationChange(character, eventData)` — обработка изменений отношений
- `CrucibleEngine._handleRumorSpread(character, eventData)` — влияние слухов на самовосприятие
- `CrucibleEngine._shouldArchiveEvent(eventData)` — определение формирующих событий

**Self-Concept (Я-концепция):**
```javascript
character.self_concept = {
  perceived_trust: 0.7,      // Как персонаж себя видит
  perceived_bravery: 0.6,
  perceived_idealism: 0.5,
  perceived_aggression: 0.3
}
```

**Механика:**
- Объективная личность (personality) vs Субъективное самовосприятие (self_concept)
- Публичное унижение → self_concept.trust ↓↓ сильнее, чем personality.trust ↓
- Предательство → aggression↑, trust↓
- Экстремальные изменения отношений → архивация в formative_events

**Интеграция:** Уведомляет MemoryEngine о формирующих событиях для мифологизации.

---

## Социальные механики (Social Mechanics)

### 17. DemographicPressure — Демографическое давление

**Назначение:** Автоматическое введение новых персонажей при недостатке активных.

**Ключевые функции:**
- `DemographicPressure.evaluate()` — оценка необходимости новых персонажей
- `DemographicPressure.introduceCharacter(character)` — введение нового персонажа
- `DemographicPressure.calibrateToZeitgeist(character)` — калибровка под текущий "дух времени"

**Критерии введения:**
- Менее 3 активных персонажей
- Или 50% от L.population.size
- Cooldown: 50 ходов между введениями

**Калибровка:**
- Использует доминирующий миф для настройки личности
- Миф "betrayal" → новый персонаж с низким trust
- Миф "loyalty" → новый персонаж с высоким trust

---

### 18. ChronologicalKnowledgeBase (CKB) — Хронологическая база

**Назначение:** Привязка знаний к конкретным временным моментам.

**Ключевые функции:**
- `CKB.addKnowledge(text, source, importance)` — добавление знания
- `CKB.getRecentKnowledge(limit)` — получение недавних знаний
- `CKB.getKnowledgeAtTime(day, timeOfDay)` — знания на определенный момент

**Структура:**
```javascript
{
  id: "ckb_123",
  text: "Директор проводит собрание",
  source: "output",
  importance: "medium",
  turn: 42,
  time: { day: 5, timeOfDay: "День" }
}
```

**Интеграция:** Используется TimeEngine для связи событий с временем.

---

## Вспомогательные утилиты (Auxiliary Utilities)

### 19. LC.Tools — Утилиты безопасности

**Назначение:** Защита от ReDoS и других уязвимостей.

**Ключевые функции:**
- `LC.Tools.safeRegexMatch(text, regex, timeout)` — безопасное выполнение regex с таймаутом
- Защита от катастрофической обратной трассировки
- Timeout по умолчанию: 100ms

**Механика:**
```javascript
// Без защиты:
const match = regex.exec(text); // Может зависнуть

// С защитой:
const match = LC.Tools.safeRegexMatch(text, regex, 100);
if (!match) {
  // Regex не выполнился или таймаут
}
```

---

### 20. LC.Utils — Вспомогательные функции

**Назначение:** Общие утилиты для обработки событий и данных.

**Ключевые функции:**
- `LC.Utils.getEventDramaticMultiplier(event)` — расчет драматичности события
- Вспомогательные функции для обработки текста

---

### 21. LC.Flags — Фасад совместимости

**Назначение:** Поддержка старого API флагов для совместимости.

**Ключевые функции:**
- `LC.Flags.clearCmd(preserveCycle)` — очистка команд
- `LC.Flags.setCmd()` — установка режима команды
- `LC.Flags.queueRecap()` — запрос recap
- `LC.Flags.queueEpoch()` — запрос epoch

**Миграция:** Старые флаги → currentAction объект

---

### 22. LC.Drafts — Управление черновиками

**Назначение:** Обработка recap и epoch черновиков.

**Ключевые функции:**
- `LC.Drafts.applyPending(L, source)` — применение ожидающего черновика
- `LC.applyRecapDraft(L)` — применение recap черновика
- `LC.applyEpochDraft(L)` — применение epoch черновика

---

### 23. LC.Turns — Управление ходами

**Назначение:** Управление счетчиком ходов и откаты.

**Ключевые функции:**
- `LC.Turns.incIfNeeded(L)` — инкремент хода при необходимости
- `turnSet(n)` — установка хода
- `turnUndo(n)` — откат на N ходов

**Логика инкремента:**
- +1 на story input и UI Continue
- +0 на команды и retries

---

### 24. LC.CommandsRegistry — Реестр команд

**Назначение:** Централизованный реестр всех слэш-команд.

**Доступные команды:**
- `/ui on|off` — переключение UI сообщений
- `/debug on|off` — режим отладки
- `/mode director|character` — уровень информации
- `/recap` — создание recap черновика
- `/epoch` — создание epoch черновика
- `/continue` — принятие черновика
- `/evergreen on|off|clear|summary|set` — управление Evergreen
- `/time <день> <время_суток>` — установка времени
- `/weather <погода>` — изменение погоды
- `/secret <важность> <кто_знает> :: <текст>` — добавление секрета
- `/focus <персонажи>` — фокус сцены
- `/rumor <от> <кому> <id_слуха>` — распространение слуха
- `/character <имя> <действие>` — управление персонажами

---

## Механики стабильности и безопасности (Stability & Security)

### 25. Механика безопасности регулярных выражений

**Назначение:** Предотвращение зависаний из-за сложных regex (ReDoS).

**Ключевые функции:**
- `LC.Tools.safeRegexMatch` — выполнение с таймаутом

**Защищенные области:**
- EvergreenEngine patterns
- GoalsEngine patterns
- MoodEngine patterns
- Все пользовательские regex

---

### 26. Механика ограничения роста данных

**Назначение:** Предотвращение переполнения памяти.

**Ключевые функции:**
- `LC.EvergreenEngine.limitCategories(L)` — ограничение Evergreen категорий
- `LC.ensureEventsCap(cap)` — ограничение массива событий
- `GossipEngine.runGarbageCollection()` — очистка старых слухов
- `MemoryEngine._pruneMythsIfNeeded()` — обрезка мифов

**Лимиты:**
- EVERGREEN_HISTORY_CAP: 400
- RUMOR_HARD_CAP: 150
- MAX_MYTHS: 20
- Events cap: конфигурируемо

---

### 27. Механика валидации типов

**Назначение:** Безопасное преобразование типов.

**Утилиты:**
- `toNum(x, default)` — безопасное преобразование в число
- `toStr(x)` — безопасное преобразование в строку
- `toBool(x, default)` — безопасное преобразование в boolean

---

### 28. Механика обработки ошибок

**Назначение:** Graceful degradation при ошибках.

**Паттерн:**
```javascript
try {
  // Потенциально опасная операция
} catch(e) {
  LC.lcWarn?.(`Engine error: ${e && e.message}`);
  // Продолжить работу
}
```

**Защищенные области:**
- Все Engine.analyze() методы
- Regex операции
- JSON парсинг
- State access

---

## Оптимизация и производительность (Performance)

### 29. UnifiedAnalyzer — Единый конвейер анализа

**Назначение:** Координация всех движков в один проход для оптимизации.

**Ключевые функции:**
- `LC.UnifiedAnalyzer.collectPatterns()` — сбор паттернов от всех движков
- `LC.UnifiedAnalyzer.analyzeText(text, actionType)` — единый анализ

**Координируемые движки:**
1. TimeEngine
2. EvergreenEngine
3. GoalsEngine
4. MoodEngine
5. EnvironmentEngine
6. GossipEngine
7. RelationsEngine
8. HierarchyEngine (опционально для драматических событий)
9. LoreEngine (последним)

**Преимущества:**
- Один проход по тексту
- Централизованная обработка ошибок
- Единая нормализация текста

---

### 30. State Versioning — Версионирование состояния

**Назначение:** Отслеживание изменений состояния для инвалидации кэша.

**Механика:**
```javascript
L.stateVersion = 0; // Инициализация

// При изменении состояния:
L.goals[key] = newGoal;
L.stateVersion++; // Инкремент
```

**Использование:**
- Инкремент при любом изменении L.goals, L.character_status, L.relations и т.д.
- Проверка в `composeContextOverlay` для кэширования

---

### 31. Context Caching — Кэширование контекста

**Назначение:** Избежание пересборки контекста при неизменном состоянии.

**Ключевые функции:**
- `LC.composeContextOverlay(options)` — сборка с кэшированием
- `LC._contextCache` — хранилище кэша

**Механика:**
```javascript
const cacheKey = `ctx_${options.limit}`;
const cached = LC._contextCache[cacheKey];

if (cached && cached.stateVersion === L.stateVersion) {
  return cached.result; // Cache hit
}

// Cache miss - rebuild
const result = buildContext(options);
LC._contextCache[cacheKey] = {
  stateVersion: L.stateVersion,
  result: result
};
```

**Инвалидация:** Автоматическая при L.stateVersion++

---

### 32. Norm Cache — Кэширование нормализации

**Назначение:** Кэширование результатов _normU для ускорения.

**Ключевые функции:**
- `LC._normUCached(s)` — нормализация с кэшированием
- `__NU_CACHE` — глобальный Map кэш

**Особенности:**
- Opt-in: CONFIG.FEATURES.USE_NORM_CACHE = true
- LRU eviction при размере > 64
- Значительное ускорение на повторяющихся строках

---

## Управление состоянием (State Management)

### 33. lcInit — Централизованная инициализация

**Назначение:** Единая точка доступа к состоянию с lazy initialization.

**Функция:**
```javascript
LC.lcInit = function() {
  const L = state?.shared?.lincoln;
  if (!L) {
    state.shared = state.shared || {};
    state.shared.lincoln = createInitialState();
  }
  return state.shared.lincoln;
}
```

**Инициализируемые структуры:**
- turn, stateVersion
- currentAction
- evergreen, goals, character_status
- relations, characters, rumors
- time, environment, society
- lore, academics, population

---

### 34. currentAction — Объектная модель действий

**Назначение:** Замена флагов на структурированный объект.

**Структура:**
```javascript
L.currentAction = {
  type: "story|command|retry|continue",
  task: "recap|epoch",              // опционально
  name: "/continue",                 // для команд
  __cmdCyclePending: true            // внутренний флаг
}
```

**Преимущества:**
- Атомарность
- Расширяемость
- Четкая семантика

---

### 35. State Migration — Миграция состояния

**Назначение:** Обновление структуры состояния между версиями.

**Ключевые функции:**
- `LC.migrateState(L)` — общая миграция
- `LC.migrateToVersion(L, fromV, toV)` — миграция между версиями

**Гарантии:**
- Backward compatibility
- Graceful degradation
- Сохранение данных

---

## Архитектура и интеграция (Architecture)

### 36. Четырехуровневая модель сознания

**Философия:** Lincoln моделирует сознание как каскад из 4 уровней.

```
Событие → [1. Феноменология] → Ощущение
         ↓
         [2. Психология] → Интерпретация
         ↓
         [3. Личность] → Я-концепция/Характер
         ↓
         [4. Социология] → Действие в обществе
         ↓
         Обратная связь → Событие
```

**Уровень 1 (QualiaEngine):** Сырые телесные ощущения  
**Уровень 2 (InformationEngine):** Интерпретация ощущений в смыслы  
**Уровень 3 (CrucibleEngine):** Формирование характера  
**Уровень 4 (Social/Memory Engines):** Социальный капитал и мифы

---

### 37. Каскадная интеграция движков

**Порядок обработки в UnifiedAnalyzer:**

1. **TimeEngine** — обработка временных паттернов
2. **EvergreenEngine** — извлечение фактов, отношений, статусов
3. **GoalsEngine** — обнаружение целей
4. **MoodEngine** — детекция настроений + QualiaEngine для сильных событий
5. **EnvironmentEngine** — локации и погода
6. **GossipEngine** — создание слухов
7. **RelationsEngine** — обновление отношений + InformationEngine для интерпретации
8. **HierarchyEngine** (conditional) — репутационный шок при драматических событиях
9. **LoreEngine** — кристаллизация легенд (последним)

---

### 38. Интеграционные точки между системами

**QualiaEngine ↔ InformationEngine:**
- Qualia влияет на интерпретацию событий
- Интерпретация может изменить qualia (обратная связь)

**InformationEngine ↔ HierarchyEngine:**
- Социальный капитал считается через субъективные восприятия
- Репутация = агрегация восприятий свидетелей

**CrucibleEngine ↔ MemoryEngine:**
- Crucible архивирует формирующие события
- Memory превращает архив в мифы через 20+ ходов

**LoreEngine ↔ InformationEngine:**
- Легенды усиливают эмоциональные реакции на схожие события (Genesis Phase 2)

**GossipEngine ↔ HierarchyEngine:**
- Слухи используют социальный статус для credibility
- Leaders распространяют слухи эффективнее

**TimeEngine ↔ ChronologicalKnowledgeBase:**
- Привязка знаний к временным моментам
- Семантические временные действия

---

### 39. Конфигурация системы

**CONFIG структура:**
```javascript
LC.CONFIG = {
  LIMITS: {
    CONTEXT_LENGTH: 800,
    ANTI_ECHO: { CACHE_MAX: 256, MIN_LENGTH: 200, SOFT_PRUNE_80: true },
    EVERGREEN_HISTORY_CAP: 400,
    RUMOR_HARD_CAP: 150
  },
  CHAR_WINDOW_HOT: 3,
  CHAR_WINDOW_ACTIVE: 10,
  FEATURES: {
    USE_NORM_CACHE: false,
    ANALYZE_RELATIONS: true,
    STRICT_CMD_BYPASS: true
  },
  RELATIONSHIP_MODIFIERS: { ... },
  RECAP_V2: { WEIGHTS: { ... } }
}
```

---

### 40. Модульная структура скриптов

**Library v16.0.8.patched.txt:**
- Все движки и системы
- Утилиты и инструменты
- Инициализация и миграция
- ~9644 строк

**Input v16.0.8.patched.txt:**
- Обработка пользовательского ввода
- Обработка команд
- Определение currentAction
- ~331 строка

**Output v16.0.8.patched.txt:**
- Обработка вывода AI
- Применение UnifiedAnalyzer
- Управление recap/epoch
- ~264 строки

**Context v16.0.8.patched.txt:**
- Сборка контекста для AI
- Вызов composeContextOverlay
- ~86 строк

---

## Итоговая Сводка

### Количественные показатели

**Основные движки:** 9
- EvergreenEngine, GoalsEngine, MoodEngine, RelationsEngine, InformationEngine, KnowledgeEngine, TimeEngine, EnvironmentEngine, GossipEngine

**Системы симуляции мира:** 5
- HierarchyEngine, SocialEngine, MemoryEngine, LoreEngine, AcademicsEngine, DemographicPressure

**Системы сознания:** 2 (ключевые)
- QualiaEngine (феноменология), CrucibleEngine (формирование личности)

**Вспомогательные системы:** 10+
- Tools, Utils, Flags, Drafts, Turns, CommandsRegistry, ChronologicalKnowledgeBase, lcInit, currentAction, State Migration

**Механики стабильности:** 4
- Безопасность regex, Ограничение роста данных, Валидация типов, Обработка ошибок

**Оптимизации:** 4
- UnifiedAnalyzer, State Versioning, Context Caching, Norm Cache

**Всего команд:** 15+

**Всего строк кода:** ~10,325

---

### Ключевые инновации v16

1. **Четырехуровневая модель сознания** — от феноменологии к социологии
2. **Субъективная реальность** — InformationEngine для разных интерпретаций одного события
3. **Я-концепция** — расхождение между объективными чертами и самовосприятием
4. **Легенды и мифы** — двухуровневая система культурной памяти (LoreEngine + MemoryEngine)
5. **Репутация через восприятия** — HierarchyEngine использует InformationEngine
6. **Unified Analysis Pipeline** — один проход для всех движков
7. **State Versioning + Context Caching** — умная инвалидация кэша
8. **Genesis Phase 2** — легенды усиливают эмоциональные реакции

---

### Архитектурные принципы

1. **Модульность** — каждый движок независим и взаимозаменяем
2. **Каскадная интеграция** — движки вызываются в определенном порядке
3. **Defensive coding** — try-catch, валидация типов, ограничения роста
4. **Performance-first** — кэширование, версионирование, unified pipeline
5. **Backward compatibility** — миграция состояния, фасады совместимости
6. **Emergent complexity** — простые правила → сложное поведение

---

### Философское резюме

Lincoln v16 — это не симулятор мира. Это **симулятор множества миров** — по одному для каждого сознания.

Повествование создается не из событий, а из **конфликта между субъективными реальностями**.

Каждый персонаж живет в своей интерпретации событий, окрашенной феноменальным состоянием (qualia), искаженной самовосприятием (self-concept), и формирующей коллективную память (myths & legends).

Это фундамент для v17.

---

**Конец аудита.**
