# Инструкции для разработки скриптов AI Dungeon

## Обзор системы

AI Dungeon - это текстовая игра на основе ИИ, которая использует Large Language Models (LLM) для генерации интерактивных историй. Скрипты позволяют модифицировать поведение игры через JavaScript.

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
  
  return { text }
}

modifier(text)
```

**КРИТИЧЕСКИ ВАЖНО:**
- Каждый модификатор ДОЛЖЕН содержать функцию `modifier`
- Функция ДОЛЖНА принимать параметр `text`
- Функция ДОЛЖНА возвращать объект с полем `text`
- В конце ДОЛЖЕН быть вызов `modifier(text)`

## Глобальные объекты и API

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

Story Cards - это система управления информацией о мире (ранее World Info).

#### Получение информации

```javascript
// Получить все Story Cards
const cards = state.storyCards || []

// Доступ к конкретной карте по индексу
const card = state.storyCards[index]
```

#### Структура Story Card

```javascript
{
  keys: "ключ1, ключ2",      // Триггерные ключевые слова
  entry: "Описание...",      // Содержимое записи
  type: "character"          // Тип: character, location, class, race, faction
}
```

#### Добавление Story Card

```javascript
const addStoryCard = (keys, entry, type) => {
  if (!state.storyCards) {
    state.storyCards = []
  }
  
  state.storyCards.push({
    keys: keys,
    entry: entry,
    type: type || "character"  // По умолчанию character
  })
}

// Пример использования
addStoryCard("дракон, змей", "Огнедышащий дракон древности", "character")
```

#### Обновление Story Card

```javascript
const updateStoryCard = (index, keys, entry, type) => {
  if (!state.storyCards || !state.storyCards[index]) {
    throw new Error(`Story card not found at index ${index}`)
  }
  
  state.storyCards[index] = {
    keys: keys,
    entry: entry,
    type: type || state.storyCards[index].type
  }
}

// Пример использования
updateStoryCard(0, "могучий дракон", "Легендарный дракон", "character")
```

#### Удаление Story Card

```javascript
const removeStoryCard = (index) => {
  if (!state.storyCards || !state.storyCards[index]) {
    throw new Error(`Story card not found at index ${index}`)
  }
  
  state.storyCards.splice(index, 1)
}
```

#### Поиск Story Card

```javascript
const findStoryCard = (searchKeys) => {
  if (!state.storyCards) return -1
  
  return state.storyCards.findIndex(card => 
    card.keys.toLowerCase().includes(searchKeys.toLowerCase())
  )
}
```

### Работа с памятью

```javascript
// Чтение памяти (из Context Modifier)
const memory = state.memory

// Модификация памяти
const newMemory = memory + "\nДополнительная информация"
return { text, memory: newMemory }
```

### Логирование и отладка

```javascript
console.log("Сообщение для отладки")
console.log("Значение переменной:", state.myVariable)
```

**Просмотр логов:**
- Нажмите иконку "мозга" в интерфейсе скриптинга
- Вкладка "Script Logs & Errors" покажет console.log и ошибки
- Вкладка "Last Model Input" покажет последний контекст AI

## Ограничения и правила

### Ограничения безопасности

1. **Запрещенные функции JavaScript:**
   - `eval()` - запрещен из соображений безопасности
   - Доступ к внешним API - ограничен
   - Манипуляции с DOM - недоступны
   - Файловые операции - недоступны

2. **Ограничения на размер:**
   - Контекст имеет максимальную длину (см. `info.maxChars`)
   - Большие скрипты могут влиять на производительность

3. **Устаревшие функции:**
   - `isNotHidden` - больше не работает (ранее скрывал World Info)
   - `addWorldEntry/updateWorldEntry` - устарели, используйте Story Cards API

### Важные особенности поведения

1. **updateStoryCard больше НЕ создает новые записи**
   - Старые скрипты, полагавшиеся на это, сломаются
   - Появится ошибка: "Story card not found at index xyz"
   - Всегда проверяйте существование перед обновлением

2. **Context Modifier может остановить обработку:**
   ```javascript
   return { text, stop: true }
   ```

3. **Порядок выполнения критичен:**
   - Input → Context → AI генерация → Output

## Паттерны и лучшие практики

### Инициализация state

```javascript
const modifier = (text) => {
  // Инициализация при первом запуске
  if (typeof state.initialized === 'undefined') {
    state.initialized = true
    state.playerStats = {
      health: 100,
      mana: 50,
      level: 1
    }
    console.log("Скрипт инициализирован")
  }
  
  return { text }
}

modifier(text)
```

### Парсинг команд в Input Modifier

```javascript
const modifier = (text) => {
  // Обработка специальных команд
  if (text.toLowerCase().startsWith("/stats")) {
    const stats = state.playerStats || {}
    state.message = `HP: ${stats.health}, Mana: ${stats.mana}, Level: ${stats.level}`
    
    // Заменяем команду на нейтральное действие
    text = "Вы проверяете свои характеристики."
  }
  
  return { text }
}

modifier(text)
```

### Модификация контекста в Context Modifier

```javascript
const modifier = (text) => {
  let modifiedText = text
  let memory = state.memory || ""
  
  // Добавление динамической информации в контекст
  if (state.inCombat) {
    memory += "\n[Вы находитесь в бою!]"
  }
  
  // Можно остановить генерацию при необходимости
  if (state.blockAI) {
    return { text: modifiedText, stop: true }
  }
  
  return { text: modifiedText, memory }
}

modifier(text)
```

### Пост-обработка в Output Modifier

```javascript
const modifier = (text) => {
  // Фильтрация нежелательного контента
  let filteredText = text.replace(/запрещенноеСлово/gi, "***")
  
  // Добавление визуальных эффектов
  if (filteredText.includes("магия")) {
    filteredText = "✨ " + filteredText + " ✨"
  }
  
  // Обновление статистики на основе вывода
  if (filteredText.includes("получаете урон")) {
    state.playerStats.health -= 10
  }
  
  return { text: filteredText }
}

modifier(text)
```

### Система RPG статистики

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
    }
    
    addStoryCard(
      "характеристики, статистика",
      `Сила: ${state.stats.strength}, Ловкость: ${state.stats.dexterity}, Интеллект: ${state.stats.intelligence}\nЗдоровье: ${state.stats.hp}/${state.stats.maxHp}`,
      "character"
    )
  }
  
  // Обработка команды /levelup
  if (text.toLowerCase() === "/levelup") {
    state.stats.strength += 2
    state.stats.maxHp += 10
    state.stats.hp = state.stats.maxHp
    
    // Обновляем Story Card
    const statsIndex = findStoryCard("характеристики")
    if (statsIndex >= 0) {
      updateStoryCard(
        statsIndex,
        "характеристики, статистика",
        `Сила: ${state.stats.strength}, Ловкость: ${state.stats.dexterity}, Интеллект: ${state.stats.intelligence}\nЗдоровье: ${state.stats.hp}/${state.stats.maxHp}`,
        "character"
      )
    }
    
    text = "Вы чувствуете прилив сил! Ваш уровень повысился."
  }
  
  return { text }
}

modifier(text)
```

## Отладка и тестирование

### Стратегия отладки

1. **Используйте console.log обильно:**
   ```javascript
   console.log("=== Начало модификатора ===")
   console.log("Входной текст:", text)
   console.log("Текущий state:", JSON.stringify(state))
   console.log("=== Конец модификатора ===")
   ```

2. **Проверяйте существование данных:**
   ```javascript
   if (!state.myVariable) {
     console.log("ВНИМАНИЕ: myVariable не инициализирована")
     state.myVariable = defaultValue
   }
   ```

3. **Обработка ошибок:**
   ```javascript
   try {
     // Потенциально опасный код
     const result = complexOperation()
   } catch (error) {
     console.log("ОШИБКА:", error.message)
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
     return { text }
   }
   modifier(text)
   ```

2. **НЕ дублируйте структуру:**
   ```javascript
   // ❌ НЕПРАВИЛЬНО - два блока modifier
   const modifier = (text) => {
     // Скрипт 1
     return { text }
   }
   modifier(text)
   
   const modifier = (text) => {  // ❌ Конфликт!
     // Скрипт 2
     return { text }
   }
   modifier(text)
   ```

3. **✅ ПРАВИЛЬНО - объединенный код:**
   ```javascript
   const modifier = (text) => {
     // Скрипт 1
     text = processScript1(text)
     
     // Скрипт 2
     text = processScript2(text)
     
     return { text }
   }
   modifier(text)
   ```

## Примеры реальных применений

### 1. Система инвентаря

```javascript
const modifier = (text) => {
  if (!state.inventory) {
    state.inventory = []
  }
  
  // Команда добавления предмета
  const addMatch = text.match(/\/add\s+(.+)/i)
  if (addMatch) {
    const item = addMatch[1]
    state.inventory.push(item)
    state.message = `Добавлено: ${item}`
    text = `Вы кладете ${item} в свою сумку.`
  }
  
  // Команда просмотра инвентаря
  if (text.toLowerCase() === "/inventory") {
    if (state.inventory.length === 0) {
      state.message = "Инвентарь пуст"
    } else {
      state.message = "Инвентарь: " + state.inventory.join(", ")
    }
    text = "Вы проверяете свою сумку."
  }
  
  return { text }
}

modifier(text)
```

### 2. Система случайных событий

```javascript
const modifier = (text) => {
  if (!state.eventCounter) {
    state.eventCounter = 0
  }
  
  state.eventCounter++
  
  // Случайное событие каждые 5 действий
  if (state.eventCounter >= 5) {
    const events = [
      "Внезапно начинается дождь.",
      "Вы слышите странный шум вдали.",
      "Пролетает стая птиц.",
      "Находите потерянную монету."
    ]
    
    const randomEvent = events[Math.floor(Math.random() * events.length)]
    text = randomEvent + " " + text
    
    state.eventCounter = 0
  }
  
  return { text }
}

modifier(text)
```

### 3. Система репутации

```javascript
const modifier = (text) => {
  if (!state.reputation) {
    state.reputation = {
      villagers: 0,
      guards: 0,
      thieves: 0
    }
  }
  
  // Анализ действий игрока
  const lower = text.toLowerCase()
  
  if (lower.includes("помог") || lower.includes("спас")) {
    state.reputation.villagers += 1
    state.reputation.guards += 1
  }
  
  if (lower.includes("укра") || lower.includes("ограб")) {
    state.reputation.thieves += 1
    state.reputation.villagers -= 1
    state.reputation.guards -= 2
  }
  
  // Обновление Story Card с репутацией
  const repIndex = findStoryCard("репутация")
  const repText = `Репутация - Жители: ${state.reputation.villagers}, Стража: ${state.reputation.guards}, Воры: ${state.reputation.thieves}`
  
  if (repIndex >= 0) {
    updateStoryCard(repIndex, "репутация, отношение", repText, "character")
  } else {
    addStoryCard("репутация, отношение", repText, "character")
  }
  
  return { text }
}

modifier(text)
```

## Производительность

### Оптимизация скриптов

1. **Минимизируйте сложные вычисления:**
   ```javascript
   // ❌ Плохо - вычисления на каждом вызове
   const result = expensiveCalculation()
   
   // ✅ Хорошо - кэширование
   if (!state.cachedResult) {
     state.cachedResult = expensiveCalculation()
   }
   const result = state.cachedResult
   ```

2. **Избегайте длинных циклов:**
   ```javascript
   // Ограничьте размер массивов в state
   if (state.history.length > 100) {
     state.history = state.history.slice(-50)  // Оставить последние 50
   }
   ```

3. **Эффективная работа со строками:**
   ```javascript
   // ✅ Используйте методы строк вместо регулярных выражений где возможно
   if (text.includes("ключевоеСлово")) {
     // Быстрее чем regex для простых случаев
   }
   ```

## Частые ошибки и решения

### 1. "modifier is not defined"
**Причина:** Отсутствует обязательная структура функции  
**Решение:** Убедитесь, что есть `const modifier = (text) => {...}` и `modifier(text)`

### 2. "Story card not found at index"
**Причина:** Попытка обновить несуществующую Story Card  
**Решение:** Проверяйте существование перед обновлением:
```javascript
if (state.storyCards && state.storyCards[index]) {
  updateStoryCard(index, ...)
}
```

### 3. Скрипт не влияет на игру
**Причина:** Забыли вернуть `{ text }`  
**Решение:** Всегда возвращайте объект с модифицированным текстом

### 4. State сбрасывается
**Причина:** State привязан к сценарию, а не сохранению  
**Решение:** State сохраняется только в текущей игре, переключение сценария сбросит state

### 5. Слишком большой контекст
**Причина:** Добавление слишком много информации в память или Story Cards  
**Решение:** Контролируйте размер, используйте `info.maxChars`

## Специфика Проекта Lincoln

### Архитектура Lincoln v17

Вы работаете с проектом **Lincoln** — системой симуляции динамических социальных миров с четырехуровневой моделью сознания.

#### Ключевые Архитектурные Принципы

**1. Глобальный Объект LC**
```javascript
// Library.txt
const LC = {
  // Утилиты
  Tools: { safeRegexMatch: function() {}, escapeRegex: function() {} },
  Utils: { toNum: function() {}, toStr: function() {}, toBool: function() {} },
  
  // Движки (логически изолированные объекты)
  QualiaEngine: { /* феноменальное ядро */ },
  InformationEngine: { /* субъективная интерпретация */ },
  RelationsEngine: { /* отношения персонажей */ },
  HierarchyEngine: { /* социальная иерархия */ },
  GoalsEngine: { /* цели персонажей */ },
  MoodEngine: { /* настроения */ },
  // ... остальные движки
  
  // Инициализация
  lcInit: function() { /* создание state.lincoln */ }
};

// Глобальная доступность
state.shared.LC = LC;
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
  lore: [],            // LoreEngine
  myths: [],           // MemoryEngine
  
  // Мета-данные
  turn: 0,
  time: {},
  environment: {},
  stateVersion: 0      // Для кэширования
};
```

**3. Правила Взаимодействия Движков**

✅ **РАЗРЕШЕНО:**
- Вызывать публичные методы других движков
- Читать/писать в `state.lincoln`
- Использовать общие утилиты из `LC.Tools` и `LC.Utils`

❌ **ЗАПРЕЩЕНО:**
- Прямой доступ к приватным полям других движков
- Копирование логики из других движков
- Создание циклических зависимостей

**Пример правильного взаимодействия:**
```javascript
// RelationsEngine использует InformationEngine
LC.RelationsEngine.updateRelation = function(from, to, modifier, options) {
  if (options.interpretedEvent) {
    // ✅ ПРАВИЛЬНО: публичный метод
    const interpretation = LC.InformationEngine.interpret(from, options.interpretedEvent);
    modifier *= interpretation.multiplier;
  }
  
  state.lincoln.relations[from][to] += modifier;
  state.lincoln.stateVersion++; // Инвалидация кэша
};
```

### Четырехуровневая Модель Сознания

Проект Lincoln реализует каскадную модель симуляции сознания:

**Уровень 1: Феноменология (QualiaEngine)**
```javascript
// Сырые телесные ощущения
state.lincoln.characters[name].qualia_state = {
  somatic_tension: 0.5,  // Напряжение [0-1]
  valence: 0.5,          // Приятно/неприятно [0-1]
  focus_aperture: 0.5,   // Фокус внимания [0-1]
  energy_level: 0.5      // Энергия [0-1]
};
```

**Уровень 2: Психология (InformationEngine)**
```javascript
// Субъективная интерпретация событий
LC.InformationEngine.interpret = function(character, event) {
  const valence = character.qualia_state.valence;
  
  if (valence > 0.7) {
    return { interpretation: "искренне", multiplier: 1.5 };
  } else if (valence < 0.3) {
    return { interpretation: "саркастично", multiplier: 0.4 };
  }
};
```

**Уровень 3: Личность (CrucibleEngine)**
```javascript
// Эволюция характера через опыт
state.lincoln.characters[name].personality = {
  trust: 0.5,
  bravery: 0.5,
  idealism: 0.5,
  aggression: 0.3
};

state.lincoln.characters[name].self_concept = {
  perceived_trust: 0.4,    // Может отличаться от reality
  perceived_bravery: 0.5,
  perceived_idealism: 0.3,
  perceived_aggression: 0.4
};
```

**Уровень 4: Социология (Hierarchy, Memory, Lore)**
```javascript
// Социальный капитал и репутация
state.lincoln.characters[name].social = {
  status: 'member',  // 'leader', 'member', 'outcast'
  capital: 100       // [0-200]
};
```

### Критические Зависимости

**⚠️ ВАЖНО:** При добавлении новых систем соблюдайте порядок зависимостей:

1. **QualiaEngine → InformationEngine** (БЛОКИРУЮЩАЯ)
   - InformationEngine НЕ МОЖЕТ работать без qualia_state
   - Внедрять ПОСЛЕДОВАТЕЛЬНО, БЕЗ ПЕРЕРЫВА

2. **InformationEngine → RelationsEngine** (ФУНКЦИОНАЛЬНАЯ)
   - RelationsEngine использует субъективную интерпретацию
   - Внедрять ПОСЛЕ InformationEngine

3. **InformationEngine → HierarchyEngine** (ФУНКЦИОНАЛЬНАЯ)
   - HierarchyEngine рассчитывает репутацию через perceptions
   - Внедрять ПОСЛЕ InformationEngine

### Паттерны Проекта Lincoln

**Инициализация Персонажа**
```javascript
function initializeCharacter(name) {
  if (!state.lincoln.characters[name]) {
    state.lincoln.characters[name] = {
      type: 'SECONDARY',
      status: 'ACTIVE',
      
      // QualiaEngine
      qualia_state: {
        somatic_tension: 0.3,
        valence: 0.5,
        focus_aperture: 0.7,
        energy_level: 0.8
      },
      
      // InformationEngine
      perceptions: {},
      
      // CrucibleEngine
      personality: {
        trust: 0.5,
        bravery: 0.5,
        idealism: 0.5,
        aggression: 0.3
      },
      
      self_concept: {
        perceived_trust: 0.5,
        perceived_bravery: 0.5,
        perceived_idealism: 0.5,
        perceived_aggression: 0.3
      },
      
      // HierarchyEngine
      social: {
        status: 'member',
        capital: 100
      }
    };
    
    state.lincoln.stateVersion++;
  }
}
```

**Обработка Событий**
```javascript
function processEvent(actor, target, eventType) {
  // 1. Феноменология: изменение qualia_state
  LC.QualiaEngine.resonate(actor, {
    type: eventType,
    intensity: 0.5
  });
  
  // 2. Психология: субъективная интерпретация
  const interpretation = LC.InformationEngine.interpret(actor, {
    type: eventType,
    target: target
  });
  
  // 3. Социальная динамика: обновление отношений
  LC.RelationsEngine.updateRelation(actor, target, interpretation.modifier, {
    interpretedEvent: interpretation
  });
  
  // 4. Инвалидация кэша
  state.lincoln.stateVersion++;
}
```

**Версионирование Состояния**
```javascript
// При любом изменении state.lincoln инкрементируйте версию
state.lincoln.relations[from][to] = newValue;
state.lincoln.stateVersion++;

// Кэширование с проверкой версии
function getCachedResult(cacheKey) {
  const cached = state.lincoln._cache[cacheKey];
  if (cached && cached.version === state.lincoln.stateVersion) {
    return cached.result; // Кэш валиден
  }
  
  // Пересчитать результат
  const result = expensiveOperation();
  
  state.lincoln._cache[cacheKey] = {
    version: state.lincoln.stateVersion,
    result: result
  };
  
  return result;
}
```

### Оптимизация для Lincoln

**UnifiedAnalyzer Pattern**
```javascript
// Единый конвейер анализа текста
LC.UnifiedAnalyzer.analyze = function(text, actionType) {
  // Вызов всех движков в правильном порядке
  LC.TimeEngine.advance();
  LC.EvergreenEngine.analyze(text, actionType);
  LC.GoalsEngine.analyze(text, actionType);
  LC.MoodEngine.analyze(text);
  LC.RelationsEngine.analyze(text);
  LC.GossipEngine.analyze(text);
  // ... остальные движки
};
```

**Context Overlay Composition**
```javascript
LC.composeContextOverlay = function(options) {
  // Проверка кэша
  const cacheKey = JSON.stringify(options);
  const cached = state.lincoln._contextCache[cacheKey];
  
  if (cached && cached.stateVersion === state.lincoln.stateVersion) {
    return cached.result; // Пропуск пересборки
  }
  
  // Сборка контекста
  const parts = [];
  
  // Приоритет 1000: INTENT
  if (state.lincoln.currentIntent) {
    parts.push({ text: `⟦INTENT⟧ ${state.lincoln.currentIntent}`, priority: 1000 });
  }
  
  // Приоритет 800: CANON
  const canon = LC.EvergreenEngine.getCanon();
  if (canon) {
    parts.push({ text: `⟦CANON⟧ ${canon}`, priority: 800 });
  }
  
  // Приоритет 750: GOALS
  const goals = LC.GoalsEngine.getActiveGoals();
  goals.forEach(goal => {
    parts.push({ text: `⟦GOAL⟧ Цель ${goal.character}: ${goal.text}`, priority: 750 });
  });
  
  // Приоритет 740: SECRETS
  const secrets = LC.KnowledgeEngine.getVisibleSecrets();
  secrets.forEach(secret => {
    parts.push({ text: `⟦SECRET⟧ ${secret.text}`, priority: 740 });
  });
  
  // ... остальные части
  
  // Сортировка по приоритету
  parts.sort((a, b) => b.priority - a.priority);
  
  const result = parts.map(p => p.text).join('\n');
  
  // Сохранение в кэш
  state.lincoln._contextCache[cacheKey] = {
    stateVersion: state.lincoln.stateVersion,
    result: result
  };
  
  return result;
};
```

### Команды Отладки для Lincoln

При разработке используйте эти команды для тестирования:

```javascript
// Отладка QualiaEngine
/qualia set Alice valence 0.8
/qualia get Alice

// Отладка InformationEngine
/interpret Alice praise
/perception get Alice Bob

// Отладка RelationsEngine
/relation set Alice Bob 50
/relation get Alice Bob

// Отладка HierarchyEngine
/status Alice
/capital set Alice 150

// Отладка GoalsEngine
/goal add Alice "стать лидером"
/goals list

// Отладка TimeEngine
/time
/time next

// Общая отладка
/debug
/state
```

## Заключение

При разработке для проекта Lincoln помните:

1. ✅ **Архитектура:** AI Dungeon поддерживает модульность через 4 скрипта (Library, Input, Output, Context) с передачей данных через state.shared
2. ✅ **Глобальный объект:** LC содержит все движки как логически изолированные компоненты
3. ✅ **Зависимости:** Соблюдайте критический порядок (Qualia → Information → Relations/Hierarchy)
4. ✅ **Состояние:** Используйте `state.lincoln` с инкрементом `stateVersion`
5. ✅ **Взаимодействие:** Публичные методы для связи между движками
6. ✅ **Философия:** Симуляция сознания, не просто поведения
7. ✅ **Четыре уровня:** Феноменология → Психология → Личность → Социология
8. ✅ **Тестирование:** После каждого изменения запускайте в игре
9. ✅ **Опыт v16:** Используйте проверенные решения, прошедшие 2500 ходов тестирования
10. ✅ **Эволюция, не революция:** v17 улучшает v16, а не заменяет полностью

**Ключевая инновация Lincoln:** События интерпретируются субъективно через qualia_state, создавая множество реальностей — по одной для каждого сознания.

**Важное напоминание:** Не поддерживаются `require()`, `import`, npm пакеты, динамическая загрузка файлов. Используйте 4 скрипта с `state.shared` для передачи данных.

Удачи в создании живого, дышащего мира!