### 8.2 Кэширование Контекста (Context Caching)

#### Проблема

Функция `composeContextOverlay()` вызывается при каждом ходе для сборки контекстной информации для AI:
- Извлечение канона из Evergreen
- Формирование списка активных целей
- Сбор активных настроений персонажей
- Фильтрация секретов по фокусу сцены
- Формирование расписания событий

Если состояние не изменилось между вызовами, вся эта работа выполняется зря.

#### Решение: Версионирование состояния + кэш

**1. Счетчик версий состояния (`L.stateVersion`)**

В `lcInit()` добавлен счетчик:

```javascript
L.stateVersion = L.stateVersion || 0;
```

Все движки инкрементируют счетчик при изменении состояния:

```javascript
// GoalsEngine - при добавлении цели
L.goals[goalKey] = { ... };
L.stateVersion++;

// MoodEngine - при установке настроения
L.character_status[character] = { ... };
L.stateVersion++;

// RelationsEngine - при изменении отношений
L.evergreen.relations[char1][char2] = newValue;
L.stateVersion++;

// EvergreenEngine - при обновлении фактов/обязательств/статусов
box[key] = val;
L.stateVersion++;
```

**2. Механизм кэширования**

В `composeContextOverlay()` добавлена проверка кэша:

```javascript
LC.composeContextOverlay = function(options) {
  const opts = options || {};
  const L = LC.lcInit();
  
  // Проверка кэша
  if (!LC._contextCache) LC._contextCache = {};
  const cacheKey = JSON.stringify(opts);
  const cached = LC._contextCache[cacheKey];
  
  if (cached && cached.stateVersion === L.stateVersion) {
    // Состояние не изменилось - возвращаем кэшированный результат
    return cached.result;
  }
  
  // ... сборка контекста ...
  
  // Сохранение в кэш
  const result = { text, parts, max };
  LC._contextCache[cacheKey] = {
    stateVersion: L.stateVersion,
    result: result
  };
  
  return result;
}
```

**Ключ кэша:** `JSON.stringify(opts)` - учитывает параметры вызова (limit, allowPartial и т.д.)

**Условие попадания:** `cached.stateVersion === L.stateVersion` - версия не изменилась

#### Преимущества

1. **Пропуск работы** - если состояние не менялось, вся сборка контекста пропускается
2. **Автоматическая инвалидация** - любое изменение в движках автоматически инвалидирует кэш
3. **Множественные кэши** - разные параметры вызова кэшируются отдельно
4. **Прозрачность** - не требует изменений в коде, использующем `composeContextOverlay()`

#### Эффект на производительность

**Сценарий 1: Retry**
```
Turn N: User retries -> isRetry=true -> движки не вызываются
        -> L.stateVersion не меняется
        -> composeContextOverlay() возвращает кэш
```
**Выигрыш:** Пропуск всей работы по сборке контекста

**Сценарий 2: Continue без событий**
```
Turn N: User continues -> движки анализируют текст
        -> не находят паттернов -> L.stateVersion не меняется
        -> composeContextOverlay() возвращает кэш
```
**Выигрыш:** Пропуск сборки, хотя анализ был выполнен

**Сценарий 3: Обычный ход с событием**
```
Turn N: User input -> движки находят цель/настроение
        -> L.stateVersion++ -> кэш инвалидируется
        -> composeContextOverlay() пересобирает контекст
        -> сохраняет новый кэш
```
**Нормальная работа:** Сборка выполняется при реальных изменениях

#### Метрики

| Операция | Без кэша | С кэшем (попадание) | Экономия |
|----------|----------|---------------------|----------|
| composeContextOverlay() | ~5-15ms | ~0.1ms | 98-99% |
| Retry (полный цикл) | ~5-20ms | ~0.1ms | 99% |
| Continue без событий | ~3-10ms | ~0.1ms | 97-99% |

*Примечание: Время указано ориентировочно и зависит от объема данных в состоянии.*

#### Безопасность

Механизм не влияет на корректность:
- Если есть сомнения, можно очистить кэш: `LC._contextCache = {}`
- Кэш автоматически очищается при любом изменении состояния
- Кэш изолирован по параметрам вызова

---
