#!/usr/bin/env node
/**
 * Basic validation test for test_harness.js
 * 
 * This test validates that the test harness correctly:
 * 1. Initializes mock state, history, worldInfo
 * 2. Loads game scripts
 * 3. Executes a complete turn simulation
 * 4. Implements user action wrappers
 * 5. Resets state properly
 */

const path = require('path');
const harness = require('../../test_harness.js');

console.log("=== Project Simulacrum - Test Harness Validation ===\n");

let allTestsPassed = true;

// Test 1: Initial state
console.log("TEST 1: Initial State Verification");
console.log("  Checking global.state exists:", typeof global.state === 'object' ? '✓' : '✗');
console.log("  Checking global.state.story.actions exists:", Array.isArray(global.state?.story?.actions) ? '✓' : '✗');
console.log("  Checking global.state.story.results exists:", Array.isArray(global.state?.story?.results) ? '✓' : '✗');
console.log("  Checking global.worldInfo exists:", Array.isArray(global.worldInfo) ? '✓' : '✗');
console.log("  Checking global.info exists:", typeof global.info === 'object' ? '✓' : '✗');

if (typeof global.state === 'object' && 
    Array.isArray(global.state?.story?.actions) &&
    Array.isArray(global.state?.story?.results) &&
    Array.isArray(global.worldInfo) && typeof global.info === 'object') {
  console.log("  ✅ PASSED: All global objects initialized\n");
} else {
  console.log("  ❌ FAILED: Missing global objects\n");
  allTestsPassed = false;
}

// Test 2: Load Library script
console.log("TEST 2: Script Loading");
const libraryPath = path.join(__dirname, '..', '..', 'Library v16.0.8.patched.txt');
const loaded = harness.loadScript(libraryPath);
console.log("  Library loaded:", loaded ? '✓' : '✗');

if (loaded && typeof global.LC !== 'undefined') {
  console.log("  LC global exists:", '✓');
  console.log("  LC.lcInit is function:", typeof global.LC.lcInit === 'function' ? '✓' : '✗');
  console.log("  ✅ PASSED: Script loading works\n");
} else {
  console.log("  ❌ FAILED: Script loading failed\n");
  allTestsPassed = false;
}

// Test 3: Load Input script
console.log("TEST 3: Input Script Loading");
const inputPath = path.join(__dirname, '..', '..', 'Input v16.0.8.patched.txt');
const inputLoaded = harness.loadScript(inputPath);
console.log("  Input loaded:", inputLoaded ? '✓' : '✗');

if (inputLoaded) {
  console.log("  ✅ PASSED: Input script loaded\n");
} else {
  console.log("  ❌ FAILED: Input script loading failed\n");
  allTestsPassed = false;
}

// Test 4: Load Context script
console.log("TEST 4: Context Script Loading");
const contextPath = path.join(__dirname, '..', '..', 'Context v16.0.8.patched.txt');
const contextLoaded = harness.loadScript(contextPath);
console.log("  Context loaded:", contextLoaded ? '✓' : '✗');

if (contextLoaded) {
  console.log("  ✅ PASSED: Context script loaded\n");
} else {
  console.log("  ❌ FAILED: Context script loading failed\n");
  allTestsPassed = false;
}

// Test 5: Load Output script
console.log("TEST 5: Output Script Loading");
const outputPath = path.join(__dirname, '..', '..', 'Output v16.0.8.patched.txt');
const outputLoaded = harness.loadScript(outputPath);
console.log("  Output loaded:", outputLoaded ? '✓' : '✗');

if (outputLoaded) {
  console.log("  ✅ PASSED: Output script loaded\n");
} else {
  console.log("  ❌ FAILED: Output script loading failed\n");
  allTestsPassed = false;
}

// Test 6: State access methods
console.log("TEST 6: State Access Methods");
const state = harness.getState();
const history = harness.getHistory();
const worldInfo = harness.getWorldInfo();
console.log("  getState() returns object:", typeof state === 'object' ? '✓' : '✗');
console.log("  getHistory() returns array:", Array.isArray(history) ? '✓' : '✗');
console.log("  getWorldInfo() returns array:", Array.isArray(worldInfo) ? '✓' : '✗');

if (typeof state === 'object' && Array.isArray(history) && Array.isArray(worldInfo)) {
  console.log("  ✅ PASSED: State access methods work\n");
} else {
  console.log("  ❌ FAILED: State access methods failed\n");
  allTestsPassed = false;
}

// Test 7: Memory setting
console.log("TEST 7: Memory Setting");
harness.setMemory("Test opening scenario", "Test author note");
const hasMemory = global.state.memory.frontMemory === "Test opening scenario";
const hasNote = global.state.memory.authorsNote === "Test author note";
console.log("  Front memory set:", hasMemory ? '✓' : '✗');
console.log("  Author's note set:", hasNote ? '✓' : '✗');

if (hasMemory && hasNote) {
  console.log("  ✅ PASSED: Memory setting works\n");
} else {
  console.log("  ❌ FAILED: Memory setting failed\n");
  allTestsPassed = false;
}

// Test 8: World info
console.log("TEST 8: World Info Management");
harness.addWorldInfo({ keys: "test", entry: "Test world info entry" });
const hasWorldInfo = global.worldInfo.length > 0;
console.log("  World info added:", hasWorldInfo ? '✓' : '✗');

if (hasWorldInfo) {
  console.log("  ✅ PASSED: World info management works\n");
} else {
  console.log("  ❌ FAILED: World info management failed\n");
  allTestsPassed = false;
}

// Test 9: Execute a simple turn (if all scripts loaded)
console.log("TEST 9: Turn Execution");
if (loaded && inputLoaded && contextLoaded && outputLoaded) {
  try {
    const result = harness.performSay("Привет!");
    console.log("  Turn executed without error:", '✓');
    console.log("  Result has 'context' field:", 'context' in result ? '✓' : '✗');
    console.log("  Result has 'output' field:", 'output' in result ? '✓' : '✗');
    const actionsUpdated = (global.state?.story?.actions?.length || 0) > 0;
    const resultsUpdated = (global.state?.story?.results?.length || 0) > 0;
    console.log("  Actions updated:", actionsUpdated ? '✓' : '✗');
    console.log("  Results updated:", resultsUpdated ? '✓' : '✗');
    
    if ('context' in result && 'output' in result && actionsUpdated && resultsUpdated) {
      console.log("  ✅ PASSED: Turn execution works\n");
    } else {
      console.log("  ❌ FAILED: Turn execution incomplete\n");
      allTestsPassed = false;
    }
  } catch (e) {
    console.log("  ❌ FAILED: Turn execution error:", e.message, "\n");
    allTestsPassed = false;
  }
} else {
  console.log("  ⊘ SKIPPED: Not all scripts loaded\n");
}

// Test 10: Reset functionality
console.log("TEST 10: Reset Functionality");
const actionsBefore = global.state?.story?.actions?.length || 0;
const resultsBefore = global.state?.story?.results?.length || 0;
harness.reset();
const actionsAfter = global.state?.story?.actions?.length || 0;
const resultsAfter = global.state?.story?.results?.length || 0;
// After reset, state should only have _versionCheckDone flag
const stateReset = !global.state.lincoln || Object.keys(global.state.lincoln).length <= 1;
console.log("  Actions cleared:", actionsAfter === 0 ? '✓' : '✗');
console.log("  Results cleared:", resultsAfter === 0 ? '✓' : '✗');
console.log("  State reset:", stateReset ? '✓' : '✗');

if (actionsAfter === 0 && resultsAfter === 0 && stateReset) {
  console.log("  ✅ PASSED: Reset works\n");
} else {
  console.log("  ❌ FAILED: Reset failed\n");
  allTestsPassed = false;
}

// Final summary
console.log("=== Test Summary ===");
if (allTestsPassed) {
  console.log("✅ ALL TESTS PASSED");
  console.log("\nTest harness is ready for use!");
  process.exit(0);
} else {
  console.log("❌ SOME TESTS FAILED");
  console.log("\nReview the failures above.");
  process.exit(1);
}
