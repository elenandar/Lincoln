#!/usr/bin/env node
/**
 * Тикет 3: "Протокол 'Легион', Часть 3 — Расширенные Интеграционные и Нагрузочные Тесты"
 * 
 * Test: Implement Advanced Integration and Endurance Scenarios
 * 
 * This test validates system resilience against:
 * 1. Seesaw Scenario (Качели) - Say -> Retry -> Erase -> Say
 * 2. Command Spam Scenario (Спам Командами) - Say -> /help -> Say
 */

const path = require('path');
const harness = require('../../test_harness.js');

console.log("=== Протокол 'Легион': Расширенные Интеграционные Тесты ===\n");

// Helper function to load all scripts
function loadAllScripts() {
  const baseDir = path.join(__dirname, '..', '..', '..');
  harness.loadScript(path.join(baseDir, 'Library v16.0.8.patched.txt'));
  harness.loadScript(path.join(baseDir, 'Input v16.0.8.patched.txt'));
  harness.loadScript(path.join(baseDir, 'Context v16.0.8.patched.txt'));
  harness.loadScript(path.join(baseDir, 'Output v16.0.8.patched.txt'));
}

// Test counter
let testsPassed = 0;
let testsFailed = 0;

// Helper function for assertions
function assert(testName, condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    testsPassed++;
  } else {
    console.log(`  ✗ ${message}`);
    testsFailed++;
  }
}

// ============================================================================
// ADVANCED TEST 1: Seesaw Scenario (Качели)
// Say -> Retry -> Erase -> Say
// ============================================================================
console.log("ADVANCED TEST 1: Seesaw Scenario (Качели)\n");
console.log("Scenario: Say -> Retry -> Erase -> Say");
console.log("Expected: System correctly handles complex state transitions\n");

harness.reset();
loadAllScripts();

// Set up initial scenario
harness.setMemory(
  "Вы играете за Максима, студента Lincoln Heights High.",
  "Жанр: школьная драма"
);

// Step 1: Initial Say action
console.log("Step 1: Performing Say action...");
harness.performSay("Максим вошёл в школу утром.");
const afterSay1Turn = harness.getState().turn;
const afterSay1Actions = harness.getActions().length;
const afterSay1Results = harness.getResults().length;

console.log(`  After Say: Turn ${afterSay1Turn}, Actions: ${afterSay1Actions}, Results: ${afterSay1Results}`);
assert("SEESAW", afterSay1Turn === 1, `Turn is 1 after first Say (actual: ${afterSay1Turn})`);
assert("SEESAW", afterSay1Actions === 1, `Actions array has 1 entry (actual: ${afterSay1Actions})`);
assert("SEESAW", afterSay1Results === 1, `Results array has 1 entry (actual: ${afterSay1Results})`);

// Step 2: Retry action
console.log("\nStep 2: Performing Retry action...");
harness.performRetry();
const afterRetryTurn = harness.getState().turn;
const afterRetryActions = harness.getActions().length;
const afterRetryResults = harness.getResults().length;

console.log(`  After Retry: Turn ${afterRetryTurn}, Actions: ${afterRetryActions}, Results: ${afterRetryResults}`);
// Note: Retry may convert to Continue in some cases
assert("SEESAW", afterRetryTurn >= afterSay1Turn, 
  `Turn count stable or advanced (${afterSay1Turn} -> ${afterRetryTurn})`);
assert("SEESAW", afterRetryActions >= 1, 
  `Actions array maintained (actual: ${afterRetryActions})`);

// Step 3: Erase action
console.log("\nStep 3: Performing Erase action...");
const eraseSuccess = harness.performErase();
const afterEraseTurn = harness.getState().turn;
const afterEraseActions = harness.getActions().length;
const afterEraseResults = harness.getResults().length;

console.log(`  After Erase: Turn ${afterEraseTurn}, Actions: ${afterEraseActions}, Results: ${afterEraseResults}`);
assert("SEESAW", eraseSuccess === true, "Erase action successful");
assert("SEESAW", afterEraseActions < afterRetryActions || afterEraseActions === 0, 
  `Actions reduced after Erase (${afterRetryActions} -> ${afterEraseActions})`);
assert("SEESAW", afterEraseResults < afterRetryResults || afterEraseResults === 0, 
  `Results reduced after Erase (${afterRetryResults} -> ${afterEraseResults})`);

// Step 4: New Say action after Erase
console.log("\nStep 4: Performing new Say action after Erase...");
harness.performSay("Максим улыбнулся.");
const afterSay2Turn = harness.getState().turn;
const afterSay2Actions = harness.getActions().length;
const afterSay2Results = harness.getResults().length;

console.log(`  After second Say: Turn ${afterSay2Turn}, Actions: ${afterSay2Actions}, Results: ${afterSay2Results}`);
assert("SEESAW", afterSay2Actions === afterEraseActions + 1, 
  `Actions incremented after new Say (${afterEraseActions} -> ${afterSay2Actions})`);
assert("SEESAW", afterSay2Results === afterEraseResults + 1, 
  `Results incremented after new Say (${afterEraseResults} -> ${afterSay2Results})`);
assert("SEESAW", afterSay2Turn === afterEraseTurn + 1, 
  `Turn incremented correctly (${afterEraseTurn} -> ${afterSay2Turn})`);

// Verify arrays are synchronized
assert("SEESAW", afterSay2Actions === afterSay2Results, 
  `Actions and Results arrays synchronized (Actions: ${afterSay2Actions}, Results: ${afterSay2Results})`);

console.log("\n" + "─".repeat(60) + "\n");

// ============================================================================
// ADVANCED TEST 2: Command Spam Scenario (Спам Командами)
// Say -> /help -> Say
// ============================================================================
console.log("ADVANCED TEST 2: Command Spam Scenario (Спам Командами)\n");
console.log("Scenario: Say -> /help -> Say");
console.log("Expected: Commands don't break state, story continues normally\n");

harness.reset();
loadAllScripts();

// Set up initial scenario
harness.setMemory(
  "Вы играете за Максима, студента Lincoln Heights High.",
  "Жанр: школьная драма"
);

// Step 1: Initial Say action
console.log("Step 1: Performing Say action...");
harness.performSay("Максим вошёл в класс.");
const beforeHelpTurn = harness.getState().turn;
const beforeHelpActions = harness.getActions().length;
const beforeHelpResults = harness.getResults().length;

console.log(`  After Say: Turn ${beforeHelpTurn}, Actions: ${beforeHelpActions}, Results: ${beforeHelpResults}`);
assert("CMDSPAM", beforeHelpTurn === 1, `Turn is 1 after Say (actual: ${beforeHelpTurn})`);
assert("CMDSPAM", beforeHelpActions === 1, `Actions array has 1 entry (actual: ${beforeHelpActions})`);

// Step 2: Execute /help command
console.log("\nStep 2: Executing /help command...");
const helpResult = harness.performSay("/help");
const afterHelpTurn = harness.getState().turn;
const afterHelpActions = harness.getActions().length;
const afterHelpResults = harness.getResults().length;

console.log(`  After /help: Turn ${afterHelpTurn}, Actions: ${afterHelpActions}, Results: ${afterHelpResults}`);
assert("CMDSPAM", helpResult.stopped === true, "Help command stopped execution");
assert("CMDSPAM", helpResult.commandOutput && helpResult.commandOutput.length > 0, 
  "Help command returned output");

// Commands still add to history
assert("CMDSPAM", afterHelpActions === beforeHelpActions + 1, 
  `Commands add to actions (${beforeHelpActions} -> ${afterHelpActions})`);

// Step 3: Continue with normal Say action
console.log("\nStep 3: Performing Say action after command...");
harness.performSay("Он сел за парту.");
const afterSay3Turn = harness.getState().turn;
const afterSay3Actions = harness.getActions().length;
const afterSay3Results = harness.getResults().length;

console.log(`  After Say: Turn ${afterSay3Turn}, Actions: ${afterSay3Actions}, Results: ${afterSay3Results}`);
assert("CMDSPAM", afterSay3Actions === afterHelpActions + 1, 
  `Actions incremented (${afterHelpActions} -> ${afterSay3Actions})`);
assert("CMDSPAM", afterSay3Turn > beforeHelpTurn, 
  `Turn advanced after command (${beforeHelpTurn} -> ${afterSay3Turn})`);

// Verify system is still functioning normally
assert("CMDSPAM", afterSay3Actions > 0 && afterSay3Results > 0, 
  "System functioning normally after command spam");

console.log("\n" + "─".repeat(60) + "\n");

// ============================================================================
// ADVANCED TEST 3: Multiple Command Spam
// Stress test with multiple commands in sequence
// ============================================================================
console.log("ADVANCED TEST 3: Multiple Command Spam\n");
console.log("Scenario: Say -> /help -> /help -> /help -> Say");
console.log("Expected: System handles multiple commands without issues\n");

harness.reset();
loadAllScripts();

harness.setMemory(
  "Вы играете за Максима, студента Lincoln Heights High.",
  "Жанр: школьная драма"
);

// Initial action
console.log("Performing initial Say...");
harness.performSay("Максим проснулся.");
const initialTurnMulti = harness.getState().turn;

// Spam commands
console.log("Spamming /help command 3 times...");
for (let i = 0; i < 3; i++) {
  const cmdResult = harness.performSay("/help");
  assert("MULTISPAM", cmdResult.stopped === true, 
    `Help command ${i + 1} stopped execution`);
}

const afterSpamTurn = harness.getState().turn;
const afterSpamActions = harness.getActions().length;

// Continue normal operation
console.log("\nContinuing with normal Say...");
harness.performSay("Он потянулся.");
const finalTurnMulti = harness.getState().turn;
const finalActionsMulti = harness.getActions().length;

console.log(`  Initial turn: ${initialTurnMulti}, After spam turn: ${afterSpamTurn}, Final turn: ${finalTurnMulti}`);
console.log(`  Actions: ${finalActionsMulti}`);

assert("MULTISPAM", finalTurnMulti > initialTurnMulti, 
  `Turn advanced after command spam (${initialTurnMulti} -> ${finalTurnMulti})`);
assert("MULTISPAM", finalActionsMulti >= 5, 
  `All actions recorded (expected >= 5, actual: ${finalActionsMulti})`);

console.log("\n" + "─".repeat(60) + "\n");

// ============================================================================
// SUMMARY
// ============================================================================
console.log("=".repeat(60));
console.log("TEST SUMMARY\n");
console.log(`Tests Passed: ${testsPassed}`);
console.log(`Tests Failed: ${testsFailed}\n`);

if (testsFailed === 0) {
  console.log("✅ ALL ADVANCED INTEGRATION TESTS PASSED");
  console.log("\nProtocol 'Легион' Part 3 validation complete:");
  console.log("  ✓ Seesaw scenario (Say -> Retry -> Erase -> Say) works correctly");
  console.log("  ✓ Arrays stay synchronized through complex transitions");
  console.log("  ✓ Turn counter maintains integrity");
  console.log("  ✓ Command spam doesn't break state");
  console.log("  ✓ System recovers after commands and continues normally");
  console.log("  ✓ Multiple consecutive commands handled correctly");
  console.log("\nSystem is resilient against advanced integration scenarios! 🛡️");
  process.exit(0);
} else {
  console.log("❌ SOME ADVANCED INTEGRATION TESTS FAILED");
  console.log("Review the failures above and investigate.");
  process.exit(1);
}
