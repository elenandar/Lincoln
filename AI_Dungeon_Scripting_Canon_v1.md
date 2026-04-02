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
