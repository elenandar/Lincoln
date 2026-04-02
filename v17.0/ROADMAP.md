# PROJECT LINCOLN v17 — ROADMAP

> Статус: Живой документ | Обновляется по мере разработки

---

## Текущий статус

| Компонент | Статус | Примечание |
|-----------|--------|------------|
| Library.txt — state.lincoln init | ✅ DONE | Phase 0 |
| Library.txt — LC object | ✅ DONE | Phase 0 |
| Library.txt — CommandsRegistry | ✅ DONE | Phase 1 (частично) |
| Input.txt — modifier pattern | ✅ DONE | Phase 0 |
| Context.txt — modifier pattern | ✅ DONE | Phase 0 |
| Output.txt — modifier pattern | ✅ DONE | Phase 0 |
| `/ping`, `/help`, `/debug` команды | ✅ DONE | Phase 1 (частично) |
| LC.Tools (#19) | ⬜ NOT STARTED | Phase 1 |
| LC.Utils (#20) | ⬜ NOT STARTED | Phase 1 |
| LC.Flags (#21) | ⬜ NOT STARTED | Phase 1 |
| LC.Drafts (#22) | ⬜ NOT STARTED | Phase 1 |
| LC.Turns (#23) | ⬜ NOT STARTED | Phase 1 |
| currentAction (#34) | ⬜ NOT STARTED | Phase 1 |

**Итого:** Phase 0 — ✅ COMPLETE | Phase 1 — 🚧 IN PROGRESS | Phase 2–8 — ⬜ NOT STARTED

---

## Фазы разработки

### Phase 0: Нулевая система ✅ COMPLETE

**Цель:** Создать пустые, но рабочие скрипты — убедиться, что игра загружается без ошибок.

**Компоненты:** 4 пустых скрипта с правильной структурой `modifier`

**Срок:** 0.5–1 день | **Усилия:** 4–8 часов | **Риск:** Low

**Задачи:**
- [x] `Library.txt` — структура LC object, инициализация `state.lincoln`
- [x] `Input.txt` — паттерн `modifier(text)`, возврат `{ text }`
- [x] `Context.txt` — паттерн `modifier(text)`, возврат `{ text }`
- [x] `Output.txt` — паттерн `modifier(text)`, возврат `{ text }`

**Тесты:**
- [x] `/ping` → `pong`
- [x] Игра загружается без ошибок в консоли
- [x] `state.lincoln` инициализируется корректно

**Критерий успеха:** Игра запускается, скрипты не вызывают ошибок. ✅

---

### Phase 1: Инфраструктура 🚧 IN PROGRESS

**Цель:** Создать базовый каркас для управления состоянием и отладки.

**Системы:** lcInit (#33), currentAction (#34), CommandsRegistry (#24), LC.Tools (#19), LC.Utils (#20), LC.Flags (#21), LC.Drafts (#22), LC.Turns (#23)

**Срок:** 2–3 дня | **Усилия:** 16–24 часа | **Риск:** Low

| Компонент | # | Назначение | Реализация |
|-----------|---|-----------|------------|
| **lcInit** | #33 | Централизованная инициализация | Функция `LC.lcInit()` создаёт структуру `state.lincoln` |
| **currentAction** | #34 | Отслеживание типа действия | Объект `state.lincoln.currentAction` с полем `type` |
| **CommandsRegistry** | #24 | Реестр команд | Plain object `{}` для хранения команд; `Input.txt` парсит `/команда` |
| **LC.Tools** | #19 | Утилиты безопасности | `safeRegexMatch()`, `escapeRegex()`, `safeLog()` |
| **LC.Utils** | #20 | Общие утилиты | `toNum()`, `toStr()`, `toBool()` |
| **LC.Flags** | #21 | Фасад совместимости | Обёртка над `currentAction` |
| **LC.Drafts** | #22 | Управление черновиками | Очередь сообщений для вывода |
| **LC.Turns** | #23 | Управление ходами | Счётчик ходов |

**Задачи:**
- [x] CommandsRegistry — базовая реализация (ES5 plain object)
- [x] `/ping`, `/help`, `/debug` команды
- [ ] LC.Tools (#19) — `safeRegexMatch`, `escapeRegex`, `safeLog`
- [ ] LC.Utils (#20) — `toNum`, `toStr`, `toBool`
- [ ] LC.Flags (#21) — фасад совместимости
- [ ] LC.Drafts (#22) — очередь черновиков
- [ ] LC.Turns (#23) — счётчик ходов
- [ ] currentAction (#34) — отслеживание типа действия
- [ ] lcInit (#33) — финализация централизованной инициализации
- [ ] LC.StoryCards — обёртка над Story Cards API с fallback
- [ ] `/sc avail` — команда проверки доступности Story Cards
- [ ] `/sc add <keys> <type> "<entry>"` — команда добавления
- [ ] `/turn` — показать текущий ход

**Тесты:**
- [ ] `/ping` → `pong`
- [ ] `/debug info` → версия, ход, stateVersion
- [ ] `/debug state` → краткий дамп состояния
- [ ] `/turn` → текущий ход
- [ ] `/sc avail` → статус Story Cards и счётчик fallbackCards
- [ ] `/sc add test story "Test entry"` → добавление карточки или fallback

**Критерий успеха:** Все команды работают, система корректно отслеживает тип действия.

---

### Phase 2: Физический мир ⬜ NOT STARTED

**Цель:** Заложить основы пространства и времени.

**Системы:** TimeEngine (#7), EnvironmentEngine (#8), ChronologicalKnowledgeBase (#18)

**Срок:** 1–2 дня | **Усилия:** 8–16 часов | **Риск:** Low

| Компонент | # | Назначение | Реализация |
|-----------|---|-----------|------------|
| **TimeEngine** | #7 | Внутриигровое время | Структура `state.lincoln.time`, счётчик `state.lincoln.turn` |
| **EnvironmentEngine** | #8 | Локации и погода | Структура `state.lincoln.environment` |
| **ChronologicalKnowledgeBase** | #18 | Временная база знаний | Опционально: события с временными метками |

**Задачи:**
- [ ] TimeEngine (#7) — инкремент `state.lincoln.turn` на каждом ходе
- [ ] TimeEngine — структура `state.lincoln.time` (часы, дни, сезон)
- [ ] EnvironmentEngine (#8) — структура `state.lincoln.environment` (локация, погода)
- [ ] ChronologicalKnowledgeBase (#18) — опциональный компонент
- [ ] `/time` — показать текущее время
- [ ] `/weather set <weather>` — установить погоду
- [ ] `/location set <place>` — установить локацию

**Тесты:**
- [ ] Ход инкрементируется при каждом действии
- [ ] `/time` выводит корректное время
- [ ] `/weather set rain` меняет погоду в `state.lincoln.environment`
- [ ] `state.lincoln.stateVersion` инкрементируется после каждого изменения

**Критерий успеха:** Время течёт (инкремент на каждом ходе), окружение изменяется командами.

---

### Phase 3: Базовые данные ⬜ NOT STARTED

**Цель:** Реализовать системы для хранения фактов и целей.

> ⚠️ **ИЗМЕНЕНИЕ относительно исходного плана:** KnowledgeEngine (#6) **перемещён** в Phase 5.  
> Причина: KnowledgeEngine зависит от `QualiaEngine.focus_aperture` (Phase 4).

**Системы:** EvergreenEngine (#1), GoalsEngine (#2)

**Срок:** 2–3 дня | **Усилия:** 16–24 часа | **Риск:** Medium

| Компонент | # | Назначение | Реализация |
|-----------|---|-----------|------------|
| **EvergreenEngine** | #1 | Долговременная память | Массив `state.lincoln.evergreen` для фактов |
| **GoalsEngine** | #2 | Цели персонажей | Объект `state.lincoln.goals[name]` |

**Задачи:**
- [ ] EvergreenEngine (#1) — добавление/удаление/чтение фактов
- [ ] GoalsEngine (#2) — структура `Goal`, CRUD операции
- [ ] GoalsEngine — обновление `progressStage` и `progressScore`
- [ ] `/fact add "<текст>"` — добавить факт в evergreen
- [ ] `/fact list` — список фактов
- [ ] `/goal add <char> "<title>"` — добавить цель персонажу
- [ ] `/goal list <char>` — список целей персонажа

**Тесты:**
- [ ] Факты сохраняются в `state.lincoln.evergreen`
- [ ] Цели сохраняются в `state.lincoln.goals[name]`
- [ ] Данные персистентны между ходами
- [ ] `stateVersion` инкрементируется при каждой мутации

**Критерий успеха:** Данные сохраняются в `state.lincoln`, доступны для чтения.

---

### Phase 4: Сознание — КРИТИЧЕСКАЯ ФАЗА ⬜ NOT STARTED

> ⚠️ **САМЫЙ ВАЖНЫЙ ЭТАП ВСЕГО ПРОЕКТА**  
> QualiaEngine и InformationEngine реализуются **ПОСЛЕДОВАТЕЛЬНО, БЕЗ ПЕРЕРЫВА**.  
> Не переходить к Phase 5 до полной верификации Phase 4.

**Цель:** Реализовать субъективное восприятие и интерпретацию событий.

**Системы:** QualiaEngine (#15) → InformationEngine (#5)

**Срок:** 2–3 недели | **Усилия:** 80–120 часов | **Риск:** CRITICAL

| Компонент | # | Назначение | Реализация |
|-----------|---|-----------|------------|
| **QualiaEngine** | #15 | Level 1: Phenomenology | `state.lincoln.characters[name].qualia_state` |
| **InformationEngine** | #5 | Level 2: Psychology | `state.lincoln.characters[name].perceptions` |

**Задачи:**
- [ ] QualiaEngine (#15) — структура `qualia_state` (somatic_tension, valence, focus_aperture, energy_level)
- [ ] QualiaEngine — метод `resonate(character, event)`
- [ ] QualiaEngine — методы `getValence`, `getTension`, `getFocus`, `getEnergy`
- [ ] QualiaEngine — зажимы значений [0..1]
- [ ] QualiaEngine — unit-тесты всех методов
- [ ] **[MILESTONE: QualiaEngine верифицирован в игре]**
- [ ] InformationEngine (#5) — метод `interpret(character, event)` (зависит от QualiaEngine.valence)
- [ ] InformationEngine — метод `getPerception(observer, target)`
- [ ] InformationEngine — метод `updatePerception(observer, target, changes)`
- [ ] InformationEngine — структура `perceptions[targetName]` (trust, respect, competence, affection)
- [ ] InformationEngine — unit-тесты всех методов
- [ ] InformationEngine — интеграционные тесты с QualiaEngine
- [ ] `/qualia get <char>` — показать qualia state персонажа
- [ ] `/qualia set <char> <param> <value>` — установить параметр qualia
- [ ] `/perception get <observer> <target>` — показать восприятие

**Тесты:**
- [ ] Два персонажа интерпретируют одно событие по-разному (из-за разного valence)
- [ ] `qualia_state` значения зажаты в [0..1]
- [ ] `perceptions` обновляются и персистентны
- [ ] Edge cases: персонаж без qualia, неизвестный observer/target
- [ ] `stateVersion` инкрементируется при каждой мутации

**Критерий успеха:** Два персонажа интерпретируют одно событие по-разному.  
**Checkpoint:** Milestone M2 (CONSCIOUSNESS OPERATIONAL).

---

### Phase 5: Социальная динамика ⬜ NOT STARTED

**Цель:** Ввести персонажей и симуляцию социальных взаимодействий.

> ⚠️ **Phase 5 включает KnowledgeEngine (#6)**, перемещённый из Phase 3.

**Системы:** MoodEngine (#3), RelationsEngine (#4), CrucibleEngine (#16), KnowledgeEngine (#6)

**Срок:** 3–4 недели | **Усилия:** 120–160 часов | **Риск:** High

| Компонент | # | Назначение | Зависимости |
|-----------|---|-----------|------------|
| **MoodEngine** | #3 | Настроения персонажей | QualiaEngine (функциональная) |
| **RelationsEngine** | #4 | Управление отношениями | InformationEngine (функциональная) |
| **CrucibleEngine** | #16 | Эволюция характера | InformationEngine (функциональная) |
| **KnowledgeEngine** | #6 | Секреты и фокус внимания | QualiaEngine.focus_aperture (функциональная) |

**Задачи:**
- [ ] MoodEngine (#3) — вычисление mood из qualia_state
- [ ] MoodEngine — метки настроений (happy, sad, anxious, energetic, ...)
- [ ] RelationsEngine (#4) — CRUD для `state.lincoln.relations[from][to]`
- [ ] RelationsEngine — интеграция с `InformationEngine.interpret()` (субъективный multiplier)
- [ ] RelationsEngine — зажимы [-100, 100]
- [ ] CrucibleEngine (#16) — структура `self_concept`
- [ ] CrucibleEngine — обнаружение и обработка формирующих событий
- [ ] KnowledgeEngine (#6) — структура `state.lincoln.secrets`
- [ ] KnowledgeEngine — фокус внимания через `focus_aperture`
- [ ] `/relation set <from> <to> <value>` — установить отношение
- [ ] `/mood set <char> <mood>` — установить настроение
- [ ] `/secret add <char> "<text>"` — добавить секрет

**Тесты:**
- [ ] Отношения обновляются с субъективным multiplier из InformationEngine
- [ ] Настроение меняется при изменении qualia
- [ ] Формирующие события изменяют `self_concept`
- [ ] Секреты сохраняются и доступны

**Критерий успеха:** Социальная динамика реагирует на события с учётом субъективных интерпретаций.

---

### Phase 6: Социальная иерархия ⬜ NOT STARTED

**Цель:** Реализовать социальные статусы и слухи.

**Системы:** HierarchyEngine (#10), GossipEngine (#9), SocialEngine (#11)

**Срок:** 2–3 недели | **Усилия:** 80–120 часов | **Риск:** High

| Компонент | # | Назначение | Зависимости |
|-----------|---|-----------|------------|
| **HierarchyEngine** | #10 | Социальная иерархия | InformationEngine.getPerception() (блокирующая инновация v16) |
| **GossipEngine** | #9 | Система слухов | RelationsEngine (функциональная) |
| **SocialEngine** | #11 | Нормы и конформизм | HierarchyEngine (функциональная) |

**Задачи:**
- [ ] HierarchyEngine (#10) — расчёт `status` через `InformationEngine.getPerception()`
- [ ] HierarchyEngine — структура `state.lincoln.hierarchy[name]` (status, capital, last_updated)
- [ ] GossipEngine (#9) — структура `state.lincoln.rumors[]` с credibility
- [ ] GossipEngine — распространение слухов и затухание credibility
- [ ] SocialEngine (#11) — нормы и конформизм (`state.lincoln.society.norms`)
- [ ] `/capital set <char> <value>` — установить социальный капитал
- [ ] `/rumor add "<text>" about <char>` — добавить слух
- [ ] `/status <char>` — показать статус персонажа

**Тесты:**
- [ ] Репутация рассчитывается через субъективные восприятия
- [ ] Слухи распространяются с credibility
- [ ] Статус обновляется при изменении восприятий

**Критерий успеха:** Репутация рассчитывается через субъективные восприятия (ключевая инновация v16).

---

### Phase 7: Культурная память ⬜ NOT STARTED

**Цель:** Ввести высший уровень симуляции — коллективную память и историю.

**Системы:** MemoryEngine (#12), LoreEngine (#13), AcademicsEngine (#14), DemographicPressure (#17)

**Срок:** 2 недели | **Усилия:** 80 часов | **Риск:** Medium

| Компонент | # | Назначение | Зависимости |
|-----------|---|-----------|------------|
| **MemoryEngine** | #12 | Мифологизация памяти | CrucibleEngine (функциональная) |
| **LoreEngine** | #13 | Школьные легенды | MemoryEngine |
| **AcademicsEngine** | #14 | Академическая активность | — |
| **DemographicPressure** | #17 | Введение новых персонажей | QualiaEngine, InformationEngine |

**Задачи:**
- [ ] MemoryEngine (#12) — кристаллизация мифов из formative_events (CrucibleEngine)
- [ ] MemoryEngine — структура `state.lincoln.myths[]`
- [ ] LoreEngine (#13) — структура `state.lincoln.lore[]`
- [ ] LoreEngine — создание легенд из событий
- [ ] AcademicsEngine (#14) — структура `state.lincoln.academics`
- [ ] DemographicPressure (#17) — функция `calibrateToZeitgeist`
- [ ] `/myth add "<text>"` — добавить миф
- [ ] `/lore add "<text>"` — добавить легенду

**Тесты:**
- [ ] Мифы кристаллизуются из архива формирующих событий
- [ ] Легенды создаются из событий
- [ ] Культурная память накапливается и влияет на мир

**Критерий успеха:** Культурная память автоматически формируется из событий.

---

### Phase 8: Оптимизация и интеграция ⬜ NOT STARTED

**Цель:** Координация всех движков и оптимизация производительности.

> ⚠️ **UnifiedAnalyzer (#29) реализуется АБСОЛЮТНО ПОСЛЕДНИМ** — когда все движки готовы.

**Системы:** State Versioning (#30), Context Caching (#31), Norm Cache (#32), UnifiedAnalyzer (#29)

**Срок:** 1–2 недели | **Усилия:** 40–80 часов | **Риск:** Medium

| Компонент | # | Назначение | Зависимости |
|-----------|---|-----------|------------|
| **State Versioning** | #30 | Версионирование состояния | Все движки |
| **Context Caching** | #31 | Кэширование контекста | Context script |
| **Norm Cache** | #32 | Кэширование нормализации | Text processing |
| **UnifiedAnalyzer** | #29 | Единый конвейер анализа | **ВСЕ** движки Phase 1–7 |

**Задачи:**
- [ ] State Versioning (#30) — финализация `stateVersion` механики
- [ ] Context Caching (#31) — кэш для `composeContextOverlay`
- [ ] Norm Cache (#32) — кэш для normalizedText
- [ ] UnifiedAnalyzer (#29) — координатор всех движков в правильном порядке:
  1. Qualia update
  2. Information interpretation
  3. Relations update
  4. Hierarchy recalculation
  5. Mood derivation
  6. Formative event detection
  7. Memory/Lore updates
- [ ] 1000-turn стресс-тест
- [ ] Производительность < 500ms / ход
- [ ] Все регрессионные тесты проходят

**Тесты:**
- [ ] Все 40 систем координируются через единый конвейер
- [ ] 1000-turn endurance test пройден
- [ ] Производительность в норме
- [ ] Нет утечек памяти

**Критерий успеха:** Все движки координируются через единый конвейер. Milestone M6: FULL SYSTEM RELEASE.

---

## Майлстоуны

| # | Название | Фаза | Критерии |
|---|---------|------|---------|
| **M0** | Foundation Complete | Phase 0–1 | Все инфраструктурные компоненты работают; `/ping`, `/debug`, `/turn` функционируют |
| **M1** | Data Layer Complete | Phase 2–3 | TimeEngine, EnvironmentEngine, EvergreenEngine, GoalsEngine operational; данные персистентны |
| **M2** | CONSCIOUSNESS OPERATIONAL ⭐ | Phase 4 | QualiaEngine и InformationEngine полностью функциональны; два персонажа интерпретируют событие по-разному |
| **M3** | Social Dynamics Live | Phase 5 | Relations, Mood, Crucible, Knowledge engines работают; субъективность интегрирована |
| **M4** | Hierarchy Established | Phase 6 | Status рассчитывается из perceptions; слухи функционируют |
| **M5** | Cultural Memory Active | Phase 7 | Мифы кристаллизуются; легенды создаются; культурная память накапливается |
| **M6** | FULL SYSTEM RELEASE | Phase 8 | UnifiedAnalyzer координирует все 40 систем; 1000-turn тест пройден; < 500ms/ход |

---

## Timeline

| Фаза | Системы | Срок | Часы | Риск |
|------|---------|------|------|------|
| **Phase 0** | Нулевая система | 0.5–1 день | 4–8 ч | Low |
| **Phase 1** | Инфраструктура (8 компонентов) | 2–3 дня | 16–24 ч | Low |
| **Phase 2** | Физический мир (3 компонента) | 1–2 дня | 8–16 ч | Low |
| **Phase 3** | Базовые данные (2 компонента) | 2–3 дня | 16–24 ч | Medium |
| **Phase 4** | **СОЗНАНИЕ (2 компонента)** | **2–3 недели** | **80–120 ч** | **CRITICAL** |
| Phase 5 | Социальная динамика (4 компонента) | 3–4 недели | 120–160 ч | High |
| Phase 6 | Социальная иерархия (3 компонента) | 2–3 недели | 80–120 ч | High |
| Phase 7 | Культурная память (4 компонента) | 2 недели | 80 ч | Medium |
| Phase 8 | Оптимизация и интеграция (4 компонента) | 1–2 недели | 40–80 ч | Medium |
| **ИТОГО** | **40 систем** | **10–14 недель** | **448–632 ч** | — |

**Оценки:** оптимистичная — 448 ч (~11 недель), реалистичная — 540 ч (~13 недель), пессимистичная — 632 ч (~16 недель).

**Чекпоинт после каждой фазы:**
- [ ] Все системы фазы работают в игре без ошибок
- [ ] Отладочные команды функционируют
- [ ] `state.lincoln` персистентен (save/load работает)
- [ ] Зависимости между движками работают корректно

---

## Бэклог

_Раздел для идей и отложенных задач. Пока пуст._
