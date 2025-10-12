#!/usr/bin/env node
/**
 * State Integrity Test: Turn Counter
 * 
 * Tests that the turn counter (state.turn) correctly updates and maintains
 * integrity across different game actions (Say, Retry, Continue, Erase).
 * 
 * Part of "Протокол 'Цербер', Часть 3 — Проверка Памяти"
 */

const path = require('path');
const harness = require('../../test_harness.js');

console.log("=== State Integrity Test: Turn Counter ===\n");

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
// TURN COUNTER INTEGRITY TEST
// ============================================================================
console.log("Turn Counter Integrity Test\n");
console.log("This test verifies that state.turn correctly updates during");
console.log("different game actions and maintains data integrity.\n");
console.log("Note: The Input script detects empty input (used by Retry) as Continue.");
console.log("This is expected system behavior - see CHAOS TEST 1 for details.\n");

// Reset and initialize
harness.reset();
loadAllScripts();

// Step 1: Check initial state
console.log("Step 1: Verifying initial state...");
const turn0 = harness.getState().turn || 0;
assert("TURN_INTEGRITY", turn0 === 0, `Initial state.turn is 0 (actual: ${turn0})`);
console.log();

// Step 2: Perform first action (Say)
console.log("Step 2: Performing first action (Say)...");
harness.performSay("Максим вошёл в школу.");
const turn1 = harness.getState().turn;
assert("TURN_INTEGRITY", turn1 === 1, `After performSay, state.turn is 1 (actual: ${turn1})`);
console.log();

// Step 3: Perform Retry (which becomes Continue due to empty input)
console.log("Step 3: Performing Retry action...");
console.log("Note: Retry with empty input is detected as Continue by detectInputType");
harness.performRetry();
const turn2 = harness.getState().turn;
const action2 = harness.getState().currentAction?.type;
assert("TURN_INTEGRITY", action2 === "continue", `Action type is 'continue' (actual: ${action2})`);
assert("TURN_INTEGRITY", turn2 === 2, `After performRetry (→Continue), state.turn is 2 (actual: ${turn2})`);
console.log();

// Step 4: Perform Continue
console.log("Step 4: Performing Continue action...");
console.log("Note: Continue is treated as a real turn and increments the counter");
harness.performContinue();
const turn3 = harness.getState().turn;
assert("TURN_INTEGRITY", turn3 === 3, `After performContinue, state.turn is 3 (actual: ${turn3})`);
console.log();

// Step 5: Perform second Say action
console.log("Step 5: Performing second action (Say)...");
harness.performSay("Он прошёл по коридору.");
const turn4 = harness.getState().turn;
assert("TURN_INTEGRITY", turn4 === 4, `After second performSay, state.turn is 4 (actual: ${turn4})`);
console.log();

// Step 6: Perform Erase
console.log("Step 6: Performing Erase action...");
const eraseSuccess = harness.performErase();
const turn5 = harness.getState().turn;
assert("TURN_INTEGRITY", eraseSuccess === true, "Erase action was successful");
assert("TURN_INTEGRITY", turn5 === 3, `After performErase, state.turn rolled back to 3 (actual: ${turn5})`);
console.log();

// ============================================================================
// Summary
// ============================================================================
console.log("=== Test Summary ===");
console.log(`Tests passed: ${testsPassed}`);
console.log(`Tests failed: ${testsFailed}`);
console.log();

if (testsFailed === 0) {
  console.log("✅ ALL TESTS PASSED - Turn counter integrity verified!\n");
  console.log("The state.turn counter correctly:");
  console.log("  • Starts at 0");
  console.log("  • Increments on Say actions");
  console.log("  • Retry converts to Continue (empty input detection)");
  console.log("  • Increments on Continue actions");
  console.log("  • Decrements on Erase actions");
  console.log("\nNote: The Retry→Continue conversion is intentional system behavior.");
  console.log("Empty input from Retry is detected as Continue by detectInputType().");
  console.log("See simulacrum/tests/chaos_tests/test_chaos_scenarios.js for details.");
  process.exit(0);
} else {
  console.log("❌ SOME TESTS FAILED - State integrity issues detected!\n");
  process.exit(1);
}
