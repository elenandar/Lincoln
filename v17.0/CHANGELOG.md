# CHANGELOG — PROJECT LINCOLN

---

## v16.0.8 (2025-10-11) — Архив

### Что было реализовано

Проект Lincoln v16.0.8 — завершённая система симуляции динамических социальных миров. 15 движков, прошедших полный статический аудит.

| # | Движок | Домен |
|---|--------|-------|
| #1 | EvergreenEngine | Долговременная память (факты) |
| #2 | GoalsEngine | Цели персонажей |
| #3 | MoodEngine | Настроения |
| #4 | RelationsEngine | Отношения между персонажами |
| #5 | InformationEngine | Субъективная интерпретация событий (Level 2) |
| #6 | KnowledgeEngine | Секреты и фокус внимания |
| #7 | TimeEngine | Внутриигровое время |
| #8 | EnvironmentEngine | Локации и погода |
| #9 | GossipEngine | Слухи |
| #10 | HierarchyEngine | Социальная иерархия |
| #11 | SocialEngine | Социальные нормы |
| #12 | MemoryEngine | Мифологизация памяти |
| #13 | LoreEngine | Легенды |
| #14 | AcademicsEngine | Академическая активность |
| #15 | QualiaEngine | Феноменология (Level 1: Phenomenology) |

### Финальные метрики

- **7866 строк кода**
- **15 движков**
- **Статический аудит:** 34/34 ✅ (100%)
- **Стресс-тест:** 2500 ходов
- **Финальная оценка:** 94%

### Критические баги в продакшене (причина переписи)

1. **«Пропавший Opening»:** При старте новой игры первый `Continue` полностью стирал стартовый текст (`Opening.txt`) из контекста, отправляемого ИИ. Игра начиналась в пустоте.

2. **«Утечка Системных Данных»:** Последовательность `Erase` → `Continue` приводила к катастрофе: в контекст ИИ попадали «голые» внутренние переменные из `state` (например, `Relation Chloe:20`), что ломало повествование.

3. **«Recap на 9-м Retry»:** После девяти последовательных нажатий `Retry` система неожиданно предлагала recap — нежелательное и необъяснимое поведение.

4. **Симуляция ≠ реальность:** Все 100% тестов прошли успешно, но при запуске в реальной игре немедленно появились те же ошибки. Тестовый стенд фундаментально не соответствовал реальной среде AI Dungeon.

5. **ES5-нарушения:** Код содержал `Map`, `Set`, `Array.includes()` и другие ES6-конструкции, несовместимые с runtime AI Dungeon — ошибки были обнаружены только в продакшене.

6. **Неправильная модель выполнения Library.txt:** Library.txt считался выполняющимся «при загрузке игры», тогда как в действительности он выполняется **перед каждым хуком** (3 раза за ход).

### Решение

Переписать с нуля на v17 с правильной архитектурой зависимостей, ES5-совместимым кодом и инкрементальным тестированием в живой игре после каждого компонента.

---

## v17.0 (в разработке)

### Ключевые архитектурные изменения

- **ES5 MANDATORY** — ни одного ES6+ в кодовой базе; нарушение = runtime error
- **Правильная модель выполнения:** Library.txt выполняется 3× за ход (перед каждым хуком)
- **`state.shared` удалён** — не существует в AI Dungeon, все данные только в `state.lincoln`
- **Правильный порядок зависимостей** — QualiaEngine → InformationEngine (BLOCKING), затем социальные системы
- **KnowledgeEngine перемещён из Phase 3 в Phase 5** — зависит от `QualiaEngine.focus_aperture`
- **UnifiedAnalyzer (#29) реализуется абсолютно последним** — только когда все движки готовы
- **Тестирование после каждого компонента** — в живой игре, не только в симуляторе
- **Обязательный `stateVersion++`** после любой записи в `state.lincoln.*`
- **Story Cards fallback** через `state.lincoln.fallbackCards` при недоступном Memory Bank
- **CommandsRegistry** — plain ES5 object `{}`, не Map

### История изменений

| Дата | Событие |
|------|---------|
| 2025-10-11 | Финализация v16.0.8; выявлены критические баги в продакшене |
| 2025-10-12 | Создан `PROJECT_LINCOLN_DEBRIEF_v16.txt` — полный анализ провала |
| 2025-10 | Написан `PROJECT_LINCOLN_v17_MASTER_PLAN_v2.md` (5261 строк) — архитектурный ревью |
| 2026-04 | Старт проекта v17; написан `AI_Dungeon_Scripting_Canon_v1.md` |
| 2026-04 | Phase 0 реализована: 4 базовых скрипта с правильной структурой `modifier` |
| 2026-04 | Phase 1 в процессе: `state.lincoln` init + CommandsRegistry + `/ping`, `/help`, `/debug` |

### Статус компонентов v17

| Компонент | Статус | Фаза |
|-----------|--------|------|
| Library.txt — state.lincoln init | ✅ | Phase 0 |
| Library.txt — LC object | ✅ | Phase 0 |
| Library.txt — CommandsRegistry | ✅ | Phase 1 |
| Input.txt — modifier pattern | ✅ | Phase 0 |
| Context.txt — modifier pattern | ✅ | Phase 0 |
| Output.txt — modifier pattern | ✅ | Phase 0 |
| `/ping`, `/help`, `/debug` | ✅ | Phase 1 |
| LC.Tools (#19) | ⬜ | Phase 1 |
| LC.Utils (#20) | ⬜ | Phase 1 |
| LC.Flags (#21) | ⬜ | Phase 1 |
| LC.Drafts (#22) | ⬜ | Phase 1 |
| LC.Turns (#23) | ⬜ | Phase 1 |
| currentAction (#34) | ⬜ | Phase 1 |
| TimeEngine (#7) | ⬜ | Phase 2 |
| EnvironmentEngine (#8) | ⬜ | Phase 2 |
| EvergreenEngine (#1) | ⬜ | Phase 3 |
| GoalsEngine (#2) | ⬜ | Phase 3 |
| QualiaEngine (#15) | ⬜ | Phase 4 |
| InformationEngine (#5) | ⬜ | Phase 4 |
| MoodEngine (#3) | ⬜ | Phase 5 |
| RelationsEngine (#4) | ⬜ | Phase 5 |
| CrucibleEngine (#16) | ⬜ | Phase 5 |
| KnowledgeEngine (#6) | ⬜ | Phase 5 |
| HierarchyEngine (#10) | ⬜ | Phase 6 |
| GossipEngine (#9) | ⬜ | Phase 6 |
| SocialEngine (#11) | ⬜ | Phase 6 |
| MemoryEngine (#12) | ⬜ | Phase 7 |
| LoreEngine (#13) | ⬜ | Phase 7 |
| AcademicsEngine (#14) | ⬜ | Phase 7 |
| DemographicPressure (#17) | ⬜ | Phase 7 |
| UnifiedAnalyzer (#29) | ⬜ | Phase 8 |
| State Versioning (#30) | ⬜ | Phase 8 |
| Context Caching (#31) | ⬜ | Phase 8 |
| Norm Cache (#32) | ⬜ | Phase 8 |
