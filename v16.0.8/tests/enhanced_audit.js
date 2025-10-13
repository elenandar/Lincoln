#!/usr/bin/env node
/**
 * Enhanced Audit Tool - Deep Analysis
 * 
 * This tool performs additional deep analysis checks beyond the comprehensive audit:
 * 1. Cyclomatic complexity analysis
 * 2. Dead code detection
 * 3. Performance bottleneck identification
 * 4. Security vulnerability scanning
 * 5. Code duplication detection
 */

console.log("╔══════════════════════════════════════════════════════════════════════════════╗");
console.log("║           ENHANCED AUDIT TOOL - DEEP ANALYSIS                                ║");
console.log("╚══════════════════════════════════════════════════════════════════════════════╝");
console.log("");

const fs = require('fs');
const path = require('path');

// Load all script files
const libraryCode = fs.readFileSync(path.join(__dirname, '..', 'v16.0.8/Library v16.0.8.patched.txt'), 'utf8');
const inputCode = fs.readFileSync(path.join(__dirname, '..', 'v16.0.8/Input v16.0.8.patched.txt'), 'utf8');
const outputCode = fs.readFileSync(path.join(__dirname, '..', 'v16.0.8/Output v16.0.8.patched.txt'), 'utf8');
const contextCode = fs.readFileSync(path.join(__dirname, '..', 'v16.0.8/Context v16.0.8.patched.txt'), 'utf8');

const allCode = libraryCode + inputCode + outputCode + contextCode;

// Results storage
const results = {
  complexity: { warnings: [], critical: [] },
  deadCode: { warnings: [], critical: [] },
  performance: { warnings: [], critical: [] },
  security: { warnings: [], critical: [] },
  duplication: { warnings: [], critical: [] }
};

console.log("┌──────────────────────────────────────────────────────────────────────────────┐");
console.log("│ РАЗДЕЛ 1: АНАЛИЗ ЦИКЛОМАТИЧЕСКОЙ СЛОЖНОСТИ                                   │");
console.log("└──────────────────────────────────────────────────────────────────────────────┘");
console.log("");

// 1. Cyclomatic complexity - count control flow statements
console.log("1.1 Подсчет управляющих конструкций");
const ifCount = (allCode.match(/\bif\s*\(/g) || []).length;
const forCount = (allCode.match(/\bfor\s*\(/g) || []).length;
const whileCount = (allCode.match(/\bwhile\s*\(/g) || []).length;
const switchCount = (allCode.match(/\bswitch\s*\(/g) || []).length;
const ternaryCount = (allCode.match(/\?[^:]*:/g) || []).length;
const catchCount = (allCode.match(/\bcatch\s*\(/g) || []).length;

console.log(`  if операторов: ${ifCount}`);
console.log(`  for циклов: ${forCount}`);
console.log(`  while циклов: ${whileCount}`);
console.log(`  switch операторов: ${switchCount}`);
console.log(`  тернарных операторов: ${ternaryCount}`);
console.log(`  catch блоков: ${catchCount}`);

const totalComplexity = ifCount + forCount + whileCount + switchCount + ternaryCount + catchCount;
console.log(`  \n  Общая сложность: ${totalComplexity}`);

if (totalComplexity < 500) {
  console.log("  ✅ Низкая сложность - код легко понимается");
} else if (totalComplexity < 1000) {
  console.log("  ⚠ Средняя сложность - требует внимания при изменениях");
  results.complexity.warnings.push(`Общая сложность: ${totalComplexity}`);
} else {
  console.log("  ❌ Высокая сложность - рекомендуется рефакторинг");
  results.complexity.critical.push(`Общая сложность: ${totalComplexity}`);
}
console.log("");

console.log("┌──────────────────────────────────────────────────────────────────────────────┐");
console.log("│ РАЗДЕЛ 2: ОБНАРУЖЕНИЕ МЕРТВОГО КОДА                                          │");
console.log("└──────────────────────────────────────────────────────────────────────────────┘");
console.log("");

// 2. Dead code detection - look for unreachable code patterns
console.log("2.1 Проверка на недостижимый код");

// Check for return statements followed by more code
const returnPattern = /return\s+[^;]+;[\s]*\w+/g;
const unreachableAfterReturn = (allCode.match(returnPattern) || []).length;

// Check for code after throw
const throwPattern = /throw\s+[^;]+;[\s]*\w+/g;
const unreachableAfterThrow = (allCode.match(throwPattern) || []).length;

console.log(`  Код после return: ${unreachableAfterReturn} потенциальных случаев`);
console.log(`  Код после throw: ${unreachableAfterThrow} потенциальных случаев`);

if (unreachableAfterReturn === 0 && unreachableAfterThrow === 0) {
  console.log("  ✅ Недостижимый код не обнаружен");
} else {
  console.log("  ⚠ Обнаружен потенциально недостижимый код");
  if (unreachableAfterReturn > 0) {
    results.deadCode.warnings.push(`${unreachableAfterReturn} случаев кода после return`);
  }
  if (unreachableAfterThrow > 0) {
    results.deadCode.warnings.push(`${unreachableAfterThrow} случаев кода после throw`);
  }
}
console.log("");

console.log("2.2 Проверка на неиспользуемые переменные");
// Check for variables that are declared but might not be used
const constDeclarations = (allCode.match(/const\s+(\w+)\s*=/g) || []).map(m => m.match(/const\s+(\w+)/)[1]);
const letDeclarations = (allCode.match(/let\s+(\w+)\s*=/g) || []).map(m => m.match(/let\s+(\w+)/)[1]);
const varDeclarations = (allCode.match(/var\s+(\w+)\s*=/g) || []).map(m => m.match(/var\s+(\w+)/)[1]);

console.log(`  const переменных объявлено: ${constDeclarations.length}`);
console.log(`  let переменных объявлено: ${letDeclarations.length}`);
console.log(`  var переменных объявлено: ${varDeclarations.length}`);
console.log("  ✅ Детальный анализ использования требует AST парсера");
console.log("");

console.log("┌──────────────────────────────────────────────────────────────────────────────┐");
console.log("│ РАЗДЕЛ 3: ИДЕНТИФИКАЦИЯ УЗКИХ МЕСТ ПРОИЗВОДИТЕЛЬНОСТИ                        │");
console.log("└──────────────────────────────────────────────────────────────────────────────┘");
console.log("");

// 3. Performance bottleneck identification
console.log("3.1 Проверка на вложенные циклы");
const nestedLoops = (allCode.match(/for[^{]*{[^}]*for[^{]*{/g) || []).length;
console.log(`  Вложенные циклы: ${nestedLoops}`);

if (nestedLoops === 0) {
  console.log("  ✅ Вложенные циклы не обнаружены");
} else if (nestedLoops < 5) {
  console.log("  ⚠ Обнаружены вложенные циклы - проверьте сложность");
  results.performance.warnings.push(`${nestedLoops} вложенных циклов`);
} else {
  console.log("  ❌ Много вложенных циклов - возможно узкое место");
  results.performance.critical.push(`${nestedLoops} вложенных циклов`);
}
console.log("");

console.log("3.2 Проверка на использование регулярных выражений в циклах");
const regexInLoop = (allCode.match(/for[^{]*{[^}]*\/.*\/[gimsuy]*\.(?:test|exec|match)/g) || []).length;
console.log(`  Regex в циклах: ${regexInLoop}`);

if (regexInLoop === 0) {
  console.log("  ✅ Regex не используются в циклах");
} else {
  console.log("  ⚠ Regex используются в циклах - может быть медленно");
  results.performance.warnings.push(`${regexInLoop} использований regex в циклах`);
}
console.log("");

console.log("3.3 Проверка на глобальный поиск в больших массивах");
const arrayFinds = (allCode.match(/\.find\(/g) || []).length;
const arrayFilters = (allCode.match(/\.filter\(/g) || []).length;
console.log(`  .find() вызовов: ${arrayFinds}`);
console.log(`  .filter() вызовов: ${arrayFilters}`);
console.log("  ℹ Рекомендация: для больших массивов использовать индексирование");
console.log("");

console.log("┌──────────────────────────────────────────────────────────────────────────────┐");
console.log("│ РАЗДЕЛ 4: СКАНИРОВАНИЕ НА УЯЗВИМОСТИ БЕЗОПАСНОСТИ                            │");
console.log("└──────────────────────────────────────────────────────────────────────────────┘");
console.log("");

// 4. Security vulnerability scanning
console.log("4.1 Проверка на использование eval");
const evalUsage = (allCode.match(/\beval\s*\(/g) || []).length;
console.log(`  eval() вызовов: ${evalUsage}`);

if (evalUsage === 0) {
  console.log("  ✅ eval() не используется");
} else {
  console.log("  ⚠ eval() используется - потенциальная уязвимость");
  results.security.warnings.push(`${evalUsage} использований eval()`);
}
console.log("");

console.log("4.2 Проверка на инъекции в регулярные выражения");
const dynamicRegex = (allCode.match(/new RegExp\([^)]*\+/g) || []).length;
console.log(`  Динамические regex: ${dynamicRegex}`);

if (dynamicRegex === 0) {
  console.log("  ✅ Динамические regex не обнаружены");
} else {
  console.log("  ⚠ Динамические regex - проверьте санитизацию входных данных");
  results.security.warnings.push(`${dynamicRegex} динамических regex`);
}
console.log("");

console.log("4.3 Проверка на прямое использование innerHTML");
const innerHTMLUsage = (allCode.match(/\.innerHTML\s*=/g) || []).length;
console.log(`  innerHTML присваиваний: ${innerHTMLUsage}`);

if (innerHTMLUsage === 0) {
  console.log("  ✅ innerHTML не используется напрямую");
} else {
  console.log("  ⚠ innerHTML используется - проверьте санитизацию");
  results.security.warnings.push(`${innerHTMLUsage} использований innerHTML`);
}
console.log("");

console.log("┌──────────────────────────────────────────────────────────────────────────────┐");
console.log("│ РАЗДЕЛ 5: ОБНАРУЖЕНИЕ ДУБЛИРОВАНИЯ КОДА                                      │");
console.log("└──────────────────────────────────────────────────────────────────────────────┘");
console.log("");

// 5. Code duplication detection (simplified - looks for repeated function patterns)
console.log("5.1 Проверка на повторяющиеся паттерны функций");

// Extract function signatures
const functionPattern = /function\s+(\w+)\s*\([^)]*\)\s*{/g;
const functions = [];
let match;
while ((match = functionPattern.exec(allCode)) !== null) {
  functions.push(match[1]);
}

console.log(`  Всего функций определено: ${functions.length}`);

// Count duplicate names (which shouldn't happen but could indicate copy-paste)
const uniqueFunctions = new Set(functions);
const duplicates = functions.length - uniqueFunctions.size;

console.log(`  Уникальных функций: ${uniqueFunctions.size}`);
console.log(`  Дубликатов имен: ${duplicates}`);

if (duplicates === 0) {
  console.log("  ✅ Дубликаты имен функций не обнаружены");
} else {
  console.log("  ⚠ Обнаружены дубликаты - возможно перезаписывание функций");
  results.duplication.warnings.push(`${duplicates} дубликатов имен функций`);
}
console.log("");

console.log("5.2 Проверка на схожие блоки кода");
// This is a very simplified check - real duplication detection needs AST analysis
const lines = allCode.split('\n');
const longLines = lines.filter(l => l.trim().length > 80);
console.log(`  Длинных строк (>80 символов): ${longLines.length}`);
console.log("  ℹ Детальная проверка дублирования требует специализированных инструментов");
console.log("");

// Generate summary report
console.log("╔══════════════════════════════════════════════════════════════════════════════╗");
console.log("║                           ИТОГОВЫЙ ОТЧЕТ                                     ║");
console.log("╚══════════════════════════════════════════════════════════════════════════════╝");
console.log("");

console.log("┌──────────────────────────────────────────────────────────────────────────────┐");
console.log("│ СВОДКА РЕЗУЛЬТАТОВ                                                           │");
console.log("└──────────────────────────────────────────────────────────────────────────────┘");
console.log("");

let totalWarnings = 0;
let totalCritical = 0;

for (const [category, data] of Object.entries(results)) {
  totalWarnings += data.warnings.length;
  totalCritical += data.critical.length;
}

console.log(`Всего предупреждений: ${totalWarnings}`);
console.log(`Всего критических проблем: ${totalCritical}`);
console.log("");

if (totalCritical === 0 && totalWarnings === 0) {
  console.log("✅ Дополнительных проблем не обнаружено!");
  console.log("   Код соответствует высоким стандартам качества.");
} else if (totalCritical === 0) {
  console.log("✅ Критических проблем не обнаружено");
  console.log(`⚠ Обнаружено ${totalWarnings} предупреждений`);
  console.log("");
  console.log("Предупреждения:");
  for (const [category, data] of Object.entries(results)) {
    if (data.warnings.length > 0) {
      console.log(`\n${category}:`);
      for (const warning of data.warnings) {
        console.log(`  • ${warning}`);
      }
    }
  }
} else {
  console.log(`❌ Обнаружено ${totalCritical} критических проблем`);
  console.log(`⚠ Обнаружено ${totalWarnings} предупреждений`);
  console.log("");
  console.log("Критические проблемы:");
  for (const [category, data] of Object.entries(results)) {
    if (data.critical.length > 0) {
      console.log(`\n${category}:`);
      for (const critical of data.critical) {
        console.log(`  • ${critical}`);
      }
    }
  }
}

console.log("");
console.log("╔══════════════════════════════════════════════════════════════════════════════╗");
console.log("║                      РАСШИРЕННЫЙ АУДИТ ЗАВЕРШЕН                              ║");
console.log("╚══════════════════════════════════════════════════════════════════════════════╝");

// Exit code based on results
process.exit(totalCritical > 0 ? 1 : 0);
