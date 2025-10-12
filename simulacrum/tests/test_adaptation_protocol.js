#!/usr/bin/env node
/**
 * Adaptation Protocol Part 1 - Test
 * 
 * This test validates that the test harness correctly implements
 * the original AI Dungeon Story class structure with separate
 * actions and results arrays, matching play.py behavior.
 * 
 * Validates:
 * 1. state.story.actions[] for player inputs
 * 2. state.story.results[] for AI responses
 * 3. No global.history
 * 4. performErase() removes from both arrays (mimics /revert)
 */

const path = require('path');
const harness = require('../test_harness.js');

console.log("=== Adaptation Protocol Part 1 - Validation ===\n");

let allTestsPassed = true;

// Load scripts
const libraryPath = path.join(__dirname, '..', '..', 'Library v16.0.8.patched.txt');
const inputPath = path.join(__dirname, '..', '..', 'Input v16.0.8.patched.txt');
const contextPath = path.join(__dirname, '..', '..', 'Context v16.0.8.patched.txt');
const outputPath = path.join(__dirname, '..', '..', 'Output v16.0.8.patched.txt');

harness.loadScript(libraryPath);
harness.loadScript(inputPath);
harness.loadScript(contextPath);
harness.loadScript(outputPath);

// Test 1: Verify state.story structure
console.log("Test 1: state.story Structure");
console.log("  ✓ state.story exists:", typeof global.state?.story === 'object');
console.log("  ✓ state.story.actions is array:", Array.isArray(global.state?.story?.actions));
console.log("  ✓ state.story.results is array:", Array.isArray(global.state?.story?.results));
console.log("  ✓ global.history removed:", typeof global.history === 'undefined');

if (typeof global.state?.story === 'object' &&
    Array.isArray(global.state?.story?.actions) &&
    Array.isArray(global.state?.story?.results) &&
    typeof global.history === 'undefined') {
  console.log("  ✅ PASSED: Correct structure\n");
} else {
  console.log("  ❌ FAILED: Structure mismatch\n");
  allTestsPassed = false;
}

// Test 2: Verify _executeInput adds to actions
console.log("Test 2: Input adds to state.story.actions");
const actionsBefore = global.state.story.actions.length;
harness.performSay("Максим вошёл в класс.");
const actionsAfter = global.state.story.actions.length;
const addedToActions = actionsAfter > actionsBefore;
console.log("  ✓ Actions array length increased:", addedToActions);

if (addedToActions) {
  console.log("  ✅ PASSED: Input adds to actions\n");
} else {
  console.log("  ❌ FAILED: Input didn't add to actions\n");
  allTestsPassed = false;
}

// Test 3: Verify _executeOutput adds to results
console.log("Test 3: Output adds to state.story.results");
const resultsBefore = global.state.story.results.length;
const aiResponse = "Хлоя улыбнулась ему.";
harness.executeTurn("Максим улыбнулся.", aiResponse);
const resultsAfter = global.state.story.results.length;
const addedToResults = resultsAfter > resultsBefore;
console.log("  ✓ Results array length increased:", addedToResults);

if (addedToResults) {
  console.log("  ✅ PASSED: Output adds to results\n");
} else {
  console.log("  ❌ FAILED: Output didn't add to results\n");
  allTestsPassed = false;
}

// Test 4: Verify performErase removes from both arrays
console.log("Test 4: performErase() mimics /revert");
// First, add some entries
harness.reset();
harness.loadScript(libraryPath);
harness.loadScript(inputPath);
harness.loadScript(contextPath);
harness.loadScript(outputPath);

harness.executeTurn("Action 1", "Result 1");
harness.executeTurn("Action 2", "Result 2");

const actionsBeforeErase = global.state.story.actions.length;
const resultsBeforeErase = global.state.story.results.length;

console.log("  Before erase - actions:", actionsBeforeErase, "results:", resultsBeforeErase);

const erased = harness.performErase();

const actionsAfterErase = global.state.story.actions.length;
const resultsAfterErase = global.state.story.results.length;

console.log("  After erase - actions:", actionsAfterErase, "results:", resultsAfterErase);
console.log("  ✓ Erase returned true:", erased);
console.log("  ✓ Action removed:", actionsAfterErase === actionsBeforeErase - 1);
console.log("  ✓ Result removed:", resultsAfterErase === resultsBeforeErase - 1);

if (erased && 
    actionsAfterErase === actionsBeforeErase - 1 && 
    resultsAfterErase === resultsBeforeErase - 1) {
  console.log("  ✅ PASSED: performErase removes from both arrays\n");
} else {
  console.log("  ❌ FAILED: performErase didn't work correctly\n");
  allTestsPassed = false;
}

// Test 5: Verify performErase doesn't call Continue or executeTurn
console.log("Test 5: performErase() is state-only operation");
harness.reset();
harness.loadScript(libraryPath);

// Add a turn counter
if (!global.state.lincoln) global.state.lincoln = {};
global.state.lincoln.turn = 5;

// Add some actions/results manually
global.state.story.actions.push("Test action");
global.state.story.results.push("Test result");

const turnBefore = global.state.lincoln.turn;
harness.performErase();
const turnAfter = global.state.lincoln.turn;

console.log("  ✓ Turn decremented (not executed):", turnAfter === turnBefore - 1);

if (turnAfter === turnBefore - 1) {
  console.log("  ✅ PASSED: performErase only modifies state\n");
} else {
  console.log("  ❌ FAILED: performErase behavior unexpected\n");
  allTestsPassed = false;
}

// Test 6: Verify arrays stay synchronized
console.log("Test 6: Actions and Results Arrays Synchronization");
harness.reset();
harness.loadScript(libraryPath);
harness.loadScript(inputPath);
harness.loadScript(contextPath);
harness.loadScript(outputPath);

// Execute several turns
for (let i = 0; i < 3; i++) {
  harness.executeTurn(`Action ${i+1}`, `Result ${i+1}`);
}

const finalActions = global.state.story.actions.length;
const finalResults = global.state.story.results.length;

console.log("  Final actions count:", finalActions);
console.log("  Final results count:", finalResults);
console.log("  ✓ Arrays have same length:", finalActions === finalResults);

if (finalActions === finalResults && finalActions === 3) {
  console.log("  ✅ PASSED: Arrays stay synchronized\n");
} else {
  console.log("  ❌ FAILED: Arrays not synchronized\n");
  allTestsPassed = false;
}

// Test 7: Verify getHistory() backward compatibility
console.log("Test 7: getHistory() Backward Compatibility");
const history = harness.getHistory();
const historyIsArray = Array.isArray(history);
const historyHasEntries = history.length > 0;
console.log("  ✓ getHistory() returns array:", historyIsArray);
console.log("  ✓ History has entries:", historyHasEntries);
console.log("  ✓ History length (interleaved):", history.length);

if (historyIsArray && historyHasEntries) {
  console.log("  ✅ PASSED: getHistory() provides backward compatibility\n");
} else {
  console.log("  ❌ FAILED: getHistory() not working\n");
  allTestsPassed = false;
}

// Test 8: Verify direct access methods
console.log("Test 8: Direct Access Methods");
const actions = harness.getActions();
const results = harness.getResults();
console.log("  ✓ getActions() returns array:", Array.isArray(actions));
console.log("  ✓ getResults() returns array:", Array.isArray(results));
console.log("  ✓ getActions() count:", actions.length);
console.log("  ✓ getResults() count:", results.length);

if (Array.isArray(actions) && Array.isArray(results) && 
    actions.length === 3 && results.length === 3) {
  console.log("  ✅ PASSED: Direct access methods work\n");
} else {
  console.log("  ❌ FAILED: Direct access methods failed\n");
  allTestsPassed = false;
}

// Final summary
console.log("=== Test Summary ===");
if (allTestsPassed) {
  console.log("✅ ALL TESTS PASSED");
  console.log("\nAdaptation Protocol Part 1: COMPLETE ✓");
  console.log("Test harness now matches original AI Dungeon Story class structure");
  console.log("- state.story.actions[] ✓");
  console.log("- state.story.results[] ✓");
  console.log("- performErase() mimics /revert ✓");
  process.exit(0);
} else {
  console.log("❌ SOME TESTS FAILED");
  console.log("\nPlease review the failures above.");
  process.exit(1);
}
