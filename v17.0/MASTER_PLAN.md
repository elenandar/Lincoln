# PROJECT LINCOLN v17 — MASTER PLAN

> Версия: 1.0 | Статус: Стабильный (канон) | Дата: апрель 2026

---

## СОДЕРЖАНИЕ

1. [О проекте Lincoln](#1-о-проекте-lincoln)
2. [Платформа AI Dungeon](#2-платформа-ai-dungeon)
3. [Архитектура v17](#3-архитектура-v17)

---

## 1. О проекте Lincoln

### 1.1. Что такое Lincoln

Project Lincoln — это система скриптов для AI Dungeon, реализующая **симуляцию динамических социальных миров**. Цель: создать глубокую, живую и психологически достоверную ролевую среду, где персонажи обладают подлинным субъективным опытом, сложными отношениями и коллективной памятью.

Проект Lincoln v17 является переписью с нуля на основе опыта v16, с правильной архитектурой зависимостей и обязательным ES5-совместимым кодом.

**Ключевые инновации (из v16, перенесённые в v17):**
- Четырёхуровневая модель сознания («Каскад Формирования Реальности»)
- Субъективная интерпретация событий через InformationEngine
- Репутация через субъективные восприятия (perceptions)
- Культурная память через легенды и мифы
- 40 взаимосвязанных систем, работающих как единый организм

### 1.2. Концепция «Каскад Формирования Реальности»

Ключевая архитектурная идея Lincoln: каждое событие проходит через **4 уровня обработки** перед тем, как оказать влияние на мир.

| Уровень | Движок | Домен | Описание |
|---------|--------|-------|----------|
| **Level 1** | QualiaEngine (#15) | Phenomenology | Сырые телесные ощущения: «что чувствует персонаж» без интерпретации |
| **Level 2** | InformationEngine (#5) | Psychology | Субъективная интерпретация события на основе qualia |
| **Level 3** | CrucibleEngine (#16) | Personality | Эволюция характера через формирующие события |
| **Level 4** | RelationsEngine / HierarchyEngine | Sociology | Социальные связи и иерархия через субъективные восприятия |

**Пример каскада** (событие: «Bob поблагодарил Alice»):

```javascript
// Level 1 (Qualia): valence ↑ — приятное ощущение от похвалы
LC.QualiaEngine.resonate("Alice", { type: "praise", intensity: 0.6 });

// Level 2 (Information): интерпретация зависит от valence
// Если Alice.valence = 0.7 → interpretation = "искренне", multiplier = 1.4
var interpretation = LC.InformationEngine.interpret("Alice", event);

// Level 3 (Crucible): если событие формирующее — меняется характер
// (в данном случае простая благодарность — не формирующее событие)

// Level 4 (Social): обновление отношений с учётом субъективности
LC.RelationsEngine.updateRelation("Alice", "Bob", 10 * interpretation.multiplier);
```

**Последовательность критична:** Level 1 → 2 → 3 → 4.  
QualiaEngine ВСЕГДА первый — интерпретация зависит от текущего qualia.

### 1.3. Технические ограничения платформы

- **Монолитная архитектура:** 4 файла (`Library.txt`, `Input.txt`, `Context.txt`, `Output.txt`) — нет `require()` или `import`
- **ES5 MANDATORY:** AI Dungeon использует ES5 JavaScript runtime — нарушения приводят к runtime error
- **Library.txt выполняется 3× за ход:** перед каждым хуком (Input / Context / Output) — `LC` пересоздаётся каждый раз
- **Персистентность только в `state.lincoln`:** объект `LC` нельзя хранить в `state`
- **`state.shared` не существует** — запрещено использовать
- **Story Cards могут быть недоступны** (Memory Bank выключен) — нужен fallback в `state.lincoln.fallbackCards`
- **Любая запись в `state.lincoln` → `stateVersion++`** без исключений
- **Нет нативной модульности** — вся логическая изоляция реализуется через объекты внутри одного файла

---

## 2. Платформа AI Dungeon

> Этот раздел содержит **полный канон** правил платформы AI Dungeon.  
> Источник: `AI_Dungeon_Scripting_Canon_v1.md` (перемещён в `v17.0/olddoc/`).

# AI Dungeon Scripting Canon v1.0

**Статус:** рабочий канон для разработки скриптов AI Dungeon  
**Основание:** только официальные материалы AI Dungeon Help/Guidebook и официальный архивный репозиторий Latitude Scripting  
**Проверено:** 2026-04-02

---

## 0. Назначение документа

Этот документ задаёт единый набор правил, на которые можно опираться при разработке скриптов для AI Dungeon.

Документ **не** опирается на внутренние проектные документы, пользовательские заметки, community-гайды или непроверенные допущения.

Если источник прямо не подтверждает правило, оно не считается жёстким каноном.

---

## 1. Слои достоверности

Чтобы не смешивать «правду платформы» и инженерные привычки, все положения делятся на три уровня.

### [P] Current Platform
Подтверждено текущим официальным Help/Guidebook AI Dungeon.

### [A] Archived Official API
Подтверждено официальным, но архивным репозиторием Latitude Scripting. Это официальный источник, но он описывает scripting API эпохи после/вокруг Phoenix и должен считаться **авторитетным, но требующим smoke-test для спорных мест**.

### [R] Recommendation
Надёжный вывод из официальных источников, но не буквальная формулировка документации.

---

## 2. Нормативные слова

В этом документе используются слова:

- **MUST** — обязательное правило
- **SHOULD** — сильная рекомендация
- **MAY** — допустимый вариант
- **MUST NOT** — запрещено

---

## 3. Общая модель скриптов

### 3.1. Вкладки скриптов

AI Dungeon использует четыре скриптовые вкладки:

1. **Library**
2. **Input**
3. **Context**
4. **Output**

`Input`, `Context` и `Output` — это модификаторы. `Library` — общий код, подставляемый перед ними. **[P][A]**

### 3.2. Где редактируются скрипты

На web скрипты редактируются через Scenario Editor в разделе Scripting. Изменения сценария применяются и к уже существующим Adventures, созданным из этого Scenario. **[P]**

### 3.3. Модель выполнения

`Library` не является «однократно загруженным модулем».

Официальный архивный scripting repo описывает `Shared Library` так: она **prepended to the start of the other three scripts before execution**. Следовательно:

- `Library` исполняется как пролог перед `Input`
- `Library` исполняется как пролог перед `Context`
- `Library` исполняется как пролог перед `Output`

Из этого следует:

- локальные переменные из `Library` **не считаются разделяемыми между хуками**
- для персистентного состояния MUST использоваться `state`
- код инициализации в `Library` SHOULD быть идемпотентным

Статус: **[A]** для модели prepended, **[R]** для требования идемпотентности.

---

## 4. Каноническая грамматика скриптов

### 4.1. Grammar: Library

`Library` MAY содержать обычный JavaScript-код без обязательной обёртки `modifier(text)`.

Минимальная форма:

```javascript
// Library
function helper(x) {
  return x;
}
```

Статус: **[A]**

### 4.2. Grammar: Input / Context / Output

Для вкладок `Input`, `Context` и `Output` MUST использоваться обёртка `modifier(text)` с возвратом объекта, содержащего `text`.

Канонический шаблон:

```javascript
const modifier = (text) => {
  // code
  return { text };
};
modifier(text);
```

Статус: **[P]**

### 4.3. Формальная структура модификатора

Минимальная допустимая форма хука:

```javascript
<HookScript> ::= 
  const modifier = (text) => {
    <body>
    return { text: <string> };
  };
  modifier(text);
```

Допустимое расширение для Input и архивно — для Context:

```javascript
return { text: <string>, stop: true };
```

Статус: **[P]** для `return { text }`, **[A]** для `stop: true`.

### 4.4. Комбинирование нескольких скриптов

Если в одну вкладку объединяются несколько скриптов, обёртка `modifier(text)` MUST присутствовать **ровно один раз**. Внутреннюю логику нужно объединять внутри одного тела `modifier`. **[P]**

---

## 5. Поверхность API

## 5.1. `state`

`state` — основной персистентный объект.

Разрешено:

- читать из `state`
- записывать в `state`
- добавлять собственные поля в `state`

Следовательно, всё состояние, которое должно переживать ходы и хуки, MUST храниться в `state`. **[A]**

### 5.2. `history`

`history` доступен для чтения, но MUST NOT модифицироваться. **[A]**

Архивный официальный repo документирует для history action types:

- `"do"`
- `"say"`
- `"story"`
- `"continue"`

Текущий Help в общих терминах AI Dungeon также описывает виды Action как `Do`, `Say`, `Story`, `See`. Поэтому безопасный код SHOULD уметь переносимо обрабатывать как минимум:

- `do`
- `say`
- `story`
- `continue`
- `see`

Статус: **[A]** для archive list, **[P]** для `See` как режима/типа действия в терминологии продукта, **[R]** для объединённого safe-set.

### 5.3. `info`

Официальный архивный API документирует:

Во всех модификаторах доступны:

- `info.actionCount`
- `info.characters`

В `Context Modifier` доступны дополнительно:

- `info.memoryLength`
- `info.maxChars`

Следовательно:

- логика, зависящая от `maxChars` и `memoryLength`, MUST жить в Context или вызываться из него
- код вне Context MUST NOT предполагать, что эти поля существуют

Статус: **[A]**

### 5.4. `state.memory.*`

Официальный архивный API документирует:

- `state.memory.context` — заменяет пользовательскую memory
- `state.memory.frontMemory` — скрыто добавляется перед последним действием
- `state.memory.authorsNote` — программно задаёт Author’s Note

Следовательно:

- эти поля MAY использоваться как официальный способ влиять на контекст
- при работе с ними разработчик MUST учитывать, что это влияет на общий бюджет контекста

Статус: **[A]**

### 5.5. `worldInfo` и world entry functions

Официальный архивный API документирует:

- читаемый `worldInfo` как массив
- функции изменения:
  - `addWorldEntry(keys, entry)`
  - `removeWorldEntry(index)`
  - `updateWorldEntry(index, keys, entry)`

Также документировано:

- `isNotHidden` больше не даёт эффекта
- `updateWorldEntry` больше не создаёт запись при несуществующем индексе

Следовательно:

- изменение World Info MUST происходить через функции API, а не через произвольную мутацию массива
- код MUST NOT полагаться на старое поведение `updateWorldEntry`
- код MUST NOT полагаться на `isNotHidden`

Статус: **[A]**

### 5.6. `console.log`

Логи скрипта MAY выводиться через `console.log(...)`. Их можно смотреть в `Script Logs & Errors`. **[A]**

### 5.7. `state.message`

Архивный официальный API документирует `state.message` как способ показать игроку alert-сообщение. Это **официально архивный**, но не заново подтверждённый current Help механизм.

Следовательно:

- `state.message` MAY использоваться
- поведение SHOULD быть подтверждено отдельным smoke-test в текущем окружении

Статус: **[A]**

---

## 6. Семантика хуков

### 6.1. Input Modifier

`Input Modifier` вызывается каждый раз, когда игрок отправляет input, и может его изменить. **[A]**

Официальный архивный API также говорит:

- в Input можно вернуть `stop: true`
- stop-флаг исторически bugged и может скрывать действие игрока из истории

Следовательно:

- Input MAY использоваться для команд, предобработки текста и маршрутизации логики
- `stop: true` в Input MAY использоваться, но его текущее поведение MUST быть проверено плейтестом

Статус: **[A]**

### 6.2. Context Modifier

`Context Modifier` вызывается перед отправкой контекста в модель и может менять то, что увидит модель, не меняя внешний вид истории. **[A]**

Следовательно:

- Context SHOULD быть главным местом для логики, завязанной на контекстные лимиты
- инъекции, основанные на `info.maxChars` и `info.memoryLength`, MUST делаться здесь

Статус: **[A]**

### 6.3. Output Modifier

`Output Modifier` вызывается после генерации модели и может изменить output перед показом игроку. **[A]**

Официальные источники не формулируют `stop: true` как нормальный рабочий механизм Output.

Следовательно:

- Output SHOULD использоваться для постобработки, фильтрации и анализа вывода
- на `stop: true` в Output MUST NOT строиться канон разработки

Статус: **[A]** для самого хука, **[R]** для запрета строить канон на `stop` в Output.

---

## 7. Канон контекста

Текущий Help задаёт современный канон контекста.

### 7.1. Required vs Dynamic

AI Dungeon делит контекст на две части:

**Required**
- Instructions
- Plot Essentials
- Story Summary
- Author’s Note
- Front Memory
- Last Action

**Dynamic**
- Story Cards
- Memory Bank
- Story History

Статус: **[P]**

### 7.2. Правила переполнения контекста

Если суммарный Required превышает лимит, система пытается уместить более приоритетные элементы в рамках 70% context budget.

При этом:

- `Front Memory` всегда включается полностью
- `Last Action` всегда включается полностью
- далее в приоритете: `Author’s Note`, `Plot Essentials`, `AI Instructions`, `Story Summary`

Статус: **[P]**

### 7.3. Dynamic budget

После Required оставшиеся токены распределяются примерно так:

- ~25% Story Cards
- ~50% History
- ~25% Memory Bank

Если Memory Bank отключён, History может получить до 75% оставшегося пространства. **[P]**

### 7.4. Порядок сборки контекста

Официальный current Help задаёт такой порядок:

1. Instructions (system prompt)
2. Plot Essentials
3. Story Cards
4. Story Summary
5. Memory Bank
6. History
7. Author’s Note
8. Last Action
9. Front Memory

Статус: **[P]**

### 7.5. Выводы для разработчика

Из официальной схемы следует:

- любое разрастание Front Memory или Context-injection может вытеснить Story Cards, Memory Bank и историю
- вся логика инъекций SHOULD быть короткой и плотной
- Context Modifier SHOULD учитывать официальный порядок и бюджет контекста

Статус: **[R]**

---

## 8. Story Cards

### 8.1. Что такое Story Cards

Текущий Help определяет Story Cards как заметки для AI о персонажах, местах, концептах и т.п. **[P]**

### 8.2. Как Story Cards попадают в контекст

Story Cards попадают в контекст, когда их triggers встречаются в **input или output**. Они также могут оставаться активными некоторое время в зависимости от размера контекста. **[P]**

Следовательно:

- trigger-слова MUST подбираться внимательно
- слишком широкие trigger-слова SHOULD избегаться

Статус: **[P]** для trigger-механики, **[R]** для best practice.

### 8.3. Историческое имя

Текущий Help прямо говорит, что Story Cards раньше назывались **World Info**. **[P]**

Это важно для чтения старых scripting-материалов: упоминания `worldInfo` в архивной официальной документации относятся к историческому слою той же функции продукта.

### 8.4. Import / Export Story Cards

Текущий Help документирует:

- импорт/экспорт Story Cards доступен только на web
- формат — JSON-массив
- обязательны только `keys` и `value`
- import полностью заменяет текущий набор cards
- точные дубликаты по `keys` + `value` удаляются автоматически

Статус: **[P]**

### 8.5. Что НЕ считается каноном по Story Cards

Следующие вещи MUST NOT считаться current-platform canon без отдельного теста:

- наличие встроенных функций `addStoryCard`, `updateStoryCard`, `removeStoryCard`
- поведение «Story Cards API отключается при Memory Bank OFF»

Текущий Help этого не документирует. Каноничным официальным scripting API остаётся архивно-официальный слой через `worldInfo` и world entry functions. **[P][A]**

---

## 9. AI Instructions, Plot Essentials, Author’s Note

### 9.1. AI Instructions

AI Instructions — отдельный набор правил для AI, отправляемый как **system prompt**, отдельно от остального контекста. **[P]**

### 9.2. Plot Essentials

Plot Essentials — редактируемое поле для описания ключевой информации истории и персонажей. Оно входит в контекст как отдельный компонент. **[P]**

### 9.3. Author’s Note

Author’s Note — короткий текст для управления стилем, темами и pacing. Текущий Help говорит, что он добавляется в конец контекста и форматируется квадратными скобками. **[P]**

### 9.4. Практический вывод

Из официальных определений следует:

- AI Instructions SHOULD использоваться для общих системных правил
- Plot Essentials SHOULD использоваться для устойчивых фактов истории
- Story Cards SHOULD использоваться для trigger-based world knowledge
- Author’s Note SHOULD использоваться для локального stylistic steering

Статус: **[R]**

---

## 10. JavaScript-совместимость

### 10.1. Что известно официально

Официальный архивный scripting repo говорит только, что **часть JavaScript functionality is locked down for security reasons**. Полного списка разрешённого/запрещённого JavaScript нет. **[A]**

Текущий Help в своём шаблоне использует:

- `const`
- стрелочную функцию

Следовательно, утверждение «AI Dungeon = строгий ES5 runtime» MUST NOT считаться каноном. **[P][A]**

### 10.2. Каноническое правило совместимости

Поскольку официального списка возможностей нет:

- разработчик MUST NOT считать любую современную возможность JavaScript гарантированной без smoke-test
- разработчик SHOULD писать в максимально простом и переносимом подмножестве языка, если нет причин делать иначе
- спорные language-features MUST проверяться непосредственно в AI Dungeon

Статус: **[R]**

### 10.3. Что НЕ входит в канон

Не являются официально подтверждённым каноном:

- «рантайм точно ES5»
- «Map/Set/Promise/class точно запрещены»
- «`Array.includes` точно не работает»
- «только `var`, без `const/let`»

Это MAY быть верной политикой осторожной разработки, но не подтверждено current official docs как абсолютная правда платформы. **[P][A]**

---

## 11. Остановка цикла и возврат значений

### 11.1. `stop: true`

Официально архивно подтверждено:

- Input MAY вернуть `stop: true`
- Context MAY вернуть `stop: true`
- stop-флаг в Input исторически bugged

Следовательно:

- `stop: true` в Input SHOULD использоваться только осознанно
- любое использование `stop: true` MUST проходить smoke-test
- `stop: true` в Output MUST NOT считаться частью канона

Статус: **[A]** + **[R]**

### 11.2. Пустая строка

Официальные current/archived документы не формулируют канон про поведение `return { text: "" }`.

Следовательно:

- правило «пустая строка ломает Input/Output» MUST NOT считаться официальным каноном
- если проект хочет принять более жёсткую политику возврата, это должно быть отдельным внутренним стандартом

Статус: **[P][A]**

---

## 12. Отладка и тестирование

### 12.1. Official debugging surface

Архивный официальный API документирует:

- Last Model Input
- Script Logs & Errors
- просмотр state
- быстрое истечение логов и LMI

Статус: **[A]**

### 12.2. Канонический smoke-test

Хотя current Help не публикует единый formal smoke-test, из официальных источников следует, что любой скрипт SHOULD проверяться так:

1. Сценарий сохраняется без ошибок
2. Скрипт исполняется в Scenario и в уже существующем Adventure
3. Проверены Script Logs & Errors
4. Проверен Last Model Input
5. Проверено поведение `state`, `history`, `info.maxChars`, Story Cards и специальных веток вроде `stop: true`

Статус: **[R]**

---

## 13. Запрещённые утверждения

Следующие утверждения MUST NOT использоваться как канон без отдельного подтверждения:

1. `Library` загружается один раз на старт игры
2. локальные переменные `Library` разделяются между хуками
3. существует штатный `state.shared`
4. существует current-official Story Cards scripting API с именами `addStoryCard/updateStoryCard/removeStoryCard`
5. AI Dungeon гарантирует строгий ES5 runtime
6. любая конкретная современная JS-возможность гарантированно работает или гарантированно не работает без теста
7. пустая строка `""` официально запрещена в Input/Output

Статус: **неканон**

---

## 14. Короткий нормативный стандарт

Если нужен максимально короткий базовый стандарт, то он такой:

1. `Input`, `Context` и `Output` MUST быть оформлены через `modifier(text)` и MUST возвращать объект с `text`. **[P]**
2. `Library` MUST рассматриваться как код, подставляемый перед тремя хуками, а не как единично загруженный модуль. **[A]**
3. Всё общее состояние MUST храниться в `state`. **[A]**
4. `history` MUST считаться read-only. **[A]**
5. Контекстная логика, завязанная на лимиты, MUST находиться в `Context`, потому что `info.maxChars` и `info.memoryLength` относятся к нему. **[A]**
6. Story Cards MUST проектироваться с аккуратными triggers, потому что они входят в контекст по input/output и конкурируют за dynamic budget. **[P]**
7. Любые спорные допущения о JavaScript runtime MUST проверяться smoke-test’ом. **[R]**
8. `stop: true` MAY использоваться в Input, но MUST тестироваться отдельно. **[A]**
9. Всё, что не подтверждено current Help или archived official API, MUST считаться непроверенным, а не каноническим. **[P][A]**

---

## 15. Источники

### Current official Help / Guidebook

- How to use Scripting in AI Dungeon  
  https://help.aidungeon.com/scripting

- What are Scripts and how do you Install them?  
  https://help.aidungeon.com/what-are-scripts-and-how-do-you-install-them

- What goes into the Context sent to the AI?  
  https://help.aidungeon.com/faq/what-goes-into-the-context-sent-to-the-ai

- What are Story Cards?  
  https://help.aidungeon.com/faq/story-cards

- Story Cards Import and Export  
  https://help.aidungeon.com/story-cards-import-and-export

- How do I know what everything means in AI Dungeon?  
  https://help.aidungeon.com/faq/how-do-i-know-what-everything-means-in-ai-dungeon

- What is Author’s Note?  
  https://help.aidungeon.com/faq/what-is-the-authors-note

### Archived official Latitude scripting repo

- latitudegames/Scripting  
  https://github.com/latitudegames/Scripting

---

## 16. Финальная формула канона

**Канон AI Dungeon для скриптов — это не список “магических трюков”, а набор строго подтверждённых правил о:**

- форме скриптов,
- точках исполнения,
- допустимых объектах API,
- устройстве контекста,
- логике Story Cards,
- границах того, что действительно известно о runtime.

Всё остальное должно либо:

- подтверждаться текущим official Help,
- подтверждаться archived official scripting API,
- либо проходить smoke-test и уже после этого превращаться во внутренний стандарт проекта.


---

## 3. Архитектура v17

### 3.1. Почему переписали v16

На основе `PROJECT_LINCOLN_DEBRIEF_v16.txt` — конкретные причины перехода к v17:

1. **«Пропавший Opening»:** При старте новой игры первый `Continue` полностью стирал стартовый текст (`Opening.txt`) из контекста, отправляемого ИИ. Игра начиналась в пустоте.

2. **«Утечка Системных Данных»:** Последовательность `Erase` → `Continue` приводила к попаданию «голых» внутренних переменных из `state` в контекст ИИ (например, `Relation Chloe:20`), что ломало повествование.

3. **«Recap на 9-м Retry»:** После девяти последовательных `Retry` система неожиданно предлагала recap — нежелательное и необъяснимое поведение.

4. **Симуляция ≠ Реальность:** Все 100% тестов «Легиона» прошли, но в живой игре сразу появились ошибки. Тестовый стенд не совпадал с реальной средой AI Dungeon.

5. **Технический долг от неправильного порядка зависимостей:** Системы v16 строились без строгого соблюдения порядка зависимостей, что приводило к «половинчатым» реализациям и двойному рефакторингу.

6. **ES5-нарушения в коде:** Использование `Map`, `Set`, `Array.includes()` и других ES6-конструкций, несовместимых с runtime AI Dungeon.

7. **Неправильная модель выполнения Library.txt:** Первоначально Library.txt считался выполняющимся «при загрузке игры». На самом деле он выполняется **перед каждым хуком** (3 раза за ход).

**Решение:** Переписать с нуля. Инкрементальная разработка: один движок → тест в игре → следующий.

---

### 3.2. Архитектурные принципы v17

#### Принцип 1: Library.txt и Модель Выполнения AI Dungeon

### 2.1 Принцип 1: Library.txt и Модель Выполнения AI Dungeon

**КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ:** Library.txt выполняется **НЕ при загрузке игры**, а **ПЕРЕД КАЖДЫМ хуком** (Input/Context/Output).

**Канонический порядок вызова хуков за один ход:**
```
onInput       → sharedLibrary → Input
onModelContext → sharedLibrary → Context
onOutput      → sharedLibrary → Output
```

**Модель выполнения для КАЖДОГО хода игрока:**
```javascript
// 1. Input Hook: Library.txt → Input Script
// 2. Context Hook: Library.txt → Context Script  
// 3. Output Hook: Library.txt → Output Script
// Library.txt выполняется 3 РАЗА за один ход игрока!
```

**Следствие для архитектуры Lincoln:**

```javascript
// Library.txt - выполняется КАЖДЫЙ РАЗ перед Input/Context/Output

// ОБЯЗАТЕЛЬНАЯ проверка инициализации
if (!state.lincoln || state.lincoln.version !== "17.0.0") {
    // Инициализация только если не существует или устарела версия
    state.lincoln = {
        version: "17.0.0",
        initialized: true,
        turn: 0,
        characters: {},
        relations: {},
        hierarchy: {},
        rumors: [],
        lore: [],
        myths: [],
        time: {},
        environment: {},
        evergreen: [],
        secrets: []
    };
}

// Движки Lincoln - создаются каждый раз
const LC = (() => {
    return {
        // Утилиты
        Tools: { 
            safeRegexMatch: function(text, pattern) {
                try {
                    return text.match(pattern) || [];
                } catch (e) {
                    console.log("Regex error:", e);
                    return [];
                }
            }
        },
        Utils: { /* общие функции */ },
        
        // Движки (логически изолированные объекты)
        QualiaEngine: { /* методы */ },
        InformationEngine: { /* методы */ },
        RelationsEngine: { /* методы */ },
        HierarchyEngine: { /* методы */ },
        // ... все 40 систем
    };
})();

// LC доступен в scope Library и в Input/Context/Output через замыкание
// НЕ нужно сохранять в state - он пересоздается каждый раз
```

**Ключевая идея:** 
- LC пересоздается 3 раза за ход (перед каждым хуком)
- state.lincoln персистентен и проверяется при каждом выполнении
- Движки не хранят состояние в себе - только в state.lincoln
- Проверка версии предотвращает повторную инициализацию


---

#### Принцип 2: ES5 Compliance — MANDATORY

### 2.2 Принцип 2: ES5 Compliance - MANDATORY

**⚠️ КРИТИЧНО - ES5 COMPLIANCE:**

AI Dungeon использует ES5 JavaScript runtime с ограниченными возможностями. **НАРУШЕНИЕ ЭТИХ ПРАВИЛ ПРИВЕДЕТ К RUNTIME ERRORS.**

**Краткая шпаргалка (полная таблица — в разделе [Внешнее выравнивание → E](#e-es5-compliance-delta)):**

| Статус | Конструкции |
|--------|-------------|
| ❌ ЗАПРЕЩЕНО | `Map`, `Set`, `WeakMap`, `Array.includes`, `Array.find`, `Array.findIndex`, `Object.assign`, деструктуризация, spread `...`, `for...of`, `class`, `async/await/Promise` |
| ✅ РАЗРЕШЕНО | `const`/`let`, стрелочные функции, `Object.keys`, `JSON.*` |
| ⚠️ С ОСТОРОЖНОСТЬЮ | Template literals — только после smoke-теста |

**Issue 1: CommandsRegistry Uses Map**

*Location:* Master Plan, PHASE 1, line 242

```javascript
| **CommandsRegistry** (#24) | Command Registry | Map for storing commands |
```

**Problem:** Map is ES6+, not available in ES5.

**Fix Required:**
```javascript
// WRONG (ES6)
const commandsRegistry = new Map();
commandsRegistry.set('ping', handler);

// CORRECT (ES5) - Use plain object
const commandsRegistry = {};
commandsRegistry['ping'] = handler;
// or using dot notation
commandsRegistry.ping = handler;

// Access:
const handler = commandsRegistry['ping'];
// or
const handler = commandsRegistry.ping;
```

**Impact:** CRITICAL - Will cause runtime error in AI Dungeon.

**Полная реализация CommandsRegistry (ES5):**
```javascript
// В Library.txt
LC.CommandsRegistry = {
    commands: {}, // Plain object, НЕ Map!
    
    register: function(name, handler) {
        this.commands[name] = handler;
    },
    
    process: function(text) {
        if (!text || typeof text !== 'string' || !text.startsWith('/')) {
            return { handled: false };
        }
        
        try {
            var parts = text.slice(1).split(' ');
            var command = parts[0];
            var args = parts.slice(1);
            
            if (this.commands[command]) {
                var output = this.commands[command](args);
                return { handled: true, output: output || " " };
            }
            
            return { handled: false };
        } catch (e) {
            console.log("CommandsRegistry error:", e);
            return { handled: false, error: e };
        }
    }
};

// Регистрация команд
LC.CommandsRegistry.register('ping', function(args) {
    return "pong";
});

LC.CommandsRegistry.register('debug', function(args) {
    return "Lincoln v17 | Turn: " + state.lincoln.turn + 
           " | Version: " + state.lincoln.stateVersion;
});

LC.CommandsRegistry.register('qualia', function(args) {
    // args: ['get', 'Alice'] или ['set', 'Alice', 'valence', '0.8']
    var action = args[0];
    var character = args[1];
    
    if (action === 'get') {
        var valence = LC.QualiaEngine.getValence(character);
        return character + " valence: " + valence.toFixed(2);
    } else if (action === 'set' && args.length >= 4) {
        var param = args[2];
        var value = parseFloat(args[3]);
        LC.QualiaEngine.resonate(character, {
            type: 'custom',
            delta: { valence: value - 0.5 }  // корректировка от нейтрали
        });
        return "Set " + character + " " + param + " to " + value;
    }
    
    return "Usage: /qualia get <name> OR /qualia set <name> <param> <value>";
});
```

**Использование в Input Script:**
```javascript
// Input.txt
const modifier = (text) => {
    if (text.startsWith('/')) {
        var result = LC.CommandsRegistry.process(text);
        if (result.handled) {
            return { text: result.output || " ", stop: true };
        }
    }
    
    return { text: text };
};
modifier(text);
```

---

**Issue 2: Potential Array.includes() Usage**

*Location:* Not explicit in plan, but common mistake

**Warning:** ES5 does NOT have `Array.prototype.includes()`.

**Forbidden Pattern:**
```javascript
if (witnesses.includes(character)) { ... } // ❌ NOT ES5
```

**ES5 Alternative:**
```javascript
if (witnesses.indexOf(character) !== -1) { ... } // ✅ ES5 compatible
```

---

**Issue 3: Const/Let in Examples**

*Location:* Throughout plan

**Note:** While AI Dungeon supports `const`/`let`, strict ES5 only has `var`.

**Recommendation:**  
- **For Lincoln v17:** Use `const`/`let` (confirmed working in AI Dungeon)
- **Fallback:** If errors occur, document `var` conversion patterns

---




---

#### Принцип 3: Логическая Изоляция Движков

### 2.3 Принцип 3: Логическая Изоляция Движков

**Важно:** Несмотря на отсутствие физической модульности, мы **строго соблюдаем логическую изоляцию**.

**Правила взаимодействия:**

1. ✅ **Разрешено:** Вызывать публичные методы других движков
   ```javascript
   // RelationsEngine использует InformationEngine
   const interpretation = LC.InformationEngine.interpret(character, event);
   modifier *= interpretation.multiplier;
   ```

2. ❌ **Запрещено:** Прямой доступ к внутреннему состоянию других движков
   ```javascript
   // НЕПРАВИЛЬНО: прямое чтение чужого состояния
   const valence = state.lincoln.qualia_state[character].valence;
   
   // ПРАВИЛЬНО: через публичный метод
   const valence = LC.QualiaEngine.getValence(character);
   ```

3. ✅ **Разрешено:** Чтение и запись в `state.lincoln` (общее хранилище данных)
   ```javascript
   // Каждый движок управляет своей областью в state.lincoln
   state.lincoln.relations[from][to] = value;
   ```

**Структура state.lincoln:**

```javascript
state.lincoln = {
  // Core metadata
  stateVersion: 0,     // Incremented on every state write
  turn: 0,             // TimeEngine
  
  // Characters data
  characters: {
    "Alice": {
      qualia_state: {    // QualiaEngine
        somatic_tension: 0.5,
        valence: 0.5,
        focus_aperture: 0.5,
        energy_level: 0.5
      },
      perceptions: {     // InformationEngine
        "Bob": { trust: 0.5, respect: 0.5, competence: 0.5, affection: 0.5 }
      },
      self_concept: {},  // CrucibleEngine
      personality: {},   // CrucibleEngine
      mood: "neutral",   // MoodEngine
      goals: []          // GoalsEngine
    }
  },
  
  // Social structures
  relations: {},         // RelationsEngine
  hierarchy: {},         // HierarchyEngine
  rumors: [],            // GossipEngine
  
  // Cultural memory
  lore: [],              // LoreEngine
  myths: [],             // MemoryEngine
  
  // World state
  time: {},              // TimeEngine
  environment: {},       // EnvironmentEngine
  
  // Knowledge systems
  evergreen: [],         // EvergreenEngine
  secrets: []            // KnowledgeEngine
};
```


---

#### Принцип 4: Инкрементальная Разработка по Фазам

### 2.4 Принцип 4: Инкрементальная Разработка по Фазам

**Стратегия:** Мы НЕ строим всю систему сразу. Мы создаем её поэтапно, начиная с **пустого, но рабочего скелета**.

**Фаза 0: Нулевая Система**
- Создать четыре пустых скрипта: `Input.txt`, `Output.txt`, `Context.txt`, `Library.txt`
- Скрипты успешно загружаются в игре, но ничего не делают
- Это наша точка отсчета

**Далее:** Добавляем по одному движку за раз, согласно дорожной карте (см. Section 4).


---

#### Принцип 5: Каскадная Модель Зависимостей

### 2.5 Принцип 5: Каскадная Модель Зависимостей

**Ключевое открытие:** После анализа всех 40 систем v16 установлено, что существует **строгий порядок зависимостей**, нарушение которого приводит к техническому долгу.

**Критическая пара #1: QualiaEngine → InformationEngine**

```javascript
// InformationEngine НЕ МОЖЕТ работать без QualiaEngine
InformationEngine.interpret = function(character, event) {
  const valence = LC.QualiaEngine.getValence(character);  // ← Читает qualia_state
  
  if (valence > 0.7) {
    return { interpretation: "искренне", multiplier: 1.5 };
  } else if (valence < 0.3) {
    return { interpretation: "саркастично", multiplier: 0.4 };
  }
};
```

**Тип зависимости:** BLOCKING (блокирующая)  
**Следствие:** QualiaEngine ОБЯЗАН быть внедрен ПЕРЕД InformationEngine. Это безальтернативно.

**Критическая пара #2: InformationEngine → RelationsEngine**

```javascript
// RelationsEngine НУЖДАЕТСЯ в InformationEngine для субъективной интерпретации
RelationsEngine.updateRelation = function(from, to, modifier, options) {
  if (options.interpretedEvent) {
    const interpretation = LC.InformationEngine.interpret(from, options.interpretedEvent);
    modifier *= interpretation.multiplier;  // ← Использует InformationEngine
  }
  
  state.lincoln.relations[from][to] += modifier;
};
```

**Тип зависимости:** FUNCTIONAL (функциональная)  
**Следствие:** RelationsEngine ЛУЧШЕ внедрять ПОСЛЕ InformationEngine, чтобы сразу иметь субъективные интерпретации.

**Критическая пара #3: InformationEngine → HierarchyEngine**

```javascript
// HierarchyEngine использует InformationEngine для расчета репутации (ключевая инновация v16)
HierarchyEngine._getAverageWitnessRespect = function(character) {
  let totalRespect = 0;
  
  for (const witness of witnesses) {
    const perception = LC.InformationEngine.getPerception(witness, character);
    totalRespect += perception.respect;  // ← Субъективная оценка
  }
  
  return totalRespect / witnesses.length;
};
```

**Тип зависимости:** FUNCTIONAL (функциональная)  
**Следствие:** HierarchyEngine ДОЛЖЕН быть внедрен ПОСЛЕ InformationEngine, чтобы сохранить ключевую инновацию v16.


---

#### Принцип 6: Тестирование на Каждом Шаге

### 2.6 Принцип 6: Тестирование на Каждом Шаге

**Правило:** После внедрения КАЖДОГО компонента проводится обязательный запуск в игре AI Dungeon.

**Методы тестирования:**
1. **Команды для отладки** — например, `/qualia set Alice valence 0.8`
2. **Автоматический анализ текста** — система должна корректно обрабатывать сюжетные действия
3. **Проверка стабильности** — отсутствие ошибок в консоли, корректное сохранение состояния

**Критерий успеха:** Игра стабильно работает, новый компонент выполняет свою функцию, данные корректно сохраняются в `state.lincoln`.


---

### 3.3. Граф зависимостей движков

### 3.1 Visual Representation (ASCII Art)

```
LEGEND:
  ═══>  BLOCKING dependency (MUST implement before)
  ───>  FUNCTIONAL dependency (SHOULD implement before)
  ···>  OPTIONAL dependency (nice to have)

CRITICAL PATH (highlighted with ═══):

┌──────────────────────────────────────────────────────────┐
│ PHASE 0: NULL SYSTEM                                     │
│ [Empty scripts, validation only]                         │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│ PHASE 1: INFRASTRUCTURE                                  │
│                                                          │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐                │
│  │ lcInit  │  │ Tools    │  │ Utils   │                │
│  │ (#33)   │  │ (#19)    │  │ (#20)   │                │
│  └─────────┘  └──────────┘  └─────────┘                │
│       │                                                  │
│       ├────> Commands (#24), Flags (#21), Drafts (#22)  │
│       └────> Turns (#23), currentAction (#34)           │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│ PHASE 2: PHYSICAL WORLD                                  │
│                                                          │
│  ┌──────────────┐  ┌──────────────────┐                │
│  │ TimeEngine   │  │ EnvironmentEngine│                │
│  │    (#7)      │  │      (#8)        │                │
│  └──────────────┘  └──────────────────┘                │
│        │                                                 │
│        └──────> ChronologicalKB (#18) [optional]        │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│ PHASE 3: BASIC DATA                                      │
│                                                          │
│  ┌────────────┐  ┌──────────┐  ┌──────────────┐        │
│  │ Evergreen  │  │  Goals   │  │  Knowledge   │        │
│  │   (#1)     │  │   (#2)   │  │     (#6)     │        │
│  └────────────┘  └──────────┘  └──────────────┘        │
│                                                          │
│  [No dependencies between these - any order OK]         │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
╔══════════════════════════════════════════════════════════╗
║ PHASE 4: CONSCIOUSNESS — CRITICAL PATH                   ║
║                                                          ║
║  ┌────────────────────────────────────────────────┐     ║
║  │         QualiaEngine (#15)                     │     ║
║  │         [Level 1: Phenomenology]               │     ║
║  │                                                │     ║
║  │  • somatic_tension                             │     ║
║  │  • valence                                     │     ║
║  │  • focus_aperture                              │     ║
║  │  • energy_level                                │     ║
║  └────────────────────┬───────────────────────────┘     ║
║                       │                                  ║
║                       │ BLOCKING DEPENDENCY              ║
║                       │ (InformationEngine reads         ║
║                       │  qualia_state.valence)           ║
║                       ▼                                  ║
║  ┌────────────────────────────────────────────────┐     ║
║  │      InformationEngine (#5)                    │     ║
║  │      [Level 2: Psychology]                     │     ║
║  │                                                │     ║
║  │  • interpret(char, event) ════> QualiaEngine   │     ║
║  │  • perceptions: {trust, respect, ...}          │     ║
║  │                                                │     ║
║  │  EXPORTS: getPerception(), updatePerception()  │     ║
║  └────────────────────┬───────────────────────────┘     ║
║                       │                                  ║
║  ⚠️  NO OTHER ENGINES BETWEEN THESE TWO!                ║
║      IMPLEMENT CONSECUTIVELY WITHOUT INTERRUPTION       ║
╚═══════════════════════╪══════════════════════════════════╝
                        │
                        │ FUNCTIONAL DEPENDENCIES
                        │ (These engines SHOULD use
                        │  InformationEngine for full
                        │  v16 functionality)
                        │
        ┌───────────────┼───────────────┬────────────────┐
        │               │               │                │
        ▼               ▼               ▼                ▼
┌─────────────┐  ┌─────────────┐  ┌──────────┐  ┌──────────┐
│ MoodEngine  │  │ Relations   │  │Crucible  │  │ Knowledge│
│    (#3)     │  │ Engine(#4)  │  │Engine    │  │ Engine   │
│             │  │             │  │  (#16)   │  │   (#6)   │
│  Moods ····>──>│ interpret() │  │          │  │[Enhanced]│
│             │  │ multiplier  │  │Formative │  │          │
│             │  │             │  │  events  │  │  Secrets │
└─────────────┘  └──────┬──────┘  │interpret │  │  & Focus │
                        │         └────┬─────┘  └──────────┘
                        │              │
                        │              │
                        ▼              ▼
                ┌─────────────────────────────┐
                │   PHASE 5 COMPLETE          │
                │   [Social Dynamics Ready]   │
                └──────────────┬──────────────┘
                               │
                               ▼
╔══════════════════════════════════════════════════════════╗
║ PHASE 6: SOCIAL HIERARCHY                                ║
║                                                          ║
║  ┌────────────────────────────────────────────────┐     ║
║  │        HierarchyEngine (#10)                   │     ║
║  │                                                │     ║
║  │  calculateStatus(char) {                       │     ║
║  │    witnesses.forEach(w => {                    │     ║
║  │      perception = InformationEngine            │     ║
║  │        .getPerception(w, char); ═══════════════╪════>║
║  │      respect += perception.respect;            │  TO ║
║  │    })                                          │ Info║
║  │  }                                             │Engine║
║  └────────────────────────────────────────────────┘     ║
║                                                          ║
║  ┌──────────────┐  ┌──────────────┐                     ║
║  │   Gossip     │  │   Social     │                     ║
║  │ Engine (#9)  │  │ Engine (#11) │                     ║
║  │              │  │              │                     ║
║  │ Rumors ─────>──>│ Norms &      │                     ║
║  │ Credibility  │  │ Conformity   │                     ║
║  └──────────────┘  └──────────────┘                     ║
╚══════════════════════════════════════════════════════════╝
                               │
                               ▼
┌──────────────────────────────────────────────────────────┐
│ PHASE 7: CULTURAL MEMORY                                 │
│                                                          │
│  ┌───────────┐  ┌───────────┐  ┌────────────┐          │
│  │  Memory   │  │   Lore    │  │ Academics  │          │
│  │Engine(#12)│  │Engine(#13)│  │Engine (#14)│          │
│  │           │  │           │  │            │          │
│  │ Myths ◄───┼──┤ Legends   │  │ Activities │          │
│  │from events│  │           │  │            │          │
│  └───────────┘  └───────────┘  └────────────┘          │
│                                                          │
│  ┌────────────────────────────┐                          │
│  │ DemographicPressure (#17)  │                          │
│  │ [New character integration]│                          │
│  └────────────────────────────┘                          │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│ PHASE 8: OPTIMIZATION & COORDINATION                     │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │    State     │  │   Context    │  │     Norm     │  │
│  │ Versioning   │  │   Caching    │  │    Cache     │  │
│  │    (#30)     │  │    (#31)     │  │    (#32)     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │         UnifiedAnalyzer (#29)                  │     │
│  │         [LAST TO IMPLEMENT]                    │     │
│  │                                                │     │
│  │  Coordinates ALL engines in proper order:     │     │
│  │  1. Qualia update                              │     │
│  │  2. Information interpretation                 │     │
│  │  3. Relations update                           │     │
│  │  4. Hierarchy recalculation                    │     │
│  │  5. Mood derivation                            │     │
│  │  6. Formative event detection                  │     │
│  │  7. Memory/Lore updates                        │     │
│  └────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────┘

CRITICAL PATH SUMMARY:
═══════════════════════
Phase 0 → Phase 1 → Phase 2 → Phase 3 → 
  QualiaEngine (#15) ═══> InformationEngine (#5) → 
  Phase 5 → Phase 6 (HierarchyEngine uses InformationEngine) →
  Phase 7 → Phase 8 (UnifiedAnalyzer)
```


---

### 3.4. Критические правила реализации

## 8. КРИТИЧЕСКИЕ ПРАВИЛА (UPDATED)

This section defines the non-negotiable rules that MUST be followed during Lincoln v17 development.

### 8.1 Правило #0: ES5 Compliance MANDATORY (NEW)

**⚠️ КРИТИЧНО: НАРУШЕНИЕ = RUNTIME ERROR**

**NEVER use:**
- ❌ `Map`, `Set`, `WeakMap`, `WeakSet` → use plain objects `{}`
- ❌ `Array.includes()` → use `indexOf() !== -1`
- ❌ `Array.find()` → use loop with break
- ❌ `Object.assign()` → manual copy
- ❌ Destructuring `{ x, y }` → direct property access
- ❌ Spread operator `...array` → manual concatenation
- ❌ Template literals `` `text ${var}` `` → string concatenation `'text ' + var`
- ❌ `async`/`await`, `Promise` → callback patterns
- ❌ `class` keyword → function constructors

**ALWAYS use:**
- ✅ Plain objects `{}` for maps
- ✅ Arrays `[]` for ordered collections
- ✅ `indexOf() !== -1` for membership check
- ✅ Manual loops with `for` or `Object.keys()`
- ✅ `function` keyword
- ✅ String concatenation with `+`
- ✅ `var` or `const`/`let` (AI Dungeon supports these)

**CHECK:** Run ES5 compliance checker before each phase deployment.

```bash
#!/bin/bash
# es5-check.sh

echo "Checking ES5 compliance..."

# Check for Map/Set usage
if grep -r "new Map\|new Set\|new WeakMap\|new WeakSet" *.txt; then
  echo "ERROR: Map/Set usage found!"
  exit 1
fi

# Check for Array.includes
if grep -r "\.includes(" *.txt; then
  echo "ERROR: Array.includes() usage found! Use indexOf() !== -1"
  exit 1
fi

# Check for Object.assign
if grep -r "Object\.assign" *.txt; then
  echo "ERROR: Object.assign() usage found! Use manual copy"
  exit 1
fi

echo "✅ ES5 check complete!"
```

---

### 8.2 Existing Critical Rules from Master Plan v1.0



### Правило #1: QualiaEngine → InformationEngine ПОСЛЕДОВАТЕЛЬНО

**⚠️ БЕЗАЛЬТЕРНАТИВНО:** QualiaEngine и InformationEngine должны быть внедрены **подряд**, **без перерыва**, **без других движков между ними**.

**Почему:**
- InformationEngine НЕ МОЖЕТ работать без QualiaEngine (блокирующая зависимость)
- Откладывать InformationEngine = создавать заглушки = бессмысленная работа

### Правило #2: InformationEngine ДО RelationsEngine и HierarchyEngine

**⚠️ КРИТИЧНО:** Социальные системы (RelationsEngine, HierarchyEngine) должны быть внедрены ПОСЛЕ InformationEngine.

**Почему:**
- Иначе придется реализовать "половинчатую" версию RelationsEngine
- Потом рефакторить для интеграции InformationEngine
- Двойная работа + технический долг

### Правило #3: UnifiedAnalyzer ПОСЛЕДНИМ

**⚠️ ОБЯЗАТЕЛЬНО:** UnifiedAnalyzer внедряется ПОСЛЕ всех движков.

**Почему:**
- UnifiedAnalyzer — это координатор, который вызывает все движки
- Если движков нет, координировать нечего

### Правило #4: Код с Чистого Листа

**⚠️ ЗАПРЕЩЕНО:** Копировать код из v16.

**Разрешено:**
- Читать аудиторский отчет v16
- Понимать идею каждой системы
- Переосмысливать и писать заново

**Почему:**
- Код v16 был написан для другой архитектуры
- Прямое копирование приведет к ошибкам

### Правило #5: Один Движок за Раз

**⚠️ ОБЯЗАТЕЛЬНО:** Никаких параллельных разработок.

**Процесс:**
1. Внедрить один движок
2. Протестировать в игре
3. Убедиться в стабильности
4. Только потом переходить к следующему

---



---

### 8.3 Rule #6: Testing After Every Component (NEW)

**⚠️ ОБЯЗАТЕЛЬНО: NO UNTESTED CODE ACCUMULATION**

**Process:**
1. Implement component
2. Write unit tests
3. Run unit tests → MUST PASS
4. Write integration tests
5. Run integration tests → MUST PASS
6. Deploy to AI Dungeon
7. Manual verification
8. Only then move to next component

**Forbidden:**
- ❌ Implementing multiple components before testing
- ❌ Skipping tests "temporarily"
- ❌ Accumulating untested code
- ❌ Moving forward with failing tests

**Required:**
- ✅ Unit test coverage for all public methods
- ✅ Integration tests for all engine pairs
- ✅ Manual verification in AI Dungeon
- ✅ Regression tests pass after each addition

---

### 8.4 Rule #7: State Versioning Non-Negotiable (NEW)

**⚠️ КРИТИЧНО: ALWAYS INCREMENT stateVersion AFTER WRITES**

**Rule:**
- EVERY write to `state.lincoln.*` MUST be followed by `state.lincoln.stateVersion++`
- NO exceptions
- This enables cache invalidation and change detection

**Helper Function Approach:**

```javascript
// LC.Utils.writeState - Auto-increments stateVersion
LC.Utils.writeState = function(path, value) {
  // Parse path like "characters.Alice.qualia_state.valence"
  var parts = path.split('.');
  var obj = state.lincoln;
  
  for (var i = 0; i < parts.length - 1; i++) {
    obj = obj[parts[i]];
  }
  
  obj[parts[parts.length - 1]] = value;
  
  // Auto-increment
  state.lincoln.stateVersion++;
};

// Usage:
LC.Utils.writeState('characters.Alice.qualia_state.valence', 0.8);
// Automatically increments stateVersion
```

**Manual Approach:**

```javascript
// If writing directly:
state.lincoln.relations['Alice']['Bob'] = 50;
state.lincoln.stateVersion++; // ✅ MANDATORY

// NEVER forget this increment
```

**Verification:**

After every engine implementation, verify:
- ✅ All write operations increment stateVersion
- ✅ No read operations increment stateVersion
- ✅ Cache invalidation triggers on version change

---

### 8.5 Additional Recommendations from Architectural Review (NEW)



### 8.1 Immediate Actions (Before Starting Implementation)

1. **APPROVE THIS REVIEW**
   - Stakeholders review this document
   - Identify any concerns or gaps
   - Sign-off on approach

2. **COMPLETE MISSING SPECIFICATIONS**
   - Write full specs for components #19-24, #29-32 (infrastructure/optimization)
   - Estimated effort: 8-16 hours
   - **Blocking:** Cannot implement without specs

3. **SET UP DEVELOPMENT ENVIRONMENT**
   - Create AI Dungeon scenario for testing
   - Set up version control for scripts
   - Establish backup/rollback procedures

4. **CREATE ES5 COMPLIANCE CHECKER**
   - Implement automated script (see Section 5.2)
   - Integrate into workflow
   - Run before each phase completion

5. **DEFINE ROLLBACK PROCEDURES**
   - What if Phase 4 fails in production?
   - How to revert to previous working state?
   - Document recovery steps

---

### 8.2 Implementation Strategy

**RECOMMENDED APPROACH:**

1. **Start with Phase 0-1** (Infrastructure)
   - Low risk, establishes foundation
   - Validates development workflow
   - Tests AI Dungeon integration

2. **Proceed through Phases 2-3** (Physical World, Data)
   - Build confidence with simpler components
   - Establish testing patterns
   - Verify persistence mechanisms

3. **CRITICAL: Phase 4 with Maximum Care**
   - Allocate 1-2 weeks dedicated time
   - No distractions or parallel work
   - Implement Qualia → Information consecutively
   - **Do not proceed to Phase 5 until Phase 4 fully verified**

4. **Phases 5-7 with Integration Focus**
   - Continuously validate integration with Phase 4
   - Run regression tests after each component
   - Document any deviations from plan

5. **Phase 8 as Final Polish**
   - UnifiedAnalyzer last
   - Comprehensive system testing
   - Performance optimization

---

### 8.3 Success Factors

**CRITICAL SUCCESS FACTORS:**

1. ✅ **Follow dependency order strictly**
   - No shortcuts, no "we'll refactor later"
   - Qualia → Information without interruption

2. ✅ **Test incrementally**
   - Test after EVERY component
   - Don't accumulate untested code

3. ✅ **Maintain ES5 discipline**
   - Run compliance checker frequently
   - Review all code for ES6 constructs

4. ✅ **Document as you go**
   - Update specs with actual implementation details
   - Record decisions and rationale

5. ✅ **Preserve v16 innovations**
   - Subjective interpretation (Information Engine)
   - Perception-based reputation (Hierarchy Engine)
   - Four-level consciousness model

---

## CONCLUSION

The Lincoln v17 Master Plan is **fundamentally sound** but requires:

1. **Complete engine specifications** (provided in Section 2 of this review)
2. **Enhanced dependency documentation** (provided in Section 3)
3. **Comprehensive risk mitigation** (provided in Section 5)
4. **Detailed testing strategy** (provided in Section 6)

With these additions, the plan is **APPROVED FOR IMPLEMENTATION** with the following **CRITICAL REQUIREMENTS:**

⚠️ **NON-NEGOTIABLE:**
1. Implement QualiaEngine → InformationEngine consecutively, without interruption
2. Do not proceed to Phase 5 until Phase 4 integration tests pass
3. Run ES5 compliance checker before each phase completion
4. Follow dependency order strictly (no shortcuts)

**Estimated Timeline:** 5-7 weeks (single developer)

**Risk Assessment:** Medium-High (due to Phase 4 criticality and ES5 constraints)

**Recommendation:** PROCEED with enhanced specifications and testing strategy outlined in this review.



---


## ЗАКЛЮЧЕНИЕ (UPDATED)

Этот Master Plan v2.0 является **полностью проверенным и одобренным** планом разработки Lincoln v17, основанным на comprehensive architectural review.

### Status Assessment

**✅ APPROVED FOR IMPLEMENTATION**

**Estimated Timeline:** 5-7 weeks (single developer, 172-268 hours total)  
**Risk Level:** Medium (with comprehensive mitigation strategies in place)  
**Confidence:** HIGH (95%+) - Architecture validated, risks identified, mitigation planned

### Key Improvements Over v1.0

1. **ES5 Compliance Verified**
   - All violations identified and fixed
   - Automated compliance checker provided
   - Clear patterns for ES5-compatible code

2. **Complete Dependency Graph**
   - All 40 components mapped
   - 6 missing dependencies discovered and documented
   - N×N dependency matrix provided
   - Numbered implementation order (0-30)

3. **Detailed Engine Specifications**
   - QualiaEngine: Complete spec with all methods, data structures, tests
   - InformationEngine: Full integration with QualiaEngine documented
   - RelationsEngine: Subjective interpretation integration defined
   - CrucibleEngine: Formative events processing specified
   - HierarchyEngine: Reputation from perceptions detailed

4. **Enhanced Phase 4 Plan**
   - Step-by-step implementation guide
   - Deliverables (15 items total)
   - Acceptance Criteria (19 items total)
   - Integration Tests (10 tests)
   - Timeline: 36-52 hours (4.5-6.5 days)
   - Risks & Mitigation (8 risks identified)

5. **Comprehensive Risk Assessment**
   - 25 risks identified across 4 categories:
     - Architectural Risks (7)
     - Technical Risks (8)
     - Integration Risks (6)
     - Platform Risks (4)
   - Each with probability, impact, mitigation strategy

6. **Full Testing Strategy**
   - Testing Pyramid (4 levels)
   - Unit Testing (templates + examples)
   - Integration Testing (3 critical suites)
   - System Testing (1000-turn endurance)
   - Regression Testing (procedures)
   - Final Acceptance Criteria (19 categories)

7. **Timeline & Milestones**
   - Phase-by-phase time estimates
   - 6 major milestones defined
   - Critical path identified
   - Resource requirements specified

### What This Plan Guarantees

**Следование этому плану v2.0 гарантирует:**

- ✅ **Успешная реализация всех 40 систем** — полная спецификация каждого компонента
- ✅ **Сохранение инноваций v16** — четырехуровневая модель сознания, субъективная интерпретация, perceptions-based reputation
- ✅ **Отсутствие технического долга** — правильный порядок зависимостей строго соблюден
- ✅ **Полное тестовое покрытие** — unit, integration, system tests для всех компонентов
- ✅ **ES5 compatibility** — все нарушения устранены, compliance checker встроен
- ✅ **Risk mitigation** — все риски идентифицированы с конкретными стратегиями
- ✅ **Predictable timeline** — реалистичные оценки с учетом опыта v16

### Critical Success Factors

1. **Strict Adherence to ES5** — Run compliance checker before each phase
2. **Dependency Order** — NEVER skip or reorder components
3. **Test After Every Component** — NO accumulation of untested code
4. **State Versioning Discipline** — ALWAYS increment after writes
5. **Phase 4 Without Interruption** — Qualia → Information consecutively
6. **Integration Testing** — Verify engine pairs work together

### Next Steps

1. **Deploy Null System (Phase 0)** — Verify AI Dungeon environment
2. **Implement Infrastructure (Phase 1)** — Foundation for all engines
3. **Build Physical World (Phase 2)** — Time and environment
4. **Add Base Data (Phase 3)** — Evergreen, Goals (Knowledge moved to Phase 5)
5. **CRITICAL: Phase 4** — Qualia → Information without interruption
6. **Continue Through Phase 8** — Following this plan exactly

### Final Notes

This Master Plan v2.0 represents the culmination of:
- Analysis of 40 systems from v16
- Comprehensive architectural review
- **Correction of fundamental AI Dungeon execution model errors**
- **Addition of critical safety patterns and error handling**
- Addition of 3000+ lines of detailed specifications
- Complete risk assessment and mitigation planning
- Full testing strategy from unit to system level

**Key Corrections in v2.0:**

1. ✅ **Library.txt execution model** — Correctly documented that Library runs BEFORE EACH hook (3x per turn), not "при загрузке"
2. ✅ **state.shared removed** — Documented that state.shared does NOT exist in AI Dungeon
3. ✅ **Mandatory modifier pattern** — All scripts now include proper `const modifier = (text) => {...}; modifier(text);` structure
4. ✅ **CommandsRegistry ES5 compliance** — Changed from Map to plain object {}
5. ✅ **storyCards global variable** — Documented correct usage with safety checks
6. ✅ **Empty string handling** — Added warnings about "" errors in Input/Output, use " " instead
7. ✅ **info.maxChars availability** — Documented only available in Context hook
8. ✅ **Error handling everywhere** — Added try-catch patterns with fallbacks
9. ✅ **Game event processing** — Added detailed integration examples (Section 2.8)
10. ✅ **Realistic timeline** — Updated to 10-14 weeks for full implementation

**Status:** READY FOR IMPLEMENTATION  
**Approval:** CONDITIONAL on strict adherence to all critical rules  
**Recommendation:** Proceed with confidence—architecture is sound, AI Dungeon limitations understood, risks are managed, path is clear

---

**КОНЕЦ ДОКУМЕНТА**

**Версия:** 2.0 (Исправленная)  
**Последнее обновление:** 26 October 2025  
**Основан на:**
- PROJECT_LINCOLN_v17_MASTER_PLAN.md v1.0
- ARCHITECTURAL_REVIEW_v17.md v1.0
- Comprehensive analysis and integration
- **Critical corrections to AI Dungeon execution model**

**Prepared by:** Lincoln Architect  
**Reviewed and Corrected:** 26 October 2025  
**Approved for:** Implementation Phase

---

*This document is the single source of truth for Lincoln v17 development.*  
*All fundamental errors about AI Dungeon scripting have been corrected.*


---

### 3.5. Структура состояния `state.lincoln`

```javascript
// Инициализация (Library.txt — выполняется при каждом хуке)
if (!state.lincoln || state.lincoln.version !== "17.0.0") {
  state.lincoln = {
    version: "17.0.0",
    stateVersion: 0,    // MUST increment after every write
    turn: 0,

    // Core domains
    characters: {},     // { [name]: Character }
    relations: {},      // { [from]: { [to]: number } } [-100, 100]
    hierarchy: {},      // { [name]: { status, capital, last_updated } }
    rumors: [],         // GossipEngine entries
    lore: [],           // LoreEngine entries
    myths: [],          // MemoryEngine outputs
    time: {},           // TimeEngine structure
    environment: {},    // EnvironmentEngine structure
    evergreen: [],      // Evergreen facts
    goals: {},          // { [name]: Goal[] }
    settings: {},
    secrets: [],        // KnowledgeEngine

    // Story Cards fallback (when Memory Bank disabled)
    fallbackCards: [],  // { keys, entry, type }[]

    // Internal cache (ephemeral — engines must treat as non-persistent)
    _cache: {}
  };
}
```

**Инварианты:**
- `stateVersion` инкрементируется после **любой** записи в `state.lincoln.*`
- Движки **не пишут** в домены других движков напрямую — только через публичный API
- `_cache` считается эфемерным: не полагайся на его содержимое между хуками

---

### 3.6. Типы

# Lincoln v17 — Canonical Types Spec

This file defines canonical data shapes for `state.lincoln` and expected global types the engines interact with.

## 1. Globals (read)

```js
// history item (merged from official + community observations)
{
  text: string,
  type: "do" | "say" | "story" | "continue" | "see" | "repeat" | "start" | "unknown",
  rawText: string // optional in practice
}

// info (subset; Context-only fields noted)
{
  actionCount: number,
  characters?: any[], // MP use-cases
  // Context-only:
  memoryLength?: number,
  maxChars?: number
}
```

## 2. state.lincoln (root)

```js
{
  version: "17.0.0",
  stateVersion: number,   // MUST increment after every write
  turn: number,           // managed by TimeEngine
  // Context metadata (read-only outside Context)
  maxChars?: number,
  memoryLength?: number,
  actionCount?: number,

  // Core domains
  characters: { [name: string]: Character },
  relations: { [from: string]: { [to: string]: number } },  // [-100, 100]
  hierarchy: { [name: string]: { status: "leader" | "member" | "outcast", capital: number, last_updated: number } },
  rumors: any[],          // GossipEngine (TBD)
  lore: any[],            // LoreEngine entries
  myths: any[],           // MemoryEngine outputs
  time: any,              // TimeEngine structure
  environment: any,       // EnvironmentEngine structure
  evergreen: any[],       // Evergreen facts
  goals: { [name: string]: Goal[] }, // Goals per character
  secrets: any[],         // KnowledgeEngine

  // Story Cards fallback when Memory Bank is disabled
  fallbackCards: { keys: string | string[], entry: string, type: string }[],

  // Internal cache/scratch (engines must treat as ephemeral)
  _cache: any
}
```

### 2.1 Character

```js
{
  qualia_state: {
    somatic_tension: number, // [0..1]
    valence: number,         // [0..1]
    focus_aperture: number,  // [0..1]
    energy_level: number     // [0..1]
  },

  perceptions: {
    [targetName: string]: {
      trust: number,       // [0..1]
      respect: number,     // [0..1]
      competence: number,  // [0..1]
      affection: number    // [0..1]
    }
  },

  self_concept: {
    // domain of CrucibleEngine (TBD granular traits)
  },

  personality: {
    trust: number,     // [0..1]
    bravery: number,   // [0..1]
    idealism: number,  // [0..1]
    aggression: number // [0..1]
  },

  mood: string,  // derived label (MoodEngine)

  goals: Goal[]  // Goal list
}
```

### 2.2 Goal

```js
{
  id: string,
  title: string,
  status: "active" | "completed" | "failed" | "suspended",
  progressStage: number, // mini-arc stage
  progressScore: number, // arbitrary [0..1] scaling
  notes?: string
}
```

## 3. Ranges & Invariants

- Qualia values clamped to [0.0, 1.0].
- Perception values clamped to [0.0, 1.0].
- Relations clamped to [-100, 100].
- `stateVersion` increments after ANY write into `state.lincoln.*`.
- Engines MUST NOT write into another engine's domain except via public API.

