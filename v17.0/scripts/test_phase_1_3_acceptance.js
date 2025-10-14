#!/usr/bin/env node
/**
 * Acceptance Criteria Test for Phase 1.3 - CommandsRegistry
 * 
 * This test validates the exact acceptance criteria from the ticket:
 * 
 * Test 1 (Команда работает):
 *   Действие: Ввести в игре /ping.
 *   Ожидаемый результат: В выводе появляется системное сообщение ⟦SYS⟧ Pong!. 
 *                        Текст /ping не появляется в истории.
 * 
 * Test 2 (Неизвестная команда):
 *   Действие: Ввести в игре /fly.
 *   Ожидаемый результат: В выводе появляется системное сообщение 
 *                        ⟦SYS⟧ Unknown command: "/fly".
 * 
 * Test 3 (Обычный ввод):
 *   Действие: Ввести в игре > Посмотреть на свои руки.
 *   Ожидаемый результат: Игра работает как обычно. Текст >  удаляется, 
 *                        и в ИИ уходит чистая строка "Посмотреть на свои руки".
 */

console.log("=== Acceptance Criteria Tests for Phase 1.3 - CommandsRegistry ===\n");

const fs = require('fs');
const path = require('path');

// Mock the global state object
global.state = {};

// Load library.js
const libraryCode = fs.readFileSync(path.join(__dirname, 'library.js'), 'utf8');
eval(libraryCode);

console.log("==============================================================");
console.log("ТЕСТ 1: Команда работает (/ping)");
console.log("==============================================================");
console.log("Действие: Ввести в игре /ping");
console.log("");

try {
  // Reset state for clean test
  global.state = {};
  eval(libraryCode);
  
  // Simulate player input
  const inputCode = fs.readFileSync(path.join(__dirname, 'input.js'), 'utf8');
  const playerInput = "/ping";
  const wrappedInputCode = `(function() { const text = "${playerInput}"; ${inputCode} })()`;
  const inputResult = eval(wrappedInputCode);
  
  console.log("Результат input.js:");
  console.log("  - text: \"" + inputResult.text + "\"");
  console.log("  - stop: " + inputResult.stop);
  console.log("");
  
  // Check that text is empty and stop is true
  const textNotInHistory = inputResult.text === "" && inputResult.stop === true;
  console.log("✓ Проверка 1: Текст /ping НЕ попадает в историю:", textNotInHistory);
  
  // Simulate AI output turn
  const outputCode = fs.readFileSync(path.join(__dirname, 'output.js'), 'utf8');
  const aiResponse = "The story continues...";
  const wrappedOutputCode = `(function() { const text = "${aiResponse}"; ${outputCode} })()`;
  const outputResult = eval(wrappedOutputCode);
  
  console.log("");
  console.log("Вывод игры:");
  console.log("----------------------------------------");
  console.log(outputResult.text);
  console.log("----------------------------------------");
  console.log("");
  
  // Verify output contains ⟦SYS⟧ Pong!
  const hasSysMessage = outputResult.text.includes("⟦SYS⟧ Pong!");
  console.log("✓ Проверка 2: Вывод содержит '⟦SYS⟧ Pong!':", hasSysMessage);
  
  if (textNotInHistory && hasSysMessage) {
    console.log("");
    console.log("✅ ТЕСТ 1 ПРОЙДЕН!");
  } else {
    console.log("");
    console.log("❌ ТЕСТ 1 НЕ ПРОЙДЕН!");
    process.exit(1);
  }
} catch (error) {
  console.error("❌ ТЕСТ 1 ЗАВЕРШИЛСЯ С ОШИБКОЙ:", error.message);
  process.exit(1);
}

console.log("");
console.log("");

console.log("==============================================================");
console.log("ТЕСТ 2: Неизвестная команда (/fly)");
console.log("==============================================================");
console.log("Действие: Ввести в игре /fly");
console.log("");

try {
  // Reset state for clean test
  global.state = {};
  eval(libraryCode);
  
  // Simulate player input
  const inputCode = fs.readFileSync(path.join(__dirname, 'input.js'), 'utf8');
  const playerInput = "/fly";
  const wrappedInputCode = `(function() { const text = "${playerInput}"; ${inputCode} })()`;
  const inputResult = eval(wrappedInputCode);
  
  console.log("Результат input.js:");
  console.log("  - text: \"" + inputResult.text + "\"");
  console.log("  - stop: " + inputResult.stop);
  console.log("");
  
  // Simulate AI output turn
  const outputCode = fs.readFileSync(path.join(__dirname, 'output.js'), 'utf8');
  const aiResponse = "The story continues...";
  const wrappedOutputCode = `(function() { const text = "${aiResponse}"; ${outputCode} })()`;
  const outputResult = eval(wrappedOutputCode);
  
  console.log("Вывод игры:");
  console.log("----------------------------------------");
  console.log(outputResult.text);
  console.log("----------------------------------------");
  console.log("");
  
  // Verify output contains Unknown command: "/fly"
  const hasErrorMessage = outputResult.text.includes("⟦SYS⟧ Unknown command: \"/fly\"");
  console.log("✓ Проверка: Вывод содержит '⟦SYS⟧ Unknown command: \"/fly\"':", hasErrorMessage);
  
  if (hasErrorMessage) {
    console.log("");
    console.log("✅ ТЕСТ 2 ПРОЙДЕН!");
  } else {
    console.log("");
    console.log("❌ ТЕСТ 2 НЕ ПРОЙДЕН!");
    process.exit(1);
  }
} catch (error) {
  console.error("❌ ТЕСТ 2 ЗАВЕРШИЛСЯ С ОШИБКОЙ:", error.message);
  process.exit(1);
}

console.log("");
console.log("");

console.log("==============================================================");
console.log("ТЕСТ 3: Обычный ввод (> Посмотреть на свои руки)");
console.log("==============================================================");
console.log("Действие: Ввести в игре > Посмотреть на свои руки");
console.log("");

try {
  // Reset state for clean test
  global.state = {};
  eval(libraryCode);
  
  // Simulate player input
  const inputCode = fs.readFileSync(path.join(__dirname, 'input.js'), 'utf8');
  const playerInput = "> Посмотреть на свои руки";
  // We need to properly escape the text for eval
  const wrappedInputCode = `(function() { const text = \`${playerInput}\`; ${inputCode} })()`;
  const inputResult = eval(wrappedInputCode);
  
  console.log("Результат input.js:");
  console.log("  - text: \"" + inputResult.text + "\"");
  console.log("  - stop: " + (inputResult.stop || "undefined") );
  console.log("");
  
  // Check that "> " was removed
  const prefixRemoved = inputResult.text === "Посмотреть на свои руки";
  const noStop = !inputResult.stop;
  
  console.log("✓ Проверка 1: Префикс '> ' удален:", prefixRemoved);
  console.log("✓ Проверка 2: Текст проходит в ИИ (stop != true):", noStop);
  console.log("");
  console.log("Текст, который уйдет в ИИ: \"" + inputResult.text + "\"");
  
  if (prefixRemoved && noStop) {
    console.log("");
    console.log("✅ ТЕСТ 3 ПРОЙДЕН!");
  } else {
    console.log("");
    console.log("❌ ТЕСТ 3 НЕ ПРОЙДЕН!");
    process.exit(1);
  }
} catch (error) {
  console.error("❌ ТЕСТ 3 ЗАВЕРШИЛСЯ С ОШИБКОЙ:", error.message);
  console.error(error.stack);
  process.exit(1);
}

console.log("");
console.log("");
console.log("==============================================================");
console.log("📋 ИТОГОВЫЙ ОТЧЕТ");
console.log("==============================================================");
console.log("✅ ТЕСТ 1: /ping команда работает корректно");
console.log("✅ ТЕСТ 2: /fly неизвестная команда показывает ошибку");
console.log("✅ ТЕСТ 3: Обычный ввод обрабатывается правильно");
console.log("");
console.log("🎉 ВСЕ КРИТЕРИИ ПРИЕМКИ ВЫПОЛНЕНЫ!");
console.log("");
console.log("Реализованная функциональность:");
console.log("  ✓ CommandsRegistry создан и инициализирован");
console.log("  ✓ LC.registerCommand() регистрирует команды");
console.log("  ✓ LC.sanitizeInput() очищает ввод от '>  '");
console.log("  ✓ /ping команда зарегистрирована");
console.log("  ✓ input.js парсит и выполняет команды");
console.log("  ✓ Команды не попадают в историю игры");
console.log("  ✓ Обычный ввод работает как раньше");
console.log("");
console.log("Готово к продакшену! 🚀");
