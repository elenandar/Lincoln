#!/usr/bin/env node
/**
 * Test Case: "Vanishing Opening" Bug Reproduction
 * 
 * This test reproduces the bug where the Opening.txt content disappears
 * when the user presses Continue at the start of the game.
 * 
 * Expected behavior:
 * - The first Continue action should have Opening.txt in the context sent to AI
 * - The context should not be empty
 * - The context should contain key phrases from Opening.txt
 * 
 * Current behavior (BUG):
 * - The context is empty or doesn't contain the Opening
 * - This test is EXPECTED TO FAIL until the bug is fixed
 */

const path = require('path');
const fs = require('fs');
const harness = require('../../test_harness.js');

console.log("=== Test: Vanishing Opening Bug Reproduction ===\n");

// Load Opening.txt content
const openingPath = path.join(__dirname, '..', '..', '..', 'Opening.txt');
const openingText = fs.readFileSync(openingPath, 'utf8').trim();

console.log("Opening.txt content loaded:");
console.log(`  Length: ${openingText.length} characters`);
console.log(`  First line: "${openingText.split(/\r?\n/)[0].slice(0, 50)}..."\n`);

// Reset and load all scripts
console.log("Loading game scripts...");
harness.reset();

const baseDir = path.join(__dirname, '..', '..', '..');
harness.loadScript(path.join(baseDir, 'Library v16.0.8.patched.txt'));
harness.loadScript(path.join(baseDir, 'Input v16.0.8.patched.txt'));
harness.loadScript(path.join(baseDir, 'Context v16.0.8.patched.txt'));
harness.loadScript(path.join(baseDir, 'Output v16.0.8.patched.txt'));

console.log("  ✓ All scripts loaded\n");

// Set up the scenario: Opening.txt in story at game start
console.log("Setting up test scenario...");
console.log("  Adding Opening.txt to story.results as first entry");

// Add Opening.txt as the first result entry
// This simulates the scenario where Opening.txt is the story start
if (!global.state.story) {
  global.state.story = { actions: [], results: [] };
}
global.state.story.results.push(openingText);

console.log(`  ✓ Results length: ${global.state.story.results.length}`);
console.log(`  ✓ First result text length: ${global.state.story.results[0].length}\n`);

// Simulate first Continue action at game start
console.log("Simulating first Continue action...");
const result = harness.performContinue();

console.log("  ✓ Continue action completed\n");

// Extract the context that would be sent to AI
const context = result.context;

console.log("Context analysis:");
console.log(`  Context length: ${context.length} characters`);
console.log(`  Context is empty: ${context.length === 0 ? 'YES (BUG!)' : 'NO (GOOD)'}`);
console.log();

// Test assertions
let testPassed = true;

console.log("=== Test Assertions ===\n");

// Assertion 1: Context should not be empty
console.log("ASSERTION 1: Context is not empty");
if (context && context.length > 0) {
  console.log("  ✓ PASSED: Context has content (" + context.length + " chars)");
} else {
  console.log("  ✗ FAILED: Context is empty!");
  testPassed = false;
}
console.log();

// Assertion 2: Context should contain key phrase from Opening.txt
const keyPhrase = "Шум у ворот";
console.log(`ASSERTION 2: Context contains key phrase "${keyPhrase}"`);
if (context.includes(keyPhrase)) {
  console.log("  ✓ PASSED: Key phrase found in context");
} else {
  console.log("  ✗ FAILED: Key phrase NOT found in context!");
  testPassed = false;
}
console.log();

// Additional diagnostic info
console.log("=== Diagnostic Information ===\n");
console.log("Full context sent to AI:");
console.log("---");
console.log(context || "(empty)");
console.log("---");
console.log();

console.log("Lincoln state:");
const L = harness.getState();
console.log(`  Turn: ${L.turn || 0}`);
console.log(`  Opening captured: ${L.openingCaptured || false}`);
console.log(`  Opening text: "${L.opening || '(none)'}"`);
console.log(`  Opening turn: ${L.openingTurn !== undefined ? L.openingTurn : '(undefined)'}`);
console.log(`  Opening turn (direct): ${global.state.lincoln.openingTurn !== undefined ? global.state.lincoln.openingTurn : '(undefined)'}`);
console.log();

// Final result
console.log("=== Test Result ===\n");
if (testPassed) {
  console.log("✅ TEST PASSED (Bug is fixed!)");
  console.log();
  console.log("This means the Opening content is properly included in the context");
  console.log("when the user presses Continue at game start.");
  process.exit(0);
} else {
  console.log("❌ TEST FAILED (Bug confirmed)");
  console.log();
  console.log("This is EXPECTED behavior - the bug exists and needs to be fixed.");
  console.log("The Opening.txt content should be included in the context sent to AI");
  console.log("when the user presses Continue at the start of the game.");
  console.log();
  console.log("Next step: Fix the bug so this test passes.");
  process.exit(1);
}
