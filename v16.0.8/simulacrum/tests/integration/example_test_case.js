#!/usr/bin/env node
/**
 * Example: Writing test cases using the test harness
 * 
 * This demonstrates best practices for writing tests:
 * 1. Setup - load scripts and initialize state
 * 2. Execute - perform actions
 * 3. Assert - verify expected behavior
 * 4. Cleanup - reset for next test
 */

const path = require('path');
const harness = require('../../test_harness.js');

console.log("=== Example Test Cases ===\n");

// Helper function to load all scripts
function loadAllScripts() {
  const baseDir = path.join(__dirname, '..', '..');
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
// TEST CASE 1: Turn counter increments correctly
// ============================================================================
console.log("TEST CASE 1: Turn Counter\n");

harness.reset();
loadAllScripts();

const turn0 = harness.getState().turn || 0;
harness.performSay("First action");
const turn1 = harness.getState().turn;
harness.performSay("Second action");
const turn2 = harness.getState().turn;

assert("TC1", turn0 === 0, "Initial turn is 0");
assert("TC1", turn1 === 1, "Turn increments after first action");
assert("TC1", turn2 === 2, "Turn increments after second action");
console.log();

// ============================================================================
// TEST CASE 2: Context contains required tags
// ============================================================================
console.log("TEST CASE 2: Context Generation\n");

harness.reset();
loadAllScripts();

const result = harness.performSay("Максим вошёл в школу.");
const context = result.context;

assert("TC2", context.includes("⟦GUIDE⟧"), "Context includes GUIDE tags");
assert("TC2", context.includes("⟦INTENT⟧"), "Context includes INTENT tag");
assert("TC2", context.includes("⟦WORLD⟧"), "Context includes WORLD tag");
assert("TC2", context.includes("⟦TIME⟧"), "Context includes TIME tag");
console.log();

// ============================================================================
// TEST CASE 3: History management
// ============================================================================
console.log("TEST CASE 3: History Management\n");

harness.reset();
loadAllScripts();

let history = harness.getHistory();
assert("TC3", history.length === 0, "History starts empty");

harness.performSay("Action 1");
history = harness.getHistory();
assert("TC3", history.length === 1, "History has 1 entry after first action");

harness.performSay("Action 2");
history = harness.getHistory();
assert("TC3", history.length === 2, "History has 2 entries after second action");

harness.performErase();
history = harness.getHistory();
assert("TC3", history.length === 1, "History reduced after erase");
console.log();

// ============================================================================
// TEST CASE 4: Command handling
// ============================================================================
console.log("TEST CASE 4: Command Handling\n");

harness.reset();
loadAllScripts();

const helpResult = harness.performSay("/help");
assert("TC4", helpResult.stopped === true, "Help command stops execution");
assert("TC4", helpResult.commandOutput.includes("⟦SYS⟧"), "Help command returns SYS message");

// Commands do add to history (as command type actions)
history = harness.getHistory();
assert("TC4", history.length === 1, "Commands add to history");
console.log();

// ============================================================================
// TEST CASE 5: Retry removes history entry
// ============================================================================
console.log("TEST CASE 5: Retry Behavior\n");

harness.reset();
loadAllScripts();

harness.performSay("Action 1");
harness.performSay("Action 2");
harness.performSay("Action 3");

const histBefore = harness.getHistory().length;
harness.performRetry();
const histAfter = harness.getHistory().length;

assert("TC5", histBefore === 3, "History has 3 entries before retry");
assert("TC5", histAfter === 2, "Retry removes last history entry");
console.log();

// ============================================================================
// TEST CASE 6: Continue doesn't modify history
// ============================================================================
console.log("TEST CASE 6: Continue Behavior\n");

harness.reset();
loadAllScripts();

harness.performSay("Action 1");
const histBeforeContinue = harness.getHistory().length;
harness.performContinue();
const histAfterContinue = harness.getHistory().length;

assert("TC6", histBeforeContinue === 1, "History has 1 entry before continue");
assert("TC6", histAfterContinue === 1, "Continue doesn't modify history");
console.log();

// ============================================================================
// TEST CASE 7: State persistence across turns
// ============================================================================
console.log("TEST CASE 7: State Persistence\n");

harness.reset();
loadAllScripts();

harness.performSay("First turn");
const L1 = harness.getState();
L1.testFlag = "test_value";

harness.performSay("Second turn");
const L2 = harness.getState();

assert("TC7", L2.testFlag === "test_value", "Custom state persists across turns");
assert("TC7", L1 === L2, "State object is the same instance");
console.log();

// ============================================================================
// TEST CASE 8: Memory/World Info setup
// ============================================================================
console.log("TEST CASE 8: Memory and World Info\n");

harness.reset();
loadAllScripts();

harness.setMemory("Test memory text", "Test author note");
harness.addWorldInfo({ keys: "test", entry: "Test entry" });

assert("TC8", global.state.memory.frontMemory === "Test memory text", "Front memory set correctly");
assert("TC8", global.state.memory.authorsNote === "Test author note", "Author's note set correctly");
assert("TC8", global.worldInfo.length === 1, "World info entry added");
console.log();

// ============================================================================
// Summary
// ============================================================================
console.log("=== Test Summary ===");
console.log(`Tests passed: ${testsPassed}`);
console.log(`Tests failed: ${testsFailed}`);
console.log();

if (testsFailed === 0) {
  console.log("✅ ALL TESTS PASSED\n");
  console.log("These examples demonstrate:");
  console.log("  • How to structure test cases");
  console.log("  • How to use assertions");
  console.log("  • How to test different aspects of the system");
  console.log("  • How to reset state between tests");
  process.exit(0);
} else {
  console.log("❌ SOME TESTS FAILED\n");
  process.exit(1);
}
