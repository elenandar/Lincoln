/*
 * Lincoln v17.0 - Context Modifier Script
 * Phase 1.2: Corrected Return Pattern
 */

// Объявляем функцию modifier
const modifier = (text) => {
  // Failsafe: Если LC не определен, возвращаем текст без изменений
  if (typeof LC === 'undefined') {
    return { text: String(text || '') };
  }

  // Инициализируем состояние Lincoln
  const L = LC.lcInit();

  // Сквозной режим: возвращаем текст без изменений
  return { text: String(text || '') };
};

// Вызываем modifier и возвращаем его результат, как того требует AI Dungeon
return modifier(text);
