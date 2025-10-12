# Project Simulacrum - Test Harness

Эмулятор среды выполнения AI Dungeon для локального тестирования игровых скриптов Lincoln Heights.

## Обзор

Test Harness эмулирует окружение AI Dungeon, позволяя загружать и выполнять игровые скрипты (`Input.js`, `Output.js`, `Context.js`, `Library.js`) в изолированной среде Node.js. Это позволяет писать автоматизированные тесты для проверки корректности работы скриптов без необходимости запуска полноценной игры.

## Возможности

- ✅ **Эмуляция глобального состояния**: Создаёт mock-объекты `state`, `history`, `worldInfo`, `info`
- ✅ **Загрузка скриптов**: Читает и выполняет файлы игровых скриптов
- ✅ **Симуляция жизненного цикла**: Имитирует полный игровой ход (Input → Context → Output)
- ✅ **Пользовательские действия**: Эмулирует действия UI (Say, Retry, Continue, Erase)
- ✅ **Сброс состояния**: Очистка всех переменных между тестами

## Установка

Harness не требует дополнительных зависимостей, только Node.js:

```bash
# Перейдите в директорию simulacrum
cd simulacrum

# Запустите тест для проверки работоспособности
node tests/test_harness_basic.js
```

## Быстрый старт

### Базовое использование

```javascript
const path = require('path');
const harness = require('./test_harness.js');

// 1. Загрузите скрипты
harness.loadScript(path.join(__dirname, '..', 'Library v16.0.8.patched.txt'));
harness.loadScript(path.join(__dirname, '..', 'Input v16.0.8.patched.txt'));
harness.loadScript(path.join(__dirname, '..', 'Context v16.0.8.patched.txt'));
harness.loadScript(path.join(__dirname, '..', 'Output v16.0.8.patched.txt'));

// 2. Установите начальную память (опционально)
harness.setMemory("Максим и Хлоя — старшеклассники Lincoln Heights High School.");

// 3. Выполните игровой ход
const result = harness.performSay("Максим подошёл к Хлое.");

// 4. Проверьте результат
console.log("Context:", result.context);
console.log("Output:", result.output);
console.log("Turn number:", harness.getState().turn);
```

## API Reference

### Загрузка скриптов

#### `harness.loadScript(filePath)`

Загружает игровой скрипт из файла.

**Параметры:**
- `filePath` (string): Путь к файлу скрипта

**Возвращает:** `boolean` - `true` если загрузка успешна

**Пример:**
```javascript
harness.loadScript('/path/to/Library v16.0.8.patched.txt');
```

**Примечание:** Library.js должен быть загружен первым, так как он определяет глобальный объект `LC`.

### Выполнение игровых ходов

#### `harness.executeTurn(inputText, [aiResponse])`

Симулирует полный игровой ход: Input → Context → Output.

**Параметры:**
- `inputText` (string): Текст пользовательского ввода
- `aiResponse` (string, опционально): Симулированный ответ AI

**Возвращает:** `object` с полями:
- `stopped` (boolean): `true` если выполнение остановлено командой
- `commandOutput` (string): Вывод команды (если `stopped === true`)
- `context` (string): Сгенерированный контекст для AI
- `output` (string): Обработанный вывод
- `aiResponse` (string): Ответ AI (симулированный или переданный)

**Пример:**
```javascript
const turn = harness.executeTurn(
  "Максим улыбнулся.",
  "Хлоя ответила на его улыбку."
);

console.log(turn.context);  // Контекст, который получит AI
console.log(turn.output);   // Финальный обработанный вывод
```

### Симуляция пользовательских действий

#### `harness.performSay(text)`

Симулирует обычный игровой ввод (кнопка "Say" в UI).

**Параметры:**
- `text` (string): Текст действия игрока

**Возвращает:** `object` - результат хода (см. `executeTurn`)

**Пример:**
```javascript
const result = harness.performSay("Максим вошёл в класс.");
```

#### `harness.performRetry()`

Симулирует действие "Retry" (переделать последний ход).

**Возвращает:** `object` - результат хода

**Эффект:**
- Удаляет последнюю запись из `history`
- Устанавливает `currentAction.type = 'retry'`
- Перевыполняет последний ход

**Пример:**
```javascript
const retry = harness.performRetry();
```

#### `harness.performContinue()`

Симулирует действие "Continue" (продолжить повествование).

**Возвращает:** `object` - результат хода

**Эффект:**
- Не изменяет `history`
- Устанавливает `currentAction.type = 'continue'`
- Запрашивает продолжение текста от AI

**Пример:**
```javascript
const continuation = harness.performContinue();
```

#### `harness.performErase()`

Симулирует действие "Erase" (удалить последний ход).

**Возвращает:** `boolean` - `true` если запись была удалена

**Эффект:**
- Удаляет последнюю запись из `history`
- Уменьшает счётчик `info.actionCount`
- Уменьшает `turn` (если существует)

**Пример:**
```javascript
const erased = harness.performErase();
if (erased) {
  console.log("Last entry removed");
}
```

### Доступ к состоянию

#### `harness.getState()`

Возвращает объект состояния Lincoln (`state.lincoln`).

**Возвращает:** `object` - Lincoln state

**Пример:**
```javascript
const L = harness.getState();
console.log("Turn:", L.turn);
console.log("Characters:", L.characters);
```

#### `harness.getHistory()`

Возвращает массив истории действий.

**Возвращает:** `array` - история

**Пример:**
```javascript
const history = harness.getHistory();
console.log("History length:", history.length);
```

#### `harness.getWorldInfo()`

Возвращает массив записей World Info.

**Возвращает:** `array` - world info

#### `harness.getLastContext()`

Возвращает последний сгенерированный контекст.

**Возвращает:** `string` - контекст

#### `harness.getLastAIResponse()`

Возвращает последний ответ AI.

**Возвращает:** `string` - ответ AI

### Управление состоянием

#### `harness.reset()`

Сбрасывает все глобальные переменные и внутреннее состояние harness.

**Эффект:**
- Очищает `state`, `history`, `worldInfo`, `info`
- Сбрасывает загруженные скрипты
- Очищает кэши

**Пример:**
```javascript
// Между тестами
harness.reset();

// Перезагрузите скрипты
harness.loadScript('...');
```

#### `harness.setMemory(frontMemory, [authorsNote])`

Устанавливает начальную память (Remember/A/N).

**Параметры:**
- `frontMemory` (string): Front Memory текст
- `authorsNote` (string, опционально): Author's Note текст

**Пример:**
```javascript
harness.setMemory(
  "Максим — капитан баскетбольной команды.",
  "Жанр: школьная драма"
);
```

#### `harness.addWorldInfo(entry)`

Добавляет запись в World Info.

**Параметры:**
- `entry` (object): Объект записи World Info

**Пример:**
```javascript
harness.addWorldInfo({
  keys: "Хлоя, Chloe",
  entry: "Хлоя — умная и остроумная девушка.",
  worldInfoId: "char_chloe"
});
```

## Примеры использования

### Пример 1: Тест базовой функциональности

```javascript
const path = require('path');
const harness = require('./test_harness.js');

// Загрузка скриптов
harness.loadScript(path.join(__dirname, '..', 'Library v16.0.8.patched.txt'));
harness.loadScript(path.join(__dirname, '..', 'Input v16.0.8.patched.txt'));
harness.loadScript(path.join(__dirname, '..', 'Context v16.0.8.patched.txt'));
harness.loadScript(path.join(__dirname, '..', 'Output v16.0.8.patched.txt'));

// Тест 1: Проверка генерации контекста
const turn1 = harness.performSay("Максим улыбнулся.");
if (turn1.context.includes("⟦GUIDE⟧")) {
  console.log("✓ Context contains GUIDE tags");
} else {
  console.log("✗ Missing GUIDE tags");
}

// Тест 2: Проверка счётчика ходов
const L = harness.getState();
if (L.turn === 1) {
  console.log("✓ Turn counter incremented");
} else {
  console.log("✗ Turn counter incorrect:", L.turn);
}
```

### Пример 2: Тест команд

```javascript
// Тест команды /help
const helpResult = harness.performSay("/help");

if (helpResult.stopped) {
  console.log("✓ Command stopped execution");
  console.log("Help output:", helpResult.commandOutput);
} else {
  console.log("✗ Command should have stopped");
}
```

### Пример 3: Тест retry/continue

```javascript
// Выполните несколько ходов
harness.performSay("Действие 1");
harness.performSay("Действие 2");
harness.performSay("Действие 3");

const historyBefore = harness.getHistory().length;

// Retry должен удалить последний ход
harness.performRetry();

const historyAfter = harness.getHistory().length;

if (historyAfter === historyBefore - 1) {
  console.log("✓ Retry removed last entry");
} else {
  console.log("✗ History not updated correctly");
}
```

### Пример 4: Тест состояния персонажей

```javascript
// Загрузите скрипты...

// Выполните действия, которые должны изменить состояние
harness.performSay("Максим обнял Хлою.");
harness.performSay("Хлоя улыбнулась ему.");

// Проверьте состояние
const L = harness.getState();

if (L.evergreen && L.evergreen.relations) {
  const relation = L.evergreen.relations['Максим']?. ['Хлоя'] || 0;
  console.log("Relation value:", relation);
  
  if (relation > 0) {
    console.log("✓ Positive interaction increased relation");
  }
}
```

## Структура директорий

```
simulacrum/
├── test_harness.js          # Основной модуль harness
└── tests/
    ├── test_harness_basic.js  # Базовый тест валидации
    └── demo_harness.js        # Демонстрация возможностей
```

## Технические детали

### Эмулированные глобальные переменные

```javascript
global.state = {
  lincoln: { /* Lincoln state */ },
  memory: {
    frontMemory: "",
    authorsNote: ""
  }
};

global.history = [
  { type: 'action', text: '...', message: '...' }
];

global.worldInfo = [
  { keys: '...', entry: '...', worldInfoId: '...' }
];

global.info = {
  actionCount: 0,
  characters: []
};
```

### Порядок выполнения хода

1. **Input Phase**: `_executeInput(inputText)`
   - Выполняет Input modifier
   - Обрабатывает команды
   - Добавляет запись в history
   - Возвращает `{ text, stop }`

2. **Context Phase**: `_executeContext(upstreamText)`
   - Выполняет Context modifier
   - Генерирует контекст для AI
   - Возвращает `{ text }`

3. **AI Response**: (симулируется или передаётся как параметр)

4. **Output Phase**: `_executeOutput(aiResponse)`
   - Выполняет Output modifier
   - Обрабатывает вывод AI
   - Обновляет состояние
   - Возвращает `{ text }`

### Особенности реализации

- **Обёртка скриптов**: Скрипты оборачиваются в IIFE для корректной обработки `return` statements
- **Изоляция**: Каждый вызов выполняется в текущем контексте с доступом к глобальным переменным
- **Версионный конфликт**: Harness устанавливает `_versionCheckDone = true` для предотвращения бесконечной рекурсии при проверке версий
- **Library первым**: Library.js всегда выполняется первым при загрузке для инициализации `LC`

## Ограничения

- **Eval**: Использует `eval()` для выполнения скриптов (безопасно в тестовом окружении)
- **Синхронность**: Все операции синхронные, асинхронные операции не поддерживаются
- **Изоляция**: Скрипты выполняются в общем контексте, не полностью изолированы
- **AI ответы**: Требуется ручная передача симулированных AI ответов

## Расширение

Для добавления новых функций:

1. Добавьте метод в класс `TestHarness`
2. Документируйте в JSDoc
3. Добавьте тест в `test_harness_basic.js`
4. Обновите README

## Поддержка

При возникновении проблем:

1. Запустите `node tests/test_harness_basic.js` для диагностики
2. Проверьте, что все скрипты загружены в правильном порядке
3. Убедитесь, что используется последняя версия скриптов

## Лицензия

Часть проекта Lincoln Heights. См. основной README репозитория.
