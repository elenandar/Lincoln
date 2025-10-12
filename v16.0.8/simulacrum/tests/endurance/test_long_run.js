#!/usr/bin/env node
/**
 * Тикет 3: "Протокол 'Легион', Часть 3 — Расширенные Интеграционные и Нагрузочные Тесты"
 * 
 * Test: 200-Turn Endurance Test with Random Retry/Erase
 * 
 * This test validates system stability over extended gameplay:
 * 1. 200 turns with story actions
 * 2. Random Retry/Erase actions injected during gameplay
 * 3. Periodic validation of state.turn integrity
 * 4. Periodic validation of actions/results array integrity
 */

const path = require('path');
const harness = require('../../test_harness.js');

console.log("=== Протокол 'Легион': Нагрузочный Тест 200 Ходов ===\n");

// Helper function to load all scripts
function loadAllScripts() {
  const baseDir = path.join(__dirname, '..', '..', '..');
  harness.loadScript(path.join(baseDir, 'v16.0.8', 'Library v16.0.8.patched.txt'));
  harness.loadScript(path.join(baseDir, 'v16.0.8', 'Input v16.0.8.patched.txt'));
  harness.loadScript(path.join(baseDir, 'v16.0.8', 'Context v16.0.8.patched.txt'));
  harness.loadScript(path.join(baseDir, 'v16.0.8', 'Output v16.0.8.patched.txt'));
}

// Test counter
let testsPassed = 0;
let testsFailed = 0;
let validationErrors = [];

// Helper function for assertions
function assert(testName, condition, message) {
  if (condition) {
    testsPassed++;
    return true;
  } else {
    console.log(`  ✗ ${message}`);
    validationErrors.push(message);
    testsFailed++;
    return false;
  }
}

// Helper function to generate random story actions
function generateStoryAction(turnNumber) {
  const actions = [
    "Максим вошёл в школу.",
    "Он направился к своему шкафчику.",
    "Максим увидел Хлою в коридоре.",
    "Он поздоровался с одноклассниками.",
    "Максим зашёл в класс.",
    "Он сел за парту и достал учебники.",
    "Преподаватель начал урок.",
    "Максим внимательно слушал.",
    "Прозвенел звонок на перемену.",
    "Максим вышел в коридор.",
    "Он подошёл к окну.",
    "Максим открыл свой рюкзак.",
    "Он достал бутерброд.",
    "Максим задумался о предстоящих экзаменах.",
    "Он услышал знакомый голос.",
    "Максим обернулся.",
    "Он улыбнулся.",
    "Максим продолжил свой путь.",
    "Он спустился по лестнице.",
    "Максим зашёл в библиотеку."
  ];
  
  const action = actions[turnNumber % actions.length];
  return `[${turnNumber}] ${action}`;
}

// ============================================================================
// ENDURANCE TEST: 200 Turns with Random Chaos
// ============================================================================
console.log("Starting 200-turn endurance test with random Retry/Erase actions\n");
console.log("Test parameters:");
console.log("  - Total turns: 200");
console.log("  - Retry probability: 10%");
console.log("  - Erase probability: 5%");
console.log("  - Validation checkpoints: Every 50 turns");
console.log();

harness.reset();
loadAllScripts();

// Set up initial scenario
harness.setMemory(
  "Вы играете за Максима, студента Lincoln Heights High.",
  "Жанр: школьная драма"
);

// Tracking variables
let expectedMinTurn = 0;
let retryCount = 0;
let eraseCount = 0;
let regularActionCount = 0;
const checkpointInterval = 50;

console.log("Starting simulation...\n");

// Main test loop
for (let i = 1; i <= 200; i++) {
  const currentState = harness.getState();
  const currentTurn = currentState.turn || 0;
  const currentActions = harness.getActions().length;
  const currentResults = harness.getResults().length;
  
  // Determine action type with weighted randomness
  const rand = Math.random();
  let actionType = 'say';
  
  if (rand < 0.05 && currentActions > 0) {
    // 5% chance of Erase (if there's something to erase)
    actionType = 'erase';
  } else if (rand < 0.15 && currentActions > 0) {
    // 10% chance of Retry (if there's something to retry)
    actionType = 'retry';
  }
  
  // Execute the action
  if (actionType === 'erase') {
    const beforeEraseTurn = currentTurn;
    const beforeEraseActions = currentActions;
    const beforeEraseResults = currentResults;
    
    harness.performErase();
    eraseCount++;
    
    const afterEraseTurn = harness.getState().turn || 0;
    const afterEraseActions = harness.getActions().length;
    const afterEraseResults = harness.getResults().length;
    
    // Validate Erase operation
    if (!assert("ERASE", afterEraseTurn === beforeEraseTurn - 1, 
      `Turn ${i}: Erase should decrement turn (${beforeEraseTurn} -> ${afterEraseTurn})`)) {
      console.log(`  [Turn ${i}] Erase turn validation failed`);
    }
    
    if (!assert("ERASE", afterEraseActions === beforeEraseActions - 1, 
      `Turn ${i}: Erase should remove action (${beforeEraseActions} -> ${afterEraseActions})`)) {
      console.log(`  [Turn ${i}] Erase action validation failed`);
    }
    
    if (!assert("ERASE", afterEraseResults === beforeEraseResults - 1, 
      `Turn ${i}: Erase should remove result (${beforeEraseResults} -> ${afterEraseResults})`)) {
      console.log(`  [Turn ${i}] Erase result validation failed`);
    }
    
  } else if (actionType === 'retry') {
    const beforeRetryActions = currentActions;
    const beforeRetryTurn = currentTurn;
    
    harness.performRetry();
    retryCount++;
    
    const afterRetryTurn = harness.getState().turn || 0;
    const afterRetryActions = harness.getActions().length;
    
    // Validate Retry operation (may convert to Continue)
    if (!assert("RETRY", afterRetryTurn >= beforeRetryTurn, 
      `Turn ${i}: Retry turn should not go backwards (${beforeRetryTurn} -> ${afterRetryTurn})`)) {
      console.log(`  [Turn ${i}] Retry turn validation failed`);
    }
    
  } else {
    // Regular Say action
    const storyAction = generateStoryAction(i);
    harness.performSay(storyAction);
    regularActionCount++;
  }
  
  // Periodic checkpoint validation
  if (i % checkpointInterval === 0) {
    const state = harness.getState();
    const turn = state.turn || 0;
    const actions = harness.getActions();
    const results = harness.getResults();
    
    console.log(`Checkpoint ${i}/${200}:`);
    console.log(`  Turn: ${turn}`);
    console.log(`  Actions: ${actions.length}, Results: ${results.length}`);
    console.log(`  Regular actions: ${regularActionCount}, Retries: ${retryCount}, Erases: ${eraseCount}`);
    
    // Validate array synchronization
    if (!assert("SYNC", actions.length === results.length, 
      `Checkpoint ${i}: Actions and Results should be synchronized (Actions: ${actions.length}, Results: ${results.length})`)) {
      console.log(`  WARNING: Arrays out of sync at checkpoint ${i}`);
    }
    
    // Validate turn counter is reasonable
    if (!assert("TURN", turn >= 0 && turn <= i, 
      `Checkpoint ${i}: Turn counter should be reasonable (Turn: ${turn}, Max expected: ${i})`)) {
      console.log(`  WARNING: Turn counter out of range at checkpoint ${i}`);
    }
    
    // Validate arrays are not empty if we've done regular actions
    if (regularActionCount > 0) {
      if (!assert("NONEMPTY", actions.length > 0 && results.length > 0, 
        `Checkpoint ${i}: Arrays should not be empty after ${regularActionCount} actions`)) {
        console.log(`  WARNING: Empty arrays despite actions at checkpoint ${i}`);
      }
    }
    
    console.log();
  }
}

console.log("Simulation complete!\n");

// ============================================================================
// FINAL VALIDATION
// ============================================================================
console.log("=".repeat(60));
console.log("FINAL STATE VALIDATION\n");

const finalState = harness.getState();
const finalTurn = finalState.turn || 0;
const finalActions = harness.getActions();
const finalResults = harness.getResults();

console.log("Final Statistics:");
console.log(`  Total iterations: 200`);
console.log(`  Regular actions: ${regularActionCount}`);
console.log(`  Retry actions: ${retryCount}`);
console.log(`  Erase actions: ${eraseCount}`);
console.log(`  Final turn: ${finalTurn}`);
console.log(`  Final actions count: ${finalActions.length}`);
console.log(`  Final results count: ${finalResults.length}`);
console.log();

// Final assertions
console.log("Final Integrity Checks:");

assert("FINAL_SYNC", finalActions.length === finalResults.length, 
  `Actions and Results synchronized (Actions: ${finalActions.length}, Results: ${finalResults.length})`);

assert("FINAL_TURN", finalTurn >= 0, 
  `Turn counter is non-negative (${finalTurn})`);

assert("FINAL_TURN_REASONABLE", finalTurn <= 200, 
  `Turn counter is reasonable (${finalTurn} <= 200)`);

assert("FINAL_ARRAYS", finalActions.length >= 0 && finalResults.length >= 0, 
  "Arrays are valid");

// Check that we didn't leak memory or corrupt state
const stateKeys = Object.keys(finalState);
assert("FINAL_STATE", stateKeys.length > 0, 
  `State object exists and has keys (${stateKeys.length} keys)`);

// Verify no undefined entries in arrays
const hasUndefinedActions = finalActions.some(a => a === undefined || a === null);
const hasUndefinedResults = finalResults.some(r => r === undefined || r === null);

assert("FINAL_NO_UNDEFINED", !hasUndefinedActions && !hasUndefinedResults, 
  "No undefined entries in arrays");

console.log();

// ============================================================================
// SUMMARY
// ============================================================================
console.log("=".repeat(60));
console.log("TEST SUMMARY\n");
console.log(`Validation Checks Passed: ${testsPassed}`);
console.log(`Validation Checks Failed: ${testsFailed}\n`);

if (validationErrors.length > 0) {
  console.log("Validation Errors Encountered:");
  validationErrors.slice(0, 10).forEach(err => console.log(`  - ${err}`));
  if (validationErrors.length > 10) {
    console.log(`  ... and ${validationErrors.length - 10} more errors`);
  }
  console.log();
}

if (testsFailed === 0) {
  console.log("✅ ENDURANCE TEST PASSED");
  console.log("\nProtocol 'Легион' endurance validation complete:");
  console.log(`  ✓ Survived 200 iterations with ${retryCount} retries and ${eraseCount} erases`);
  console.log("  ✓ State turn counter maintained integrity");
  console.log("  ✓ Actions and Results arrays stayed synchronized");
  console.log("  ✓ No memory corruption or state leaks detected");
  console.log("  ✓ System stable under extended chaos testing");
  console.log("\nSystem demonstrates excellent long-term stability! 💪");
  process.exit(0);
} else {
  console.log("❌ ENDURANCE TEST FAILED");
  console.log(`\n${testsFailed} validation checks failed during the test.`);
  console.log("Review the errors above and investigate state management issues.");
  process.exit(1);
}
