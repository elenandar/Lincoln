/*
 * Lincoln v17.0 - Input Modifier Script
 * Phase 1.3: CommandsRegistry and Command Parsing
 */

// Объявляем функцию modifier
const modifier = (text) => {
  // Failsafe: Если LC не определен, возвращаем текст без изменений
  if (typeof LC === 'undefined') {
    return { text: String(text || '') };
  }

  // Инициализируем состояние Lincoln
  const L = LC.lcInit();

  // Sanitize input
  const cleanText = LC.sanitizeInput(text);

  // Check if input is a command (starts with /)
  if (cleanText.startsWith('/')) {
    // Parse command: split into tokens
    const tokens = cleanText.split(' ');
    const commandName = tokens[0];
    const args = tokens.slice(1);

    // Look up command in registry
    const commandDef = L.CommandsRegistry.get(commandName);

    if (commandDef && typeof commandDef.handler === 'function') {
      // Execute command handler
      commandDef.handler(args);
    } else {
      // Command not found
      LC.lcSys(`Unknown command: "${commandName}"`);
    }

    // Stop processing - don't add command text to game history
    return { text: "", stop: true };
  }

  // If not a command, return cleaned text (pass-through mode)
  return { text: cleanText };
};

// Вызываем modifier и возвращаем его результат, как того требует AI Dungeon
return modifier(text);
