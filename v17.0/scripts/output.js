/*
 * Lincoln v17.0 - Output Modifier Script
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
  
  let outputText = String(text || '');

  // Извлекаем и отображаем системные сообщения
  const messages = LC.lcConsumeMsgs();
  if (messages && messages.length > 0) {
    const block = LC.sysBlock(messages);
    // Добавляем блок сообщений ПЕРЕД текстом от ИИ
    outputText = block + "\n" + outputText;
  }

  return { text: outputText };
};

// Вызываем modifier и возвращаем его результат, как того требует AI Dungeon
return modifier(text);
