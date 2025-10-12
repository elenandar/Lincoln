#!/usr/bin/env node
/**
 * Adaptation Protocol Part 3 - Original Mechanics Tests
 * 
 * This test file validates new discoveries about AI Dungeon architecture
 * and turns our hypotheses into concrete guarantees.
 * 
 * Tests:
 * 1. "Exact Revert" - Validates precise undo behavior (performErase)
 * 2. "Anti-Cycle" - Placeholder test for future loop detection (stub)
 */

const path = require('path');
const harness = require('../../test_harness.js');

console.log("=== Adaptation Protocol Part 3 - Original Mechanics Tests ===\n");

let allTestsPassed = true;

// Load scripts
const libraryPath = path.join(__dirname, '..', '..', '..', 'Library v16.0.8.patched.txt');
const inputPath = path.join(__dirname, '..', '..', '..', 'Input v16.0.8.patched.txt');
const contextPath = path.join(__dirname, '..', '..', '..', 'Context v16.0.8.patched.txt');
const outputPath = path.join(__dirname, '..', '..', '..', 'Output v16.0.8.patched.txt');

// ============================================================================
// TEST 1: "Exact Revert" - Validates precise undo behavior
// ============================================================================
console.log("Test 1: Exact Revert - Precise Undo Behavior");
console.log("Scenario: Make action A, make action B, performErase, verify only A remains\n");

// Reset and load scripts
harness.reset();
harness.loadScript(libraryPath);
harness.loadScript(inputPath);
harness.loadScript(contextPath);
harness.loadScript(outputPath);

// Set up initial memory
harness.setMemory("You are playing as Максим, a student at Lincoln Heights High.");

// Step 1: Make action A and get result A
console.log("  Step 1: Making action A...");
const turnA = harness.executeTurn("Action A", "Result A");
const actionsAfterA = harness.getActions().length;
const resultsAfterA = harness.getResults().length;
console.log(`    Actions after A: ${actionsAfterA}, Results after A: ${resultsAfterA}`);
console.log(`    ✓ Action A stored: "${harness.getActions()[0]}"`);
console.log(`    ✓ Result A stored: "${harness.getResults()[0]}"`);

// Step 2: Make action B and get result B
console.log("\n  Step 2: Making action B...");
const turnB = harness.executeTurn("Action B", "Result B");
const actionsAfterB = harness.getActions().length;
const resultsAfterB = harness.getResults().length;
console.log(`    Actions after B: ${actionsAfterB}, Results after B: ${resultsAfterB}`);
console.log(`    ✓ Action B stored: "${harness.getActions()[1]}"`);
console.log(`    ✓ Result B stored: "${harness.getResults()[1]}"`);

// Step 3: Call performErase
console.log("\n  Step 3: Calling performErase()...");
const erased = harness.performErase();
const actionsAfterErase = harness.getActions().length;
const resultsAfterErase = harness.getResults().length;
console.log(`    Erase returned: ${erased}`);
console.log(`    Actions after erase: ${actionsAfterErase}, Results after erase: ${resultsAfterErase}`);

// Step 4: Verify only action A and result A remain
console.log("\n  Step 4: Verifying state...");
const actionsMatch = actionsAfterErase === 1 && harness.getActions()[0] === "Action A";
const resultsMatch = resultsAfterErase === 1;
// Note: Result A might contain opening text, so we just verify it's the first result
const resultAContainsExpected = harness.getResults()[0].includes("Result A");

console.log(`    ✓ Only 1 action remains: ${actionsAfterErase === 1}`);
console.log(`    ✓ Action is "Action A": ${actionsMatch}`);
console.log(`    ✓ Only 1 result remains: ${resultsAfterErase === 1}`);
console.log(`    ✓ Result contains "Result A": ${resultAContainsExpected}`);

if (erased && actionsMatch && resultsMatch && resultAContainsExpected) {
  console.log("\n  ✅ PASSED: Exact Revert works correctly\n");
} else {
  console.log("\n  ❌ FAILED: Exact Revert did not work as expected\n");
  allTestsPassed = false;
}

// ============================================================================
// TEST 2: "Anti-Cycle" - Placeholder test for loop detection
// ============================================================================
console.log("Test 2: Anti-Cycle - Loop Detection (Stub Test)");
console.log("Scenario: Make action A, set next AI response to Result A, make action B");
console.log("Expected: Future implementation should detect loop and set wasLooped flag\n");

// Reset and load scripts
harness.reset();
harness.loadScript(libraryPath);
harness.loadScript(inputPath);
harness.loadScript(contextPath);
harness.loadScript(outputPath);

// Set up initial memory
harness.setMemory("You are playing as Максим, a student at Lincoln Heights High.");

// Step 1: Make action A and get result A
console.log("  Step 1: Making action A...");
const actionATurn = harness.executeTurn("Action A for loop test", "Result A for loop test");
const resultA = harness.getLastAIResponse();
console.log(`    ✓ Action A made, Result A: "${resultA}"`);

// Step 2: Set next AI response to be same as result A (simulating a loop)
console.log("\n  Step 2: Setting next AI response to Result A (simulating loop)...");
harness.setNextAIResponse(resultA);
console.log(`    ✓ Next AI response set to: "${resultA}"`);

// Step 3: Make action B - in future, this should detect the loop
console.log("\n  Step 3: Making action B...");
const actionBTurn = harness.executeTurn("Action B for loop test", resultA);
console.log(`    ✓ Action B executed`);

// Step 4: Check for wasLooped flag (this will fail for now - it's a placeholder)
console.log("\n  Step 4: Checking for loop detection (EXPECTED TO FAIL)...");
const hasLoopFlag = actionBTurn.wasLooped === true;
console.log(`    ✓ wasLooped flag present: ${hasLoopFlag}`);
console.log(`    ✓ wasLooped value: ${actionBTurn.wasLooped}`);

if (hasLoopFlag) {
  console.log("\n  ✅ PASSED: Loop detection is implemented\n");
} else {
  console.log("\n  ⚠️  EXPECTED FAILURE: Loop detection not yet implemented");
  console.log("     This is a placeholder test for future anti-cycle mechanism\n");
  // Note: We don't mark allTestsPassed = false because this is an expected failure
}

// ============================================================================
// Final Summary
// ============================================================================
console.log("=== Test Summary ===");
if (allTestsPassed) {
  console.log("✅ ALL CORE TESTS PASSED");
  console.log("\nAdaptation Protocol Part 3: Core Mechanics Validated ✓");
  console.log("- Exact Revert (performErase) ✓");
  console.log("- Anti-Cycle stub created (awaiting implementation)");
  process.exit(0);
} else {
  console.log("❌ SOME TESTS FAILED");
  console.log("\nPlease review the failures above.");
  process.exit(1);
}
