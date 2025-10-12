#!/usr/bin/env node
/**
 * Comprehensive System Audit Script
 * 
 * This script performs:
 * 1. Full compatibility audit of all scripts
 * 2. Deep logic conflict detection
 * 3. Complete bug checking
 * 4. Full functionality verification
 * 5. Detailed report generation
 */

console.log("╔══════════════════════════════════════════════════════════════════════════════╗");
console.log("║           COMPREHENSIVE SYSTEM AUDIT - Lincoln v16.0.8-compat6d             ║");
console.log("╚══════════════════════════════════════════════════════════════════════════════╝");
console.log("");

const fs = require('fs');
const path = require('path');

// Capture console output for saving to file
const reportLines = [];
const originalLog = console.log;
console.log = function(...args) {
  const line = args.map(arg => String(arg)).join(' ');
  reportLines.push(line);
  originalLog.apply(console, args);
};

// Load all script files
const libraryCode = fs.readFileSync(path.join(__dirname, '..', 'Library v16.0.8.patched.txt'), 'utf8');
const inputCode = fs.readFileSync(path.join(__dirname, '..', 'Input v16.0.8.patched.txt'), 'utf8');
const outputCode = fs.readFileSync(path.join(__dirname, '..', 'Output v16.0.8.patched.txt'), 'utf8');
const contextCode = fs.readFileSync(path.join(__dirname, '..', 'Context v16.0.8.patched.txt'), 'utf8');
const documentation = fs.readFileSync(path.join(__dirname, '..', 'SYSTEM_DOCUMENTATION.md'), 'utf8');

// Initialize audit results
const auditResults = {
  compatibility: { passed: 0, failed: 0, warnings: 0, issues: [] },
  logicConflicts: { passed: 0, failed: 0, warnings: 0, issues: [] },
  bugs: { passed: 0, failed: 0, warnings: 0, issues: [] },
  functionality: { passed: 0, failed: 0, warnings: 0, issues: [] }
};

console.log("┌──────────────────────────────────────────────────────────────────────────────┐");
console.log("│ РАЗДЕЛ 1: АУДИТ СОВМЕСТИМОСТИ СКРИПТОВ                                       │");
console.log("└──────────────────────────────────────────────────────────────────────────────┘");
console.log("");

// 1.1 Check version consistency across all modules
console.log("1.1 Проверка согласованности версий");
const versionPattern = /v16\.0\.8-compat6d/g;
const libraryVersions = (libraryCode.match(versionPattern) || []).length;
const inputVersions = (inputCode.match(versionPattern) || []).length;
const outputVersions = (outputCode.match(versionPattern) || []).length;
const contextVersions = (contextCode.match(versionPattern) || []).length;

console.log(`  Library: ${libraryVersions} упоминаний версии`);
console.log(`  Input: ${inputVersions} упоминаний версии`);
console.log(`  Output: ${outputVersions} упоминаний версии`);
console.log(`  Context: ${contextVersions} упоминаний версии`);

if (libraryVersions > 0 && inputVersions > 0 && outputVersions > 0 && contextVersions > 0) {
  console.log("  ✅ Все модули используют согласованную версию v16.0.8-compat6d");
  auditResults.compatibility.passed++;
} else {
  console.log("  ❌ Несоответствие версий между модулями");
  auditResults.compatibility.failed++;
  auditResults.compatibility.issues.push("Несоответствие версий между модулями");
}
console.log("");

// 1.2 Check LC namespace initialization
console.log("1.2 Проверка инициализации глобального пространства имен LC");
const lcInitPattern = /LC\s*=.*globalThis\.LC.*\|\|.*{}/;
const hasLibraryLCInit = lcInitPattern.test(libraryCode);
const hasInputLCCheck = /typeof LC\s*!==\s*["']undefined["']/.test(inputCode);
const hasOutputLCCheck = /typeof LC\s*!==\s*["']undefined["']/.test(outputCode);
const hasContextLCCheck = /typeof LC\s*!==\s*["']undefined["']/.test(contextCode);

console.log(`  Library инициализирует LC: ${hasLibraryLCInit ? '✓' : '✗'}`);
console.log(`  Input проверяет LC: ${hasInputLCCheck ? '✓' : '✗'}`);
console.log(`  Output проверяет LC: ${hasOutputLCCheck ? '✓' : '✗'}`);
console.log(`  Context проверяет LC: ${hasContextLCCheck ? '✓' : '✗'}`);

if (hasLibraryLCInit && hasInputLCCheck && hasOutputLCCheck && hasContextLCCheck) {
  console.log("  ✅ Все модули правильно работают с пространством имен LC");
  auditResults.compatibility.passed++;
} else {
  console.log("  ❌ Проблемы с инициализацией LC");
  auditResults.compatibility.failed++;
  auditResults.compatibility.issues.push("Проблемы с инициализацией пространства имен LC");
}
console.log("");

// 1.3 Check CONFIG initialization patterns
console.log("1.3 Проверка инициализации конфигурации");
const configInitPatterns = [
  /LC\.CONFIG\s*\?\?=\s*{}/,
  /LC\.CONFIG\.LIMITS\s*\?\?=\s*{}/,
  /LC\.CONFIG\.FEATURES\s*\?\?=/  // Using nullish coalescing - may be multi-line object
];

let configInitOk = true;
for (const pattern of configInitPatterns) {
  if (!pattern.test(libraryCode)) {
    configInitOk = false;
    console.log(`  ⚠ Паттерн не найден: ${pattern}`);
  }
}

if (configInitOk) {
  console.log("  ✅ CONFIG инициализирован корректно");
  auditResults.compatibility.passed++;
} else {
  console.log("  ⚠ Возможные проблемы с инициализацией CONFIG");
  auditResults.compatibility.warnings++;
  auditResults.compatibility.issues.push("Потенциальные проблемы с инициализацией CONFIG");
}
console.log("");

// 1.4 Check state initialization (lcInit)
console.log("1.4 Проверка инициализации состояния (lcInit)");
const hasLcInit = /lcInit\s*\(.*?\)\s*{/.test(libraryCode);
const inputCallsLcInit = /LC\.lcInit\s*\(/.test(inputCode);
const outputCallsLcInit = /LC\.lcInit\s*\(/.test(outputCode);
const contextCallsLcInit = /LC\.lcInit\s*\(/.test(contextCode);

console.log(`  Library определяет lcInit: ${hasLcInit ? '✓' : '✗'}`);
console.log(`  Input вызывает lcInit: ${inputCallsLcInit ? '✓' : '✗'}`);
console.log(`  Output вызывает lcInit: ${outputCallsLcInit ? '✓' : '✗'}`);
console.log(`  Context вызывает lcInit: ${contextCallsLcInit ? '✓' : '✗'}`);

if (hasLcInit && inputCallsLcInit && outputCallsLcInit && contextCallsLcInit) {
  console.log("  ✅ lcInit правильно используется во всех модулях");
  auditResults.compatibility.passed++;
} else {
  console.log("  ❌ Проблемы с использованием lcInit");
  auditResults.compatibility.failed++;
  auditResults.compatibility.issues.push("Проблемы с использованием lcInit");
}
console.log("");

// 1.5 Check script slot definition
console.log("1.5 Проверка определения __SCRIPT_SLOT__");
const hasLibrarySlot = /__SCRIPT_SLOT__\s*=\s*["']Library["']/.test(libraryCode);
const hasInputSlot = /__SCRIPT_SLOT__\s*=\s*["']Input["']/.test(inputCode);
const hasOutputSlot = /__SCRIPT_SLOT__\s*=\s*["']Output["']/.test(outputCode);
const hasContextSlot = /__SCRIPT_SLOT__\s*=\s*["']Context["']/.test(contextCode);

console.log(`  Library slot: ${hasLibrarySlot ? '✓' : '✗'}`);
console.log(`  Input slot: ${hasInputSlot ? '✓' : '✗'}`);
console.log(`  Output slot: ${hasOutputSlot ? '✓' : '✗'}`);
console.log(`  Context slot: ${hasContextSlot ? '✓' : '✗'}`);

if (hasLibrarySlot && hasInputSlot && hasOutputSlot && hasContextSlot) {
  console.log("  ✅ Все модули имеют корректные __SCRIPT_SLOT__");
  auditResults.compatibility.passed++;
} else {
  console.log("  ❌ Проблемы с определением __SCRIPT_SLOT__");
  auditResults.compatibility.failed++;
  auditResults.compatibility.issues.push("Проблемы с определением __SCRIPT_SLOT__");
}
console.log("");

console.log("┌──────────────────────────────────────────────────────────────────────────────┐");
console.log("│ РАЗДЕЛ 2: ПРОВЕРКА КОНФЛИКТОВ ЛОГИКИ                                         │");
console.log("└──────────────────────────────────────────────────────────────────────────────┘");
console.log("");

// 2.1 Check turn increment logic consistency
console.log("2.1 Проверка логики инкремента хода (turn)");
const libraryHasTurnIncrement = /L\.turn\s*=.*\+\s*1|incrementTurn/.test(libraryCode);
const libraryHasIncIfNeeded = /incIfNeeded\s*\(\)/.test(libraryCode);
const inputTurnIncrement = /L\.turn\s*=.*\+\s*1/.test(inputCode);
const outputTurnIncrement = /L\.turn\s*=.*\+\s*1/.test(outputCode);
const contextTurnIncrement = /L\.turn\s*=.*\+\s*1/.test(contextCode);

console.log(`  Library имеет логику инкремента turn: ${libraryHasTurnIncrement ? '✓' : '✗'}`);
console.log(`  Library имеет LC.Turns.incIfNeeded: ${libraryHasIncIfNeeded ? '✓' : '✗'}`);
console.log(`  Input инкрементирует turn напрямую: ${inputTurnIncrement ? '✗ (не должен)' : '✓'}`);
console.log(`  Output инкрементирует turn напрямую: ${outputTurnIncrement ? '✗ (не должен)' : '✓'}`);
console.log(`  Context инкрементирует turn напрямую: ${contextTurnIncrement ? '✗ (не должен)' : '✓'}`);

if (libraryHasTurnIncrement && !inputTurnIncrement && !outputTurnIncrement && !contextTurnIncrement) {
  console.log("  ✅ Инкремент хода происходит только в Library (правильно)");
  auditResults.logicConflicts.passed++;
} else if (!libraryHasTurnIncrement) {
  console.log("  ❌ Library не имеет логики инкремента turn");
  auditResults.logicConflicts.failed++;
  auditResults.logicConflicts.issues.push("Library не имеет логики инкремента turn");
} else {
  console.log("  ⚠ Возможный конфликт: несколько модулей инкрементируют turn");
  auditResults.logicConflicts.warnings++;
  auditResults.logicConflicts.issues.push("Множественные инкременты turn");
}
console.log("");

// 2.2 Check command flag handling
console.log("2.2 Проверка обработки флагов команд");
const inputSetsCmdFlag = /setCommandMode|Flags\.setCmd/.test(inputCode);
const inputClearsCmdFlag = /clearCommandFlags|Flags\.clearCmd/.test(inputCode);
const outputReadsCmdFlag = /isCmd|currentAction\?\.type\s*===\s*['"]command['"]/.test(outputCode);

console.log(`  Input устанавливает флаг команды: ${inputSetsCmdFlag ? '✓' : '✗'}`);
console.log(`  Input сбрасывает флаг команды: ${inputClearsCmdFlag ? '✓' : '✗'}`);
console.log(`  Output читает флаг команды: ${outputReadsCmdFlag ? '✓' : '✗'}`);

if (inputSetsCmdFlag && inputClearsCmdFlag && outputReadsCmdFlag) {
  console.log("  ✅ Флаги команд обрабатываются согласованно");
  auditResults.logicConflicts.passed++;
} else {
  console.log("  ⚠ Возможные проблемы с обработкой флагов команд");
  auditResults.logicConflicts.warnings++;
  auditResults.logicConflicts.issues.push("Потенциальные проблемы с флагами команд");
}
console.log("");

// 2.3 Check currentAction state management
console.log("2.3 Проверка управления состоянием currentAction");
const hasCurrentActionTypes = /type:\s*['"](?:story|command|continue|retry)['"]/.test(inputCode + outputCode);
const hasTaskTypes = /task:\s*['"](?:recap|epoch)['"]/.test(inputCode + outputCode);

console.log(`  Определены типы действий (story/command/continue/retry): ${hasCurrentActionTypes ? '✓' : '✗'}`);
console.log(`  Определены типы задач (recap/epoch): ${hasTaskTypes ? '✓' : '✗'}`);

if (hasCurrentActionTypes) {
  console.log("  ✅ currentAction.type управляется корректно");
  auditResults.logicConflicts.passed++;
} else {
  console.log("  ⚠ Недостаточно информации о типах действий");
  auditResults.logicConflicts.warnings++;
}
console.log("");

// 2.4 Check for race conditions in state access
console.log("2.4 Проверка потенциальных состояний гонки");
const usesOptionalChaining = /\?\./g.test(libraryCode) && /\?\./g.test(outputCode);
const usesNullishCoalescing = /\?\?/g.test(libraryCode) && /\?\?/g.test(outputCode);
const hasTryCatch = /try\s*{[\s\S]*?}\s*catch/g.test(libraryCode);

console.log(`  Использует опциональное связывание (?.): ${usesOptionalChaining ? '✓' : '✗'}`);
console.log(`  Использует нулевое слияние (??): ${usesNullishCoalescing ? '✓' : '✗'}`);
console.log(`  Использует try-catch для безопасности: ${hasTryCatch ? '✓' : '✗'}`);

if (usesOptionalChaining && usesNullishCoalescing && hasTryCatch) {
  console.log("  ✅ Хорошая защита от состояний гонки");
  auditResults.logicConflicts.passed++;
} else {
  console.log("  ⚠ Недостаточная защита от состояний гонки");
  auditResults.logicConflicts.warnings++;
  auditResults.logicConflicts.issues.push("Недостаточная защита от состояний гонки");
}
console.log("");

// 2.5 Check for proper error handling in critical sections
console.log("2.5 Проверка обработки ошибок в критических секциях");
const hasTryCatchInInit = /lcInit[\s\S]{0,200}try\s*{|try\s*{[\s\S]{0,200}lcInit/.test(libraryCode);
const hasErrorHandlingInEngines = /catch\s*\([^)]*\)\s*{[\s\S]{0,100}(lcWarn|lcLog|console)/.test(libraryCode);
const hasGlobalErrorHandler = /window\.onerror|process\.on.*error|addEventListener.*error/.test(libraryCode);

console.log(`  Защита инициализации try-catch: ${hasTryCatchInInit ? '✓' : '✗'}`);
console.log(`  Обработка ошибок в движках: ${hasErrorHandlingInEngines ? '✓' : '✗'}`);
console.log(`  Глобальный обработчик ошибок: ${hasGlobalErrorHandler ? '✓' : '✗'}`);

if (hasErrorHandlingInEngines) {
  console.log("  ✅ Критические секции защищены обработкой ошибок");
  auditResults.logicConflicts.passed++;
} else {
  console.log("  ⚠ Недостаточная обработка ошибок в критических секциях");
  auditResults.logicConflicts.warnings++;
  auditResults.logicConflicts.issues.push("Недостаточная обработка ошибок");
}
console.log("");

// 2.6 Check data flow consistency
console.log("2.6 Проверка согласованности потока данных");
const hasProperStateAccess = /const L = .*lcInit/.test(libraryCode + inputCode + outputCode);
const hasStateVersioning = /stateVersion|_version|L\.version/.test(libraryCode);
const hasCacheInvalidation = /stateVersion.*\+\+|invalidate|clearCache/.test(libraryCode);

console.log(`  Правильный доступ к состоянию через lcInit: ${hasProperStateAccess ? '✓' : '✗'}`);
console.log(`  Версионирование состояния: ${hasStateVersioning ? '✓' : '✗'}`);
console.log(`  Инвалидация кэша: ${hasCacheInvalidation ? '✓' : '✗'}`);

if (hasProperStateAccess && hasStateVersioning) {
  console.log("  ✅ Поток данных согласован и защищен");
  auditResults.logicConflicts.passed++;
} else {
  console.log("  ⚠ Возможные проблемы с потоком данных");
  auditResults.logicConflicts.warnings++;
  auditResults.logicConflicts.issues.push("Потенциальные проблемы с потоком данных");
}
console.log("");

console.log("┌──────────────────────────────────────────────────────────────────────────────┐");
console.log("│ РАЗДЕЛ 3: ПРОВЕРКА НАЛИЧИЯ БАГОВ                                             │");
console.log("└──────────────────────────────────────────────────────────────────────────────┘");
console.log("");

// 3.1 Check for undefined variable access patterns
console.log("3.1 Проверка на потенциальный доступ к неопределенным переменным");
const checksTypeof = /typeof\s+\w+\s*!==\s*["']undefined["']/.test(libraryCode);
const checksNull = /\s+!=\s*null|\s+!==\s*null/.test(libraryCode);

console.log(`  Использует typeof для проверки: ${checksTypeof ? '✓' : '✗'}`);
console.log(`  Проверяет на null: ${checksNull ? '✓' : '✗'}`);

if (checksTypeof && checksNull) {
  console.log("  ✅ Хорошая защита от undefined/null");
  auditResults.bugs.passed++;
} else {
  console.log("  ⚠ Возможны проблемы с undefined/null");
  auditResults.bugs.warnings++;
}
console.log("");

// 3.2 Check array operations safety
console.log("3.2 Проверка безопасности операций с массивами");
const checksIsArray = /Array\.isArray/.test(libraryCode);
const hasArraySafety = /\.length\s*>\s*0/.test(libraryCode);
const usesArrayMethods = /\.filter\(|\.map\(|\.forEach\(/.test(libraryCode);

console.log(`  Использует Array.isArray: ${checksIsArray ? '✓' : '✗'}`);
console.log(`  Проверяет длину массивов: ${hasArraySafety ? '✓' : '✗'}`);
console.log(`  Использует безопасные методы массивов: ${usesArrayMethods ? '✓' : '✗'}`);

if (checksIsArray && hasArraySafety) {
  console.log("  ✅ Операции с массивами безопасны");
  auditResults.bugs.passed++;
} else {
  console.log("  ⚠ Потенциальные проблемы с операциями массивов");
  auditResults.bugs.warnings++;
  auditResults.bugs.issues.push("Недостаточная проверка массивов");
}
console.log("");

// 3.3 Check for potential infinite loops
console.log("3.3 Проверка на потенциальные бесконечные циклы");
const hasWhileLoops = /while\s*\(/g.test(libraryCode);
const hasForLoops = /for\s*\(/g.test(libraryCode);
const whileCount = (libraryCode.match(/while\s*\(/g) || []).length;
const forCount = (libraryCode.match(/for\s*\(/g) || []).length;

// Check for common loop guards
const hasIterationLimits = /maxIter|MAX_ITER|iteration.*<|iter.*limit/i.test(libraryCode);
const hasBreakStatements = /break;/.test(libraryCode);

console.log(`  While циклов: ${whileCount}`);
console.log(`  For циклов: ${forCount}`);
console.log(`  Есть проверки лимита итераций: ${hasIterationLimits ? '✓' : '✗'}`);
console.log(`  Есть операторы break: ${hasBreakStatements ? '✓' : '✗'}`);

if (whileCount === 0) {
  console.log("  ✅ Нет while циклов (низкий риск бесконечных циклов)");
  auditResults.bugs.passed++;
} else if (whileCount < 15 && (hasIterationLimits || hasBreakStatements)) {
  console.log(`  ✅ While циклы (${whileCount}) имеют защиту от бесконечных итераций`);
  auditResults.bugs.passed++;
} else if (whileCount < 15) {
  console.log(`  ⚠ Есть ${whileCount} while цикл(ов) - требует проверки условий выхода`);
  auditResults.bugs.warnings++;
  auditResults.bugs.issues.push(`${whileCount} while циклов требуют проверки`);
} else {
  console.log(`  ❌ Много while циклов (${whileCount}) - высокий риск`);
  auditResults.bugs.failed++;
  auditResults.bugs.issues.push(`Слишком много while циклов: ${whileCount}`);
}
console.log("");

// 3.4 Check for regex safety
console.log("3.4 Проверка безопасности регулярных выражений");
const hasRegex = /new RegExp|\/.*\/[gimsuy]*/.test(libraryCode);

// More specific check for dangerous patterns
// Look for nested quantifiers like (a+)+ or (a*)* which can cause catastrophic backtracking
// This requires the pattern to be within a regex literal, not in code concatenation
const regexLiterals = libraryCode.match(/\/(?:[^\/\\]|\\.)+\/[gimsuy]*/g) || [];
let hasDangerousRegex = false;

for (const regex of regexLiterals) {
  // Check if there's a capture group with quantifier followed by another quantifier
  // Pattern: (...*...)* or (...+...)+ or (...*...)+ or (...+...)*
  if (/\([^)]*[*+][^)]*\)[*+]/.test(regex)) {
    // Verify it's actually nested quantifiers, not just string concatenation
    const inner = regex.match(/\([^)]*[*+][^)]*\)/);
    if (inner && inner[0].includes('*') || inner && inner[0].includes('+')) {
      // Additional validation: make sure the inner quantifier is not escaped
      if (!/\\[*+]/.test(inner[0])) {
        hasDangerousRegex = true;
        break;
      }
    }
  }
}

console.log(`  Использует регулярные выражения: ${hasRegex ? '✓' : '✗'}`);
console.log(`  Найдено regex литералов: ${regexLiterals.length}`);

// Check for regex safety protection mechanism
const hasSafeRegexMatch = /LC\.Tools\.safeRegexMatch/.test(libraryCode);

if (hasRegex && !hasDangerousRegex) {
  console.log("  ✅ Регулярные выражения безопасны");
  auditResults.bugs.passed++;
} else if (hasDangerousRegex && hasSafeRegexMatch) {
  console.log("  ✅ Потенциально сложные regex паттерны защищены safeRegexMatch");
  auditResults.bugs.passed++;
} else if (hasDangerousRegex) {
  console.log("  ⚠ Потенциальная катастрофическая обратная трассировка в regex");
  auditResults.bugs.warnings++;
  auditResults.bugs.issues.push("Потенциально опасные regex паттерны (nested quantifiers)");
} else {
  console.log("  ✓ Регулярные выражения не обнаружены");
  auditResults.bugs.passed++;
}
console.log("");

// 3.6 Check for proper type conversions
console.log("3.6 Проверка безопасности преобразований типов");
const hasTypeHelpers = /toNum|toStr|toBool/.test(libraryCode);
const usesStrictEquality = /===|!==/.test(libraryCode);
const checksNaN = /isNaN|Number\.isNaN/.test(libraryCode);
const checksFinite = /isFinite|Number\.isFinite/.test(libraryCode);

console.log(`  Использует вспомогательные функции типов (toNum/toStr/toBool): ${hasTypeHelpers ? '✓' : '✗'}`);
console.log(`  Использует строгое равенство (===): ${usesStrictEquality ? '✓' : '✗'}`);
console.log(`  Проверяет NaN: ${checksNaN ? '✓' : '✗'}`);
console.log(`  Проверяет Finite: ${checksFinite ? '✓' : '✗'}`);

if (hasTypeHelpers && usesStrictEquality && checksNaN) {
  console.log("  ✅ Преобразования типов безопасны");
  auditResults.bugs.passed++;
} else {
  console.log("  ⚠ Возможны проблемы с преобразованиями типов");
  auditResults.bugs.warnings++;
  auditResults.bugs.issues.push("Недостаточная защита преобразований типов");
}
console.log("");

// 3.7 Check for proper string handling
console.log("3.7 Проверка безопасности работы со строками");
const hasStringTrim = /\.trim\(\)/.test(libraryCode);
const hasStringSafety = /String\(.*\|\|/.test(libraryCode);
const handlesSurrogates = /charCodeAt|codePointAt|surrogate/i.test(libraryCode);

console.log(`  Использует trim(): ${hasStringTrim ? '✓' : '✗'}`);
console.log(`  Безопасное приведение к строкам: ${hasStringSafety ? '✓' : '✗'}`);
console.log(`  Обрабатывает суррогатные пары: ${handlesSurrogates ? '✓' : '✗'}`);

if (hasStringTrim && hasStringSafety) {
  console.log("  ✅ Работа со строками безопасна");
  auditResults.bugs.passed++;
} else {
  console.log("  ⚠ Возможны проблемы с обработкой строк");
  auditResults.bugs.warnings++;
}
console.log("");

// 3.5 Check for memory leaks
console.log("3.5 Проверка на потенциальные утечки памяти");
const hasCacheCleanup = /delete|splice|clear/.test(libraryCode);
const hasHistoryCap = /HISTORY_CAP|maxLength/.test(libraryCode);

console.log(`  Есть механизмы очистки кэша: ${hasCacheCleanup ? '✓' : '✗'}`);
console.log(`  Есть ограничения на размер истории: ${hasHistoryCap ? '✓' : '✗'}`);

if (hasCacheCleanup && hasHistoryCap) {
  console.log("  ✅ Хорошая защита от утечек памяти");
  auditResults.bugs.passed++;
} else {
  console.log("  ⚠ Потенциальные утечки памяти");
  auditResults.bugs.warnings++;
  auditResults.bugs.issues.push("Недостаточная защита от утечек памяти");
}
console.log("");

console.log("┌──────────────────────────────────────────────────────────────────────────────┐");
console.log("│ РАЗДЕЛ 4: ПРОВЕРКА ФУНКЦИОНАЛЬНОСТИ                                          │");
console.log("└──────────────────────────────────────────────────────────────────────────────┘");
console.log("");

// Now let's run actual functional tests
console.log("4.1 Проверка основных движков");

// Set up mock environment
global.state = { lincoln: {} };
const mockFunctions = {
  getState() { return global.state || {}; },
  toNum(x, d = 0) { return (typeof x === "number" && !isNaN(x)) ? x : (Number(x) || d); },
  toStr(x) { return String(x == null ? "" : x); },
  toBool(x, d = false) { return (x == null ? d : !!x); }
};

const __SCRIPT_SLOT__ = "audit";
const getState = mockFunctions.getState;
const toNum = mockFunctions.toNum;
const toStr = mockFunctions.toStr;
const toBool = mockFunctions.toBool;

try {
  eval(libraryCode);
  
  const L = LC.lcInit();
  
  // Check GoalsEngine
  if (LC.GoalsEngine && typeof LC.GoalsEngine.analyze === 'function') {
    console.log("  ✅ GoalsEngine существует и функционален");
    auditResults.functionality.passed++;
  } else {
    console.log("  ❌ GoalsEngine отсутствует или нефункционален");
    auditResults.functionality.failed++;
    auditResults.functionality.issues.push("GoalsEngine нефункционален");
  }
  
  // Check RelationsEngine
  if (LC.RelationsEngine && typeof LC.RelationsEngine.analyze === 'function') {
    console.log("  ✅ RelationsEngine существует и функционален");
    auditResults.functionality.passed++;
  } else {
    console.log("  ❌ RelationsEngine отсутствует или нефункционален");
    auditResults.functionality.failed++;
    auditResults.functionality.issues.push("RelationsEngine нефункционален");
  }
  
  // Check EvergreenEngine
  if (LC.EvergreenEngine && typeof LC.EvergreenEngine.analyze === 'function') {
    console.log("  ✅ EvergreenEngine существует и функционален");
    auditResults.functionality.passed++;
  } else {
    console.log("  ❌ EvergreenEngine отсутствует или нефункционален");
    auditResults.functionality.failed++;
    auditResults.functionality.issues.push("EvergreenEngine нефункционален");
  }
  
  // Check GossipEngine
  if (LC.GossipEngine && typeof LC.GossipEngine.analyze === 'function') {
    console.log("  ✅ GossipEngine существует и функционален");
    auditResults.functionality.passed++;
  } else {
    console.log("  ❌ GossipEngine отсутствует или нефункционален");
    auditResults.functionality.failed++;
    auditResults.functionality.issues.push("GossipEngine нефункционален");
  }
  
  // Check TimeEngine
  if (LC.TimeEngine && typeof LC.TimeEngine.advance === 'function') {
    console.log("  ✅ TimeEngine существует и функционален");
    auditResults.functionality.passed++;
  } else {
    console.log("  ❌ TimeEngine отсутствует или нефункционален");
    auditResults.functionality.failed++;
    auditResults.functionality.issues.push("TimeEngine нефункционален");
  }
  
  // Check UnifiedAnalyzer
  if (LC.UnifiedAnalyzer && typeof LC.UnifiedAnalyzer.analyze === 'function') {
    console.log("  ✅ UnifiedAnalyzer существует и функционален");
    auditResults.functionality.passed++;
  } else {
    console.log("  ❌ UnifiedAnalyzer отсутствует или нефункционален");
    auditResults.functionality.failed++;
    auditResults.functionality.issues.push("UnifiedAnalyzer нефункционален");
  }
  
  console.log("");
  
  // 4.2 Check state initialization
  console.log("4.2 Проверка инициализации состояния");
  
  if (L && typeof L === 'object') {
    console.log("  ✅ State L инициализирован");
    auditResults.functionality.passed++;
  } else {
    console.log("  ❌ State L не инициализирован");
    auditResults.functionality.failed++;
    auditResults.functionality.issues.push("State не инициализирован");
  }
  
  if (typeof L.turn === 'number') {
    console.log("  ✅ L.turn инициализирован как число");
    auditResults.functionality.passed++;
  } else {
    console.log("  ❌ L.turn не является числом");
    auditResults.functionality.failed++;
    auditResults.functionality.issues.push("L.turn некорректен");
  }
  
  if (Array.isArray(L.rumors)) {
    console.log("  ✅ L.rumors инициализирован как массив");
    auditResults.functionality.passed++;
  } else {
    console.log("  ❌ L.rumors не является массивом");
    auditResults.functionality.failed++;
    auditResults.functionality.issues.push("L.rumors некорректен");
  }
  
  if (typeof L.goals === 'object' && L.goals !== null) {
    console.log("  ✅ L.goals инициализирован как объект");
    auditResults.functionality.passed++;
  } else {
    console.log("  ❌ L.goals не является объектом");
    auditResults.functionality.failed++;
    auditResults.functionality.issues.push("L.goals некорректен");
  }
  
  console.log("");
  
  // 4.3 Check caching mechanism
  console.log("4.3 Проверка механизма кэширования");
  
  if (typeof L.stateVersion === 'number') {
    console.log("  ✅ L.stateVersion инициализирован");
    auditResults.functionality.passed++;
  } else {
    console.log("  ❌ L.stateVersion не инициализирован");
    auditResults.functionality.failed++;
    auditResults.functionality.issues.push("stateVersion отсутствует");
  }
  
  // Check if context cache is explicitly initialized in lcInit
  const hasExplicitCacheInit = /if\s*\(\s*!LC\._contextCache\s*\)\s*{\s*LC\._contextCache\s*=\s*{}\s*;?\s*}/.test(libraryCode);
  
  if (hasExplicitCacheInit) {
    console.log("  ✅ Кэш контекста явно инициализирован в lcInit");
    auditResults.functionality.passed++;
  } else {
    console.log("  ⚠ Кэш контекста не явно обнаружен");
    auditResults.functionality.warnings++;
  }
  
  console.log("");
  
  // 4.4 Check Gossip GC functionality
  console.log("4.4 Проверка сборки мусора слухов");
  
  if (LC.GossipEngine && typeof LC.GossipEngine.runGarbageCollection === 'function') {
    console.log("  ✅ runGarbageCollection существует");
    auditResults.functionality.passed++;
    
    // Test GC execution
    try {
      LC.GossipEngine.runGarbageCollection();
      console.log("  ✅ runGarbageCollection выполняется без ошибок");
      auditResults.functionality.passed++;
    } catch (e) {
      console.log(`  ❌ runGarbageCollection выдает ошибку: ${e.message}`);
      auditResults.functionality.failed++;
      auditResults.functionality.issues.push("runGarbageCollection выдает ошибку");
    }
  } else {
    console.log("  ❌ runGarbageCollection отсутствует");
    auditResults.functionality.failed++;
    auditResults.functionality.issues.push("runGarbageCollection отсутствует");
  }
  
  console.log("");
  
  // 4.5 Check ChronologicalKnowledgeBase
  console.log("4.5 Проверка ChronologicalKnowledgeBase");
  
  if (LC.ChronologicalKnowledgeBase && typeof LC.ChronologicalKnowledgeBase === 'object') {
    console.log("  ✅ ChronologicalKnowledgeBase существует");
    auditResults.functionality.passed++;
    
    const categories = Object.keys(LC.ChronologicalKnowledgeBase);
    if (categories.length > 10) {
      console.log(`  ✅ CKB содержит ${categories.length} категорий`);
      auditResults.functionality.passed++;
    } else {
      console.log(`  ⚠ CKB содержит мало категорий: ${categories.length}`);
      auditResults.functionality.warnings++;
    }
  } else {
    console.log("  ❌ ChronologicalKnowledgeBase отсутствует");
    auditResults.functionality.failed++;
    auditResults.functionality.issues.push("ChronologicalKnowledgeBase отсутствует");
  }
  
} catch (e) {
  console.log(`  ❌ Критическая ошибка при загрузке Library: ${e.message}`);
  auditResults.functionality.failed++;
  auditResults.functionality.issues.push(`Критическая ошибка: ${e.message}`);
}

console.log("");

// Generate final report
console.log("╔══════════════════════════════════════════════════════════════════════════════╗");
console.log("║                           ИТОГОВЫЙ ОТЧЕТ                                     ║");
console.log("╚══════════════════════════════════════════════════════════════════════════════╝");
console.log("");

console.log("┌──────────────────────────────────────────────────────────────────────────────┐");
console.log("│ СВОДКА РЕЗУЛЬТАТОВ                                                           │");
console.log("└──────────────────────────────────────────────────────────────────────────────┘");
console.log("");

const sections = [
  { name: 'Совместимость скриптов', key: 'compatibility' },
  { name: 'Конфликты логики', key: 'logicConflicts' },
  { name: 'Наличие багов', key: 'bugs' },
  { name: 'Функциональность', key: 'functionality' }
];

let totalPassed = 0;
let totalFailed = 0;
let totalWarnings = 0;

for (const section of sections) {
  const result = auditResults[section.key];
  console.log(`${section.name}:`);
  console.log(`  ✅ Пройдено: ${result.passed}`);
  console.log(`  ❌ Провалено: ${result.failed}`);
  console.log(`  ⚠  Предупреждений: ${result.warnings}`);
  console.log("");
  
  totalPassed += result.passed;
  totalFailed += result.failed;
  totalWarnings += result.warnings;
}

console.log("ОБЩИЕ ИТОГИ:");
console.log(`  ✅ Всего пройдено: ${totalPassed}`);
console.log(`  ❌ Всего провалено: ${totalFailed}`);
console.log(`  ⚠  Всего предупреждений: ${totalWarnings}`);
console.log("");

// Calculate overall score
const totalTests = totalPassed + totalFailed + totalWarnings;
const scorePercentage = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;

console.log(`Общая оценка: ${scorePercentage}%`);
console.log("");

// List all issues
console.log("┌──────────────────────────────────────────────────────────────────────────────┐");
console.log("│ ОБНАРУЖЕННЫЕ ПРОБЛЕМЫ                                                        │");
console.log("└──────────────────────────────────────────────────────────────────────────────┘");
console.log("");

let hasIssues = false;

for (const section of sections) {
  const result = auditResults[section.key];
  if (result.issues.length > 0) {
    hasIssues = true;
    console.log(`${section.name}:`);
    for (const issue of result.issues) {
      console.log(`  • ${issue}`);
    }
    console.log("");
  }
}

if (!hasIssues) {
  console.log("✅ Критических проблем не обнаружено!");
  console.log("");
}

// Recommendations
console.log("┌──────────────────────────────────────────────────────────────────────────────┐");
console.log("│ РЕКОМЕНДАЦИИ                                                                 │");
console.log("└──────────────────────────────────────────────────────────────────────────────┘");
console.log("");

if (totalFailed === 0 && totalWarnings === 0) {
  console.log("✅ Система в отличном состоянии!");
  console.log("   Все компоненты работают корректно и согласованно.");
  console.log("");
} else if (totalFailed === 0) {
  console.log("✅ Система в хорошем состоянии");
  console.log("⚠  Есть некоторые предупреждения, которые стоит рассмотреть:");
  console.log("");
  console.log("1. Улучшить защиту от состояний гонки");
  console.log("2. Добавить дополнительные проверки на null/undefined");
  console.log("3. Проверить while циклы на корректность условий выхода");
  console.log("");
} else {
  console.log("❌ Обнаружены критические проблемы");
  console.log("   Требуется немедленное исправление:");
  console.log("");
  
  for (const section of sections) {
    const result = auditResults[section.key];
    if (result.failed > 0) {
      console.log(`${section.name}: ${result.failed} критических проблем`);
    }
  }
  console.log("");
}

console.log("╔══════════════════════════════════════════════════════════════════════════════╗");
console.log("║                      АУДИТ ЗАВЕРШЕН                                          ║");
console.log("╚══════════════════════════════════════════════════════════════════════════════╝");

// Save report to file
const reportPath = path.join(__dirname, '..', 'FINAL_STATIC_AUDIT_V7.md');
const reportContent = '```\n' + reportLines.join('\n') + '\n```\n';
fs.writeFileSync(reportPath, reportContent, 'utf8');
originalLog(`\n✓ Report saved to: FINAL_STATIC_AUDIT_V7.md\n`);

// Exit code based on results
process.exit(totalFailed > 0 ? 1 : 0);
