# Инструкции для разработки скриптов AI Dungeon

## Обзор системы

AI Dungeon - это текстовая игра на основе ИИ, которая использует Large Language Models (LLM) для генерации интерактивных историй. Скрипты позволяют программировать дополнительную логику и механики поверх базового AI.

## Архитектура скриптов

### Три типа модификаторов

Скрипты в AI Dungeon делятся на три категории, каждая выполняется в определенный момент:

1. **Input Modifier** - выполняется перед отправкой ввода игрока в AI
   - Модифицирует текст пользователя перед обработкой
   - Может полностью изменить или дополнить команду игрока
   - Полезен для обработки команд, парсинга специального синтаксиса

2. **Context Modifier** - выполняется перед генерацией ответа AI
   - Модифицирует контекст, отправляемый в модель
   - Может изменять память, недавние действия, заметки автора
   - Может вернуть `stop: true` для прекращения обработки
   - **НЕ влияет** на отображаемый игроку текст истории

3. **Output Modifier** - выполняется после генерации ответа AI
   - Модифицирует вывод модели перед показом игроку
   - Может изменять, фильтровать или расширять ответ AI
   - Последний шанс изменить то, что увидит пользователь

### Обязательная структура скрипта

```javascript
const modifier = (text) => {
  // Ваш код здесь
  
  // КРИТИЧНО: ВСЕГДА возвращайте объект с полем text
  return { text };
}

// ОБЯЗАТЕЛЬНО: вызов функции в конце
modifier(text);
```

**КРИТИЧЕСКИ ВАЖНО:**
- Каждый модификатор ДОЛЖЕН содержать функцию `modifier`
- Функция ДОЛЖНА принимать параметр `text`
- Функция ДОЛЖНА **ВСЕГДА** возвращать объект `{ text }`
  - Даже если text не изменился, ВЕРНИТЕ его: `return { text };`
  - БЕЗ return скрипт НЕ БУДЕТ РАБОТАТЬ!
- В конце ДОЛЖЕН быть вызов `modifier(text)`

## Глобальные объекты и API

### Глобальные параметры модификатора

Следующие параметры **доступны глобально** внутри функции `modifier` без явной передачи:

```javascript
const modifier = (text) => {
  // ✅ Эти параметры доступны БЕЗ передачи в аргументах:
  
  text        // Текущий текст (input/context/output в зависимости от типа модификатора)
  state       // Персистентное хранилище
  info        // Метаданные (info.actionCount, info.maxChars, и т.д.)
  history     // История действий игрока
  storyCards  // Глобальный массив Story Cards (World Info)
  
  return { text };
};

modifier(text);
```

**НЕ НУЖНО** передавать их в параметрах:
```javascript
// ❌ НЕПРАВИЛЬНО
const modifier = (text, state, info) => { ... }

// ✅ ПРАВИЛЬНО
const modifier = (text) => { 
  // state, info, history, storyCards доступны глобально
  console.log(state.myVar);
  console.log(info.actionCount);
}
```

### Объект `state`

```javascript
state.variableName = value  // Сохранение данных
```

- Персистентное хранилище между вызовами функций
- Сохраняется на протяжении всей игровой сессии
- Используется для отслеживания пользовательских переменных
- `state.message` - строка для отображения алерта в игре

### Объект `info`

Содержит контекстную информацию в зависимости от модификатора:

```javascript
info.memoryLength          // Длина памяти
info.maxChars             // Максимум символов для контекста
info.actionCount          // Счетчик действий
info.characters           // Массив персонажей (мультиплеер)
                          // Формат: [{ name: "Sam" }]
```

### Story Cards API (World Info)

**⚠️ ВАЖНО:** Story Cards НЕ работают, когда "Memory Bank" выключен в настройках сценария (известный баг AI Dungeon).

#### Встроенные функции AI Dungeon

AI Dungeon предоставляет **три встроенные функции**. **НЕ создавайте их вручную!**

```javascript
// ВСТРОЕННАЯ ФУНКЦИЯ - уже существует в AI Dungeon!
addStoryCard(keys, entry, type)
// Возвращает: новую длину массива storyCards, или false если карта с такими keys уже существует

// ВСТРОЕННАЯ ФУНКЦИЯ - уже существует в AI Dungeon!
updateStoryCard(index, keys, entry, type)
// Бросает Error, если карта не существует по указанному индексу

// ВСТРОЕННАЯ ФУНКЦИЯ - уже существует в AI Dungeon!
removeStoryCard(index)
// Бросает Error, если карта не существует по указанному индексу
```

#### Доступ к Story Cards

Story Cards хранятся в **глобальном массиве `storyCards`** (НЕ в `state.storyCards`!):

```javascript
const modifier = (text) => {
  // ✅ ПРАВИЛЬНО - используем глобальный массив
  const allCards = storyCards;
  
  // ✅ Поиск карты
  const card = storyCards.find(c => c.keys.includes("dragon"));
  
  // ✅ Получение индекса
  const index = storyCards.findIndex(c => c.keys.toLowerCase().includes("reputation"));
  
  // ❌ НЕПРАВИЛЬНО - state.storyCards НЕ существует!
  // const cards = state.storyCards;  // ОШИБКА!
  
  return { text };
};

modifier(text);
```

#### Структура Story Card

```javascript
{
  keys: "ключ1, ключ2",      // Триггерные ключевые слова
  entry: "Описание...",      // Содержимое записи
  type: "character",         // Тип: character, location, class, race, faction, etc.
  id: "auto-generated",      // Автоматически генерируется движком
  title: "auto-set"          // Обычно совпадает с keys
}
```

#### Безопасная работа с Story Cards

```javascript
const modifier = (text) => {
  // Поиск существующей карты
  const index = storyCards.findIndex(c => 
    c.keys.toLowerCase().includes("reputation")
  );
  
  if (index >= 0) {
    // Обновляем существующую карту (встроенная функция)
    updateStoryCard(index, "reputation", "Новая репутация: +50", "character");
  } else {
    // Создаем новую карту (встроенная функция)
    addStoryCard("reputation", "Начальная репутация: 0", "character");
  }
  
  // Для проекта Lincoln: инвалидация кэша
  if (state.lincoln) {
    state.lincoln.stateVersion++;
  }
  
  return { text };  // ОБЯЗАТЕЛЬНО!
};

modifier(text);
```

#### Вспомогательные функции (опционально)

Вы можете создать helper-функции для удобства работы:

```javascript
const modifier = (text) => {
  // Helper: безопасный поиск индекса карты
  function findCardIndex(searchKeys) {
    return storyCards.findIndex(card => 
      card.keys.toLowerCase().includes(searchKeys.toLowerCase())
    );
  }
  
  // Helper: получить или создать карту
  function getOrCreateCard(keys, entry, type) {
    type = type || "character";
    const index = findCardIndex(keys);
    
    if (index >= 0) {
      return { index: index, card: storyCards[index] };
    }
    
    // Создаем новую карту через встроенную функцию
    addStoryCard(keys, entry, type);
    
    // Рекурсивно находим только что созданную
    return getOrCreateCard(keys, entry, type);
  }
  
  // Использование helper-функций
  const repCard = getOrCreateCard("reputation", "Репутация: 0");
  updateStoryCard(repCard.index, "reputation", "Репутация: +10", "character");
  
  return { text };
};

modifier(text);
```

#### Критические правила для Story Cards

1. ✅ **Всегда используйте глобальный `storyCards`**, а НЕ `state.storyCards`
2. ✅ **Проверяйте существование** перед вызовом `updateStoryCard` или `removeStoryCard`
3. ✅ **`updateStoryCard` НЕ создает новые карты** - только обновляет существующие
4. ✅ **Memory Bank должен быть включен** в настройках сценария
5. ✅ **Используйте встроенные функции**, НЕ создавайте свои реализации
6. ✅ **Инкрементируйте `state.lincoln.stateVersion++`** после изменений (для проекта Lincoln)

### Работа с памятью

```javascript
const modifier = (text) => {
  // Чтение памяти (доступно в Context Modifier)
  const memory = state.memory || "";
  
  // Модификация памяти
  const newMemory = memory + "\nДополнительная информация";
  
  return { text, memory: newMemory };
};

modifier(text);
```

### Логирование и отладка

```javascript
console.log("Сообщение для отладки");
console.log("Значение переменной:", state.myVariable);
```

**Просмотр логов:**
- Нажмите иконку "мозга" в интерфейсе скриптинга
- Вкладка "Script Logs & Errors" покажет console.log и ошибки
- Вкладка "Last Model Input" покажет последний контекст AI

## Ограничения и правила

### Ограничения JavaScript среды

AI Dungeon использует **виртуальную JS среду** с ограничениями:

❌ **НЕ ПОДДЕРЖИВАЕТСЯ:**
- ES6+ конструкции: `Map`, `Set`, `WeakMap`, `WeakSet`
- `async/await`, `Promise`
- `fetch`, `XMLHttpRequest` (внешние API недоступны)
- `eval()` (запрещен из соображений безопасности)
- Модули: `import`, `require`
- DOM манипуляции
- Файловые операции

✅ **ПОДДЕРЖИВАЕТСЯ:**
- ES5 JavaScript + стрелочные функции
- Базовые конструкции: `if`, `for`, `while`, `function`, `const`, `let`
- Array методы: `map`, `filter`, `forEach`, `find`, `findIndex`, `reduce`
- Object методы: `Object.keys`, `Object.values`, `Object.assign`
- String методы: `includes`, `split`, `replace`, `toLowerCase`, `trim`
- `Math`, `JSON`, `Date` (базовые функции)
- Стрелочные функции: `const fn = () => {}`

**Рекомендация:** Используйте ES5-совместимый код или простые конструкции для максимальной совместимости.

### Ограничения безопасности

1. **Запрещенные функции JavaScript:**
   - `eval()` - запрещен
   - Доступ к внешним API - ограничен
   - Манипуляции с DOM - недоступны
   - Файловые операции - недоступны

2. **Ограничения на размер:**
   - Контекст имеет максимальную длину (см. `info.maxChars`)
   - Большие скрипты могут влиять на производительность

3. **Устаревшие функции:**
   - `isNotHidden` - больше не работает
   - `addWorldEntry`, `updateWorldEntry`, `removeWorldEntry` - устарели, используйте Story Cards API

### Важные особенности поведения

1. **`updateStoryCard` больше НЕ создает новые записи**
   - Старые скрипты, полагавшиеся на это, сломаются
   - Появится ошибка: "Story card not found at index xyz"
   - Всегда проверяйте существование перед обновлением

2. **Context Modifier может остановить обработку:**
   ```javascript
   return { text, stop: true };
   ```

3. **Порядок выполнения критичен:**
   - Input → Context → AI генерация → Output

4. **Используйте обычные объекты вместо Map/Set:**
   ```javascript
   // ❌ НЕПРАВИЛЬНО - Map не поддерживается
   const commands = new Map();
   
   // ✅ ПРАВИЛЬНО - обычный объект
   const commands = {};
   commands['/help'] = function() { ... };
   ```

## Паттерны и лучшие практики

### Инициализация state

```javascript
const modifier = (text) => {
  // Инициализация при первом запуске
  if (typeof state.initialized === 'undefined') {
    state.initialized = true;
    state.playerStats = {
      health: 100,
      mana: 50,
      level: 1
    };
    console.log("Скрипт инициализирован");
  }
  
  return { text };
};

modifier(text);
```

### Парсинг команд в Input Modifier

```javascript
const modifier = (text) => {
  // Обработка специальных команд
  if (text.toLowerCase().startsWith("/stats")) {
    const stats = state.playerStats || {};
    state.message = "HP: " + stats.health + ", Mana: " + stats.mana + ", Level: " + stats.level;
    
    // Заменяем команду на нейтральное действие
    text = "Вы проверяете свои характеристики.";
  }
  
  return { text };
};

modifier(text);
```

### Модификация контекста в Context Modifier

```javascript
const modifier = (text) => {
  var modifiedText = text;
  var memory = state.memory || "";
  
  // Добавление динамической информации в контекст
  if (state.inCombat) {
    memory += "\n[Вы находитесь в бою!]";
  }
  
  // Можно остановить генерацию при необходимости
  if (state.blockAI) {
    return { text: modifiedText, stop: true };
  }
  
  return { text: modifiedText, memory: memory };
};

modifier(text);
```

### Пост-обработка в Output Modifier

```javascript
const modifier = (text) => {
  // Фильтрация нежелательного контента
  var filteredText = text.replace(/запрещенноеСлово/gi, "***");
  
  // Добавление визуальных эффектов
  if (filteredText.includes("магия")) {
    filteredText = "✨ " + filteredText + " ✨";
  }
  
  // Обновление статистики на основе вывода
  if (filteredText.includes("получаете урон")) {
    state.playerStats = state.playerStats || { health: 100 };
    state.playerStats.health -= 10;
  }
  
  return { text: filteredText };
};

modifier(text);
```

### Система RPG статистики с Story Cards

```javascript
const modifier = (text) => {
  // Инициализация
  if (!state.stats) {
    state.stats = {
      strength: 10,
      dexterity: 10,
      intelligence: 10,
      hp: 100,
      maxHp: 100
    };
    
    // Создаем Story Card через встроенную функцию
    addStoryCard(
      "характеристики, статистика",
      "Сила: " + state.stats.strength + ", Ловкость: " + state.stats.dexterity + 
      ", Интеллект: " + state.stats.intelligence + "\nЗдоровье: " + state.stats.hp + 
      "/" + state.stats.maxHp,
      "character"
    );
  }
  
  // Обработка команды /levelup
  if (text.toLowerCase() === "/levelup") {
    state.stats.strength += 2;
    state.stats.maxHp += 10;
    state.stats.hp = state.stats.maxHp;
    
    // Ищем существующую Story Card
    var statsIndex = storyCards.findIndex(function(card) {
      return card.keys.toLowerCase().includes("характеристики");
    });
    
    if (statsIndex >= 0) {
      // Обновляем через встроенную функцию
      updateStoryCard(
        statsIndex,
        "характеристики, статистика",
        "Сила: " + state.stats.strength + ", Ловкость: " + state.stats.dexterity + 
        ", Интеллект: " + state.stats.intelligence + "\nЗдоровье: " + state.stats.hp + 
        "/" + state.stats.maxHp,
        "character"
      );
    }
    
    text = "Вы чувствуете прилив сил! Ваш уровень повысился.";
  }
  
  return { text };
};

modifier(text);
```

## Отладка и тестирование

### Стратегия отладки

1. **Используйте console.log обильно:**
   ```javascript
   console.log("=== Начало модификатора ===");
   console.log("Входной текст:", text);
   console.log("Текущий state:", JSON.stringify(state));
   console.log("=== Конец модификатора ===");
   ```

2. **Проверяйте существование данных:**
   ```javascript
   if (!state.myVariable) {
     console.log("ВНИМАНИЕ: myVariable не инициализирована");
     state.myVariable = defaultValue;
   }
   ```

3. **Обработка ошибок:**
   ```javascript
   try {
     // Потенциально опасный код
     var result = complexOperation();
   } catch (error) {
     console.log("ОШИБКА:", error.message);
     // Безопасное восстановление
   }
   ```

### Тестирование скрипта

1. Создайте тестовый сценарий с вашим скриптом
2. Начните приключение из этого сценария
3. Тестируйте различные входы и команды
4. Проверяйте логи в интерфейсе "мозга"
5. Проверяйте "Last Model Input" для контекстного модификатора

## Комбинирование скриптов

При использовании нескольких скриптов одновременно:

1. **Каждый модификатор должен содержать только ОДИН блок:**
   ```javascript
   const modifier = (text) => {
     // Весь код здесь
     return { text };
   };
   modifier(text);
   ```

2. **НЕ дублируйте структуру:**
   ```javascript
   // ❌ НЕПРАВИЛЬНО - два блока modifier
   const modifier = (text) => {
     // Скрипт 1
     return { text };
   };
   modifier(text);
   
   const modifier = (text) => {  // ❌ Конфликт!
     // Скрипт 2
     return { text };
   };
   modifier(text);
   ```

3. **✅ ПРАВИЛЬНО - объединенный код:**
   ```javascript
   const modifier = (text) => {
     // Скрипт 1
     text = processScript1(text);
     
     // Скрипт 2
     text = processScript2(text);
     
     return { text };
   };
   modifier(text);
   ```

## Частые ошибки и решения

### 1. "modifier is not defined"
**Причина:** Отсутствует обязательная структура функции  
**Решение:** Убедитесь, что есть `const modifier = (text) => {...}` и `modifier(text)`

### 2. "Story card not found at index"
**Причина:** Попытка обновить несуществующую Story Card  
**Решение:** Всегда проверяйте существование перед обновлением:
```javascript
const index = storyCards.findIndex(c => c.keys === "reputation");
if (index >= 0) {
  updateStoryCard(index, ...);
}
```

### 3. Скрипт не влияет на игру
**Причина:** Забыли вернуть `{ text }`  
**Решение:** Всегда возвращайте объект: `return { text };`

### 4. "Map is not defined" или "Set is not defined"
**Причина:** Использование ES6+ конструкций, не поддерживаемых средой  
**Решение:** Используйте обычные объекты `{}` вместо `Map`, массивы `[]` вместо `Set`

### 5. State сбрасывается
**Причина:** State привязан к игровой сессии, а не к сценарию  
**Решение:** State сохраняется только в текущей игре

### 6. Слишком большой контекст
**Причина:** Добавление слишком много информации в память или Story Cards  
**Решение:** Контролируйте размер, используйте `info.maxChars`

## Специфика Проекта Lincoln

### Архитектура Lincoln v17

Вы работаете с проектом **Lincoln** — системой симуляции динамических социальных миров с четырехуровневой моделью сознания.

#### Ключевые Архитектурные Принципы

**1. Глобальный Объект LC**
```javascript
// Library скрипт
(function() {
  if (!state.shared) {
    state.shared = {};
  }
  
  // ES5-совместимая структура
  state.shared.LC = {
    Tools: {
      toNum: function(x, d) {
        d = d || 0;
        var num = Number(x);
        return (typeof num === 'number' && !isNaN(num)) ? num : d;
      },
      toStr: function(x) {
        return String(x == null ? "" : x);
      }
    },
    
    // Используем обычный объект вместо Map
    CommandsRegistry: {},
    
    lcInit: function() {
      if (!state.lincoln) {
        state.lincoln = {
          version: '17.0',
          turn: 0,
          stateVersion: 0,
          characters: {},
          relations: {},
          hierarchy: {}
        };
      }
      return state.lincoln;
    }
  };
})();
```

**2. Структура state.lincoln**
```javascript
state.lincoln = {
  // Управляемые данные
  characters: {},      // QualiaEngine, CrucibleEngine
  relations: {},       // RelationsEngine  
  hierarchy: {},       // HierarchyEngine
  rumors: [],          // GossipEngine
  goals: {},           // GoalsEngine
  secrets: [],         // KnowledgeEngine
  
  // Мета-данные
  turn: 0,
  time: {},
  environment: {},
  stateVersion: 0,     // Для кэширования
  _cache: {}
};
```

**3. Правила Взаимодействия Движков**

✅ **РАЗРЕШЕНО:**
- Вызывать публичные методы других движков через `LC`
- Читать/писать в `state.lincoln`
- Использовать утилиты из `LC.Tools`

❌ **ЗАПРЕЩЕНО:**
- Прямой доступ к приватным полям других движков
- Копирование логики из других движков
- Создание циклических зависимостей
- Использование `Map`, `Set` - только ES5 объекты и массивы

**Критические правила для Lincoln:**

1. ✅ **ВСЕГДА инкрементируйте `state.lincoln.stateVersion++`** после любого изменения `state.lincoln`
2. ✅ **Используйте обычные объекты `{}`** вместо `Map`
3. ✅ **Используйте массивы `[]`** вместо `Set`
4. ✅ **НЕ используйте `async/await`** - только синхронный код
5. ✅ **Всегда возвращайте `{ text }`** из модификаторов

### Пример правильного Input модификатора для Lincoln

```javascript
const modifier = (text) => {
  // Доступ к LC из state.shared
  var LC = state.shared && state.shared.LC;
  
  if (!LC) {
    return { text };  // ОБЯЗАТЕЛЬНО return!
  }

  // Инициализация Lincoln
  LC.lcInit();
  
  var rawText = LC.Tools.toStr(text).trim();

  // Обработка команд
  if (rawText.startsWith('/')) {
    var commandName = rawText.split(' ')[0].toLowerCase();
    
    // Используем обычный объект вместо Map
    if (LC.CommandsRegistry[commandName]) {
      LC.CommandsRegistry[commandName](rawText);
      text = "";  // Очищаем ввод для команд
    } else {
      state.message = 'Неизвестная команда: ' + commandName;
      text = "";
    }
  }

  // КРИТИЧНО: ВСЕГДА возвращаем { text }!
  return { text };
};

modifier(text);
```

## Заключение

При разработке для проекта Lincoln помните:

1. ✅ **return { text }** - КРИТИЧНО, ВСЕГДА возвращайте объект
2. ✅ **Глобальные параметры** - `text`, `state`, `info`, `history`, `storyCards` доступны без передачи
3. ✅ **Story Cards API** - используйте встроенные функции `addStoryCard`, `updateStoryCard`, `removeStoryCard`
4. ✅ **storyCards** - глобальный массив, НЕ `state.storyCards`
5. ✅ **ES5 код** - НЕ используйте `Map`, `Set`, `async/await`
6. ✅ **State versioning** - инкрементируйте `state.lincoln.stateVersion++` после изменений
7. ✅ **Тестирование** - после каждого изменения запускайте Script Test в игре

Удачи в создании живого, дышащего мира!
