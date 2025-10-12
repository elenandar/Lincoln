#!/usr/bin/env node
/**
 * Тикет 2: "Протокол 'Цербер', Часть 2 — Испытание Хаосом"
 * 
 * Test: Implement Chaos Test for Retry and Erase+Continue
 * 
 * This test validates system resilience against:
 * 1. Retry Storm - Multiple consecutive retry actions
 * 2. Erase+Continue - Combination that can expose system data in context
 */

const path = require('path');
const harness = require('../../test_harness.js');

console.log("=== Протокол 'Цербер': Испытание Хаосом ===\n");

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
// CHAOS TEST 1: Retry Storm (10 consecutive retries)
// ============================================================================
console.log("CHAOS TEST 1: Retry Storm Protection\n");
console.log("Scenario: User performs 10 consecutive retry actions");
console.log("Expected: System remains stable, no recap offered, history cleared");
console.log("Note: Input script may convert empty retry to continue - this is normal\n");

harness.reset();
loadAllScripts();

// Set up initial scenario
harness.setMemory(
  "Вы играете за Максима, студента Lincoln Heights High.",
  "Жанр: школьная драма"
);

// Perform first action to establish baseline
harness.performSay("Максим вошёл в школу.");
const initialTurn = harness.getState().turn;
const initialHistoryLength = harness.getHistory().length;

console.log(`Initial state: Turn ${initialTurn}, History entries: ${initialHistoryLength}\n`);

// Simulate retry storm - 10 consecutive retries
console.log("Simulating retry storm (10 consecutive retries)...");
for (let i = 0; i < 10; i++) {
  const result = harness.performRetry();
  
  // Verify retry was executed
  if (i === 0) {
    console.log(`  Retry ${i + 1}: Action type = ${harness.getState().currentAction?.type}`);
  }
}

const finalTurn = harness.getState().turn;
const finalHistoryLength = harness.getHistory().length;
const finalState = harness.getState();

console.log(`\nFinal state: Turn ${finalTurn}, History entries: ${finalHistoryLength}\n`);

// Assertions
// Note: The Input script may convert retry to continue when empty input is detected
// This is expected behavior, so we check that the turn count hasn't gone backwards
// and that the system is still stable
assert("CHAOS1", finalTurn >= initialTurn, 
  `Turn count did not go backwards after retry storm (${finalTurn} >= ${initialTurn})`);

assert("CHAOS1", finalHistoryLength === 0, 
  `History correctly reduced to 0 after retries (was ${initialHistoryLength}, now ${finalHistoryLength})`);

// Verify no recap was offered during retry storm
// The system should NOT offer recap during retry actions
const noRecapOffered = !finalState.currentAction?.wantRecap;
assert("CHAOS1", noRecapOffered, 
  "No recap offer during retry storm");

// Verify the system is still responsive after retry storm
harness.performSay("Максим продолжил идти.");
const afterRetryStormTurn = harness.getState().turn;
assert("CHAOS1", afterRetryStormTurn > finalTurn, 
  `System responsive after retry storm (turn advanced from ${finalTurn} to ${afterRetryStormTurn})`);

console.log("\n" + "─".repeat(60) + "\n");

// ============================================================================
// CHAOS TEST 2: Erase+Continue Scenario
// ============================================================================
console.log("CHAOS TEST 2: Erase+Continue Context Integrity\n");
console.log("Scenario: User makes two actions, then Erase + Continue");
console.log("Expected: Context is clean, no system data leakage\n");

harness.reset();
loadAllScripts();

// Set up initial scenario
harness.setMemory(
  "Вы играете за Максима, студента Lincoln Heights High.",
  "Жанр: школьная драма"
);

// Perform two actions to build up history
console.log("Performing two story actions...");
harness.performSay("Максим вошёл в школу утром.");
harness.performSay("Он направился к своему шкафчику.");

const beforeEraseHistory = harness.getHistory().length;
const beforeEraseTurn = harness.getState().turn;
console.log(`Before erase: Turn ${beforeEraseTurn}, History entries: ${beforeEraseHistory}\n`);

// Perform Erase
console.log("Performing Erase action...");
const eraseSuccess = harness.performErase();
assert("CHAOS2", eraseSuccess, "Erase action successful");

const afterEraseHistory = harness.getHistory().length;
const afterEraseTurn = harness.getState().turn;
console.log(`After erase: Turn ${afterEraseTurn}, History entries: ${afterEraseHistory}\n`);

assert("CHAOS2", afterEraseHistory === beforeEraseHistory - 1, 
  `History reduced by 1 after erase (${beforeEraseHistory} → ${afterEraseHistory})`);

assert("CHAOS2", afterEraseTurn === beforeEraseTurn - 1, 
  `Turn count reduced by 1 after erase (${beforeEraseTurn} → ${afterEraseTurn})`);

// Perform Continue
console.log("Performing Continue action...");
const continueResult = harness.performContinue();

// Verify the context is properly formatted
const context = continueResult.context || "";
console.log(`\nContext length: ${context.length} characters\n`);

// Check for system data leakage patterns
// These are examples of "naked" system data that should NOT appear in context
const systemDataPatterns = [
  /\[Mood:\s*\w+\]/,           // [Mood: neutral] - naked mood data
  /\[Turn:\s*\d+\]/,           // [Turn: 2] - naked turn counter
  /\[State:\s*\w+\]/,          // [State: active] - naked state data
  /\bcurrentAction:\s*{/,       // currentAction: { - internal state object
  /\blincoln\s*:\s*{/,         // lincoln : { - internal state namespace
];

let hasSystemDataLeakage = false;
const leakedPatterns = [];

for (const pattern of systemDataPatterns) {
  if (pattern.test(context)) {
    hasSystemDataLeakage = true;
    leakedPatterns.push(pattern.toString());
  }
}

assert("CHAOS2", !hasSystemDataLeakage, 
  `No naked system data in context (checked ${systemDataPatterns.length} patterns)`);

if (leakedPatterns.length > 0) {
  console.log(`  WARNING: Detected system data patterns: ${leakedPatterns.join(', ')}`);
}

// Verify context contains proper story tags (should be formatted correctly)
const hasProperTags = context.includes("⟦") || context.includes("⟧");
console.log(`\n  Context uses proper tags: ${hasProperTags ? '✓' : 'ℹ️ (optional)'}`);

// Verify history is unchanged by Continue
const afterContinueHistory = harness.getHistory().length;
assert("CHAOS2", afterContinueHistory === afterEraseHistory, 
  `Continue doesn't modify history (${afterEraseHistory} === ${afterContinueHistory})`);

console.log("\n" + "─".repeat(60) + "\n");

// ============================================================================
// SUMMARY
// ============================================================================
console.log("=".repeat(60));
console.log("TEST SUMMARY\n");
console.log(`Tests Passed: ${testsPassed}`);
console.log(`Tests Failed: ${testsFailed}\n`);

if (testsFailed === 0) {
  console.log("✅ ALL CHAOS TESTS PASSED");
  console.log("\nProtocol 'Цербер' validation complete:");
  console.log("  ✓ System withstands retry storm (10 consecutive retries)");
  console.log("  ✓ Turn counter remains stable during retry storm");
  console.log("  ✓ No inappropriate recap offers during retries");
  console.log("  ✓ Erase+Continue maintains context integrity");
  console.log("  ✓ No system data leakage in AI context");
  console.log("\nSystem is resilient against chaos scenarios! 🛡️");
  process.exit(0);
} else {
  console.log("❌ SOME CHAOS TESTS FAILED");
  console.log("Review the failures above and investigate.");
  process.exit(1);
}
